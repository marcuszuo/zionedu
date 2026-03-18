import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import OpenAI from "openai";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  authenticateUser,
  createSession,
  createUser,
  deleteDocumentForUser,
  deleteSession,
  deleteStudentForUser,
  getDocumentById,
  getUserBySessionToken,
  listDocumentsByUser,
  listStudentsByUser,
  saveDocumentForUser,
  saveStudentForUser,
  updateStudentForUser,
} from "./db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3210);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 10,
    fileSize: 15 * 1024 * 1024,
  },
});

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
    })
  : null;

app.use(express.json({ limit: "25mb" }));
app.use(express.static(__dirname));

app.use((req, _res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  req.user = token ? getUserBySessionToken(token) : null;
  req.sessionToken = token;
  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    openaiConfigured: Boolean(client),
    model: process.env.OPENAI_MODEL || "gpt-5",
    appBaseUrl: process.env.APP_BASE_URL || null,
  });
});

app.post("/api/auth/register", (req, res) => {
  try {
    const user = createUser(req.body || {});
    const token = createSession(user.id);
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "注册失败。" });
  }
});

app.post("/api/auth/login", (req, res) => {
  try {
    const user = authenticateUser(req.body || {});
    const token = createSession(user.id);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: error instanceof Error ? error.message : "登录失败。" });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    user: req.user,
    students: listStudentsByUser(req.user.id),
    documents: listDocumentsByUser(req.user.id),
  });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  deleteSession(req.sessionToken);
  res.json({ ok: true });
});

app.post("/api/profile/extract", requireAuth, upload.array("files", 10), async (req, res) => {
  try {
    const nickname = (req.body.nickname || "").trim() || "未命名学生";
    const files = req.files || [];

    if (files.length === 0) {
      return res.status(400).json({ error: "请至少上传一份学生资料。" });
    }

    const profile = client
      ? await extractProfileWithOpenAI({ nickname, files })
      : buildMockProfile({ nickname, files });

    const saved = saveStudentForUser(req.user.id, profile);

    res.json({
      studentKey: slugify(profile.displayName || nickname),
      profile: saved,
      source: client ? "openai" : "demo",
    });
  } catch (error) {
    console.error("profile extract failed", error);
    res.status(500).json({
      error: "学生建档失败，请稍后重试。",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post("/api/students/manual", requireAuth, (req, res) => {
  try {
    const saved = saveStudentForUser(req.user.id, req.body.profile || {});
    res.json({ profile: saved });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "保存学生失败。" });
  }
});

app.get("/api/students", requireAuth, (req, res) => {
  res.json({ students: listStudentsByUser(req.user.id) });
});

app.get("/api/documents", requireAuth, (req, res) => {
  res.json({ documents: listDocumentsByUser(req.user.id) });
});

app.get("/api/documents/:id", requireAuth, (req, res) => {
  const document = getDocumentById(req.user.id, req.params.id);
  if (!document) {
    return res.status(404).json({ error: "未找到该文稿。" });
  }
  res.json({ document });
});

app.delete("/api/documents/:id", requireAuth, (req, res) => {
  try {
    deleteDocumentForUser(req.user.id, req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : "删除文稿失败。" });
  }
});

app.patch("/api/students/:id", requireAuth, (req, res) => {
  try {
    const profile = updateStudentForUser(req.user.id, req.params.id, req.body.profile || {});
    res.json({ profile });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : "更新学生失败。" });
  }
});

app.delete("/api/students/:id", requireAuth, (req, res) => {
  try {
    deleteStudentForUser(req.user.id, req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(404).json({ error: error instanceof Error ? error.message : "删除学生失败。" });
  }
});

app.post("/api/writer/generate", requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    const result = client
      ? await generateWritingWithOpenAI(payload)
      : buildMockWriting(payload);

    saveDocumentForUser(req.user.id, {
      studentId: payload.studentProfile?.id || null,
      template: payload.template,
      mode: payload.mode,
      studentName: payload.studentProfile?.displayName || "未命名学生",
      title: result.title,
      subtitle: result.subtitle,
      content: result.content,
      aiScore: result.aiScore,
    });

    res.json(result);
  } catch (error) {
    console.error("generate failed", error);
    res.status(500).json({
      error: "文书生成失败，请稍后重试。",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.post("/api/writer/humanize", requireAuth, async (req, res) => {
  try {
    const payload = req.body || {};
    const result = client
      ? await humanizeWritingWithOpenAI(payload)
      : buildMockHumanized(payload);

    saveDocumentForUser(req.user.id, {
      studentId: payload.studentProfile?.id || null,
      template: payload.template,
      mode: "humanize",
      studentName: payload.studentProfile?.displayName || "未命名学生",
      title: result.title,
      subtitle: result.subtitle,
      content: result.content,
      aiScore: result.aiScore,
    });

    res.json(result);
  } catch (error) {
    console.error("humanize failed", error);
    res.status(500).json({
      error: "AI 痕迹优化失败，请稍后重试。",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`ZionApply running on http://localhost:${port}`);
});

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "请先登录。" });
  }
  next();
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || `student-${Date.now()}`;
}

function toDataUrl(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

function isPlainTextFile(file) {
  return (
    file.mimetype.startsWith("text/") ||
    /\.(txt|md|csv|json)$/i.test(file.originalname || "")
  );
}

function sanitizeArray(value, fallback) {
  return Array.isArray(value) && value.length > 0 ? value.slice(0, 6) : fallback;
}

function sanitizeProfile(profile, nickname) {
  const displayName = profile.displayName || nickname || "未命名学生";
  const toneMap = {
    positive: "ready",
    complete: "ready",
    success: "ready",
    warning: "pending",
    incomplete: "pending",
    review: "review",
    pending: "pending",
    ready: "ready",
  };

  return {
    displayName,
    applicationTrack: profile.applicationTrack || "待确认申请阶段",
    targetProgram: profile.targetProgram || "待补充目标专业 / 项目",
    statusLabel: profile.statusLabel || "待补充",
    statusTone: toneMap[String(profile.statusTone || "").toLowerCase()] || "review",
    tags: sanitizeArray(profile.tags, ["待识别", "待补充申请方向"]),
    summary:
      profile.summary ||
      "已创建学生档案，但材料信息仍不完整，建议补充成绩、经历、目标项目和推荐人背景。",
    highlights: sanitizeArray(profile.highlights, ["等待从上传材料中抽取核心亮点"]),
    evidence: sanitizeArray(profile.evidence, ["等待从上传材料中整理可验证素材"]),
    strategy: sanitizeArray(profile.strategy, ["建议先确认申请方向，再开始生成文书"]),
    tone: profile.tone || "真诚、有反思感",
    focus:
      profile.focus ||
      "请围绕学生的关键经历、项目成果、申请动机和目标项目匹配度展开写作。",
    recommenderRole: profile.recommenderRole || "授课教师 / 项目导师",
    relationshipDuration: profile.relationshipDuration || "1-2 年",
    recommendationEvidence:
      profile.recommendationEvidence ||
      "请补充推荐人亲自观察到的课程表现、项目协作、执行力与成长速度。",
  };
}

function buildMockProfile({ nickname, files }) {
  const fileNames = files.map((file) => file.originalname).slice(0, 3);
  return sanitizeProfile(
    {
      displayName: nickname,
      applicationTrack: "AI 智能建档 · 待顾问确认",
      targetProgram: "Media / Education / Business（根据材料待确认）",
      statusLabel: "已建档",
      statusTone: "ready",
      tags: [
        `${files.length} 份材料`,
        fileNames[0] ? `包含 ${fileNames[0]}` : "文档上传",
        "可继续生成文书",
      ],
      summary:
        "当前为演示建档结果。接入 OPENAI_API_KEY 后，系统会基于真实材料自动抽取成绩、经历、奖项、申请方向和推荐线索。",
      highlights: [
        "已识别学生基础资料和申请上下文",
        "可从上传文件中自动沉淀亮点素材",
        "适合直接进入 PS / RL / CV 生成流程",
      ],
      evidence: fileNames.length
        ? fileNames.map((name) => `已接收材料：${name}`)
        : ["等待上传更多可解析文件"],
      strategy: [
        "先补充目标专业和国家方向",
        "推荐信建议补充推荐人身份与观察场景",
        "文书生成前确认最强故事线",
      ],
    },
    nickname
  );
}

function buildMockWriting(payload) {
  const meta = getTemplateMeta(payload.template);
  const studentName = payload.studentProfile?.displayName || "该学生";
  const target = payload.targetProgram || payload.studentProfile?.targetProgram || "目标项目";
  const focus = payload.focus || payload.studentProfile?.focus || "关键经历与申请动机";
  const role = payload.recommenderRole || "课程导师";
  const duration = payload.relationshipDuration || "1-2 年";
  const evidence = payload.recommendationEvidence || "具体课程表现与项目协作例子";

  const content = {
    ps: [
      `${studentName} 的 PS 首段应从真实转折点切入，把兴趣发展写成具体行动，而不是泛泛而谈的热爱表达。`,
      `中段可围绕 ${focus} 展开，证明其已具备与 ${target} 匹配的能力、视角和成长轨迹。`,
      `结尾收束到项目匹配与未来目标，形成完整的申请叙事闭环。`,
    ],
    rl: [
      `作为 ${studentName} 的 ${role}，我在 ${duration} 的接触中最深刻的印象，是这位学生在执行力、判断力和合作意识上的稳定表现。`,
      `尤其在 ${evidence} 这一类场景中，这些能力并非停留在抽象评价，而是体现在具体行动和结果里。`,
      `因此，我相信该学生已经为 ${target} 所要求的学习强度和协作环境做好了准备。`,
    ],
    cv: [
      `${studentName} 的 CV 应优先按申请价值排序，而不是只按时间顺序罗列经历。`,
      `围绕 ${target}，建议把课程、项目、实习和产出重新分层，让最能体现 ${focus} 的内容排在前面。`,
      `简历尾部再补足语言、技能、奖项和作品链接，形成完整申请资料。`,
    ],
    pe: [
      `命题文书应先正面回应题目要求，再引出学生个人经历，避免和 PS 重复。`,
      `这篇补充文书可以以 ${focus} 为核心论据，把经历压缩成最有针对性的素材，服务 ${target} 的申请目标。`,
      `结尾再落回学校、项目或未来职业目标，增强回答的完成度。`,
    ],
    fw: [
      `自由创作模式不必受标准文书结构限制，但仍需围绕申请目标保持策略性。`,
      `可以从 ${focus} 出发，以更有个人风格的方式组织内容，同时让 ${target} 成为清晰的落点。`,
      `如果后续要转成正式申请文书，再把当前文本拆解为开头段、故事段和项目匹配段即可。`,
    ],
  };

  return {
    title: meta.title,
    subtitle: meta.subtitle,
    content: content[payload.template] || content.ps,
    aiScore: meta.aiScore,
    nextActions: [
      "继续补充学生档案中的缺失字段",
      "生成另一版语气或结构对比稿",
      "做一次 AI 痕迹优化后再导出",
    ],
  };
}

function buildMockHumanized(payload) {
  const original = Array.isArray(payload.content) ? payload.content : [payload.content].filter(Boolean);
  const content = (original.length > 0 ? original : buildMockWriting(payload).content).map((paragraph) =>
    String(paragraph)
      .replaceAll("应", "可以")
      .replaceAll("建议", "更适合")
      .replaceAll("因此", "也正因为如此")
  );

  return {
    title: "降 AI 痕迹完成",
    subtitle: "已对句式节奏和表达方式做自然化处理",
    content,
    aiScore: "AI率 6%",
  };
}

function getTemplateMeta(template) {
  const map = {
    ps: { title: "个人陈述 PS", subtitle: "围绕申请动机与成长轨迹生成个人陈述", aiScore: "AI率 18%" },
    rl: { title: "推荐信 RL", subtitle: "从推荐人视角生成可信、具体的推荐信", aiScore: "AI率 14%" },
    cv: { title: "简历 CV", subtitle: "按申请方向重组学生经历与成果", aiScore: "AI率 11%" },
    pe: { title: "命题文书 PE", subtitle: "针对补充题目生成结构化回应", aiScore: "AI率 16%" },
    fw: { title: "自由创作 FW", subtitle: "支持开放式写作指令和非标准结构", aiScore: "AI率 13%" },
  };
  return map[template] || map.ps;
}

function tryExtractJson(text) {
  const cleaned = String(text || "").trim();
  if (!cleaned) {
    return null;
  }
  const fenced = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  try {
    return JSON.parse(fenced);
  } catch {
    const match = fenced.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function toParagraphs(text, fallback) {
  const raw = String(text || "").trim();
  if (!raw) {
    return fallback;
  }

  const lines = raw
    .split(/\n{2,}|\r\n\r\n/)
    .map((line) => line.replace(/^[\-\*\d\.\)\s]+/, "").trim())
    .filter(Boolean);

  if (lines.length > 0) {
    return lines.slice(0, 6);
  }

  return fallback;
}

function jsonLikeString(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractJsonLikeWriting(text) {
  const raw = String(text || "");
  if (!raw) {
    return null;
  }

  const titleMatch = raw.match(/"title"\s*:\s*"([\s\S]*?)"/);
  const subtitleMatch = raw.match(/"subtitle"\s*:\s*"([\s\S]*?)"/);
  const arrayContentMatch = raw.match(/"content"\s*:\s*\[([\s\S]*)/);
  const stringContentMatch = raw.match(/"content"\s*:\s*"([\s\S]*?)"(?:,|\s*\})/);
  const aiScoreMatch = raw.match(/"aiScore"\s*:\s*("?)([\d\.%A-Za-z\u4e00-\u9fa5 ]+)\1/);

  let content = null;

  if (arrayContentMatch) {
    const section = arrayContentMatch[1].split(/"aiScore"\s*:/)[0];
    content = [...section.matchAll(/"((?:\\.|[^"])*)"/g)]
      .map((item) => jsonLikeString(`"${item[1]}"`))
      .filter((item) => item && !String(item).startsWith("subtitle") && !String(item).startsWith("title"));
  } else if (stringContentMatch) {
    content = toParagraphs(jsonLikeString(`"${stringContentMatch[1]}"`), []);
  }

  if (!titleMatch && !subtitleMatch && (!content || content.length === 0)) {
    return null;
  }

  return {
    title: titleMatch ? jsonLikeString(`"${titleMatch[1]}"`) : null,
    subtitle: subtitleMatch ? jsonLikeString(`"${subtitleMatch[1]}"`) : null,
    content,
    aiScore: aiScoreMatch ? aiScoreMatch[2] : null,
  };
}

function profileFromPlainText(text, nickname) {
  const lines = toParagraphs(text, []);
  return sanitizeProfile(
    {
      displayName: nickname,
      applicationTrack: "AI 建档结果",
      targetProgram: "待从材料中进一步确认",
      statusLabel: "待确认",
      statusTone: "review",
      tags: ["模型返回非结构化文本", "建议人工复核"],
      summary: lines[0] || "模型返回了非结构化建档结果，建议人工确认后再继续使用。",
      highlights: lines.slice(0, 3),
      evidence: lines.slice(1, 4),
      strategy: ["先人工确认结构化字段", "再开始生成文书"],
    },
    nickname
  );
}

async function extractProfileWithOpenAI({ nickname, files }) {
  const content = files.map((file) =>
    file.mimetype.startsWith("image/")
      ? { type: "input_image", image_url: toDataUrl(file) }
      : isPlainTextFile(file)
        ? { type: "input_text", text: `文件名：${file.originalname}\n\n${file.buffer.toString("utf8")}` }
        : { type: "input_file", filename: file.originalname, file_data: toDataUrl(file) }
  );

  content.push({
    type: "input_text",
    text: `请从这些学生申请材料中提取结构化档案。昵称是：${nickname}。只输出 JSON，不要加 markdown。`,
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "你是留学申请顾问团队的建档助手。请从上传材料中提取学生档案，输出 JSON，字段包括 displayName, applicationTrack, targetProgram, statusLabel, statusTone, tags, summary, highlights, evidence, strategy, tone, focus, recommenderRole, relationshipDuration, recommendationEvidence。数组字段返回字符串数组，缺失信息用保守描述，不要编造具体分数或奖项。",
          },
        ],
      },
      { role: "user", content },
    ],
    max_output_tokens: 2200,
  });

  const parsed = tryExtractJson(response.output_text);
  return parsed ? sanitizeProfile(parsed, nickname) : profileFromPlainText(response.output_text, nickname);
}

async function generateWritingWithOpenAI(payload) {
  const meta = getTemplateMeta(payload.template);
  const studentProfile = payload.studentProfile || {};
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "你是资深留学文书顾问。请根据学生档案和写作要求输出 JSON，字段包括 title, subtitle, content, aiScore, nextActions。content 必须是字符串数组。写作要真实、具体、有申请策略，不要空泛，也不要输出 markdown。",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(
              {
                mode: payload.mode || "draft",
                template: payload.template,
                targetProgram: payload.targetProgram,
                tone: payload.tone,
                focus: payload.focus,
                recommenderRole: payload.recommenderRole,
                relationshipDuration: payload.relationshipDuration,
                recommendationEvidence: payload.recommendationEvidence,
                studentProfile,
                templateMeta: meta,
              },
              null,
              2
            ),
          },
        ],
      },
    ],
    max_output_tokens: 2600,
  });

  const parsed = tryExtractJson(response.output_text);
  const extracted = extractJsonLikeWriting(response.output_text);
  const content =
    Array.isArray(parsed?.content)
      ? parsed.content
      : typeof parsed?.content === "string"
        ? toParagraphs(parsed.content, [])
        : Array.isArray(extracted?.content)
          ? extracted.content
          : toParagraphs(response.output_text, buildMockWriting(payload).content);

  return {
    title: parsed?.title || extracted?.title || meta.title,
    subtitle: parsed?.subtitle || extracted?.subtitle || meta.subtitle,
    content: sanitizeArray(content, buildMockWriting(payload).content),
    aiScore: parsed?.aiScore || extracted?.aiScore || meta.aiScore,
    nextActions: sanitizeArray(parsed?.nextActions, ["继续补充亮点细节", "再生成一版对比稿"]),
  };
}

async function humanizeWritingWithOpenAI(payload) {
  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "你是留学文书润色编辑。请在不改变事实和立场的前提下，把文书改得更自然、更像真人书写，降低模板味和 AI 痕迹。输出 JSON，字段包括 title, subtitle, content, aiScore。",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify(payload, null, 2),
          },
        ],
      },
    ],
    max_output_tokens: 2200,
  });

  const parsed = tryExtractJson(response.output_text);
  const extracted = extractJsonLikeWriting(response.output_text);
  const content =
    Array.isArray(parsed?.content)
      ? parsed.content
      : typeof parsed?.content === "string"
        ? toParagraphs(parsed.content, [])
        : Array.isArray(extracted?.content)
          ? extracted.content
          : toParagraphs(response.output_text, buildMockHumanized(payload).content);

  return {
    title: parsed?.title || extracted?.title || "降 AI 痕迹完成",
    subtitle: parsed?.subtitle || extracted?.subtitle || "已对当前文稿做自然化改写",
    content: sanitizeArray(content, buildMockHumanized(payload).content),
    aiScore: parsed?.aiScore || extracted?.aiScore || "AI率 6%",
  };
}
