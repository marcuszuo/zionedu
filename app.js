const API_KEY_STORAGE = "zionapply_api_key";
const API_BASE_STORAGE = "zionapply_api_base";
const API_MODEL_STORAGE = "zionapply_api_model";
const memoryStorage = {};

const modalBackdrop = document.getElementById("modal-backdrop");
const openModalButtons = [
  document.getElementById("open-modal-btn"),
  ...document.querySelectorAll("[data-open-student-modal]"),
];
const closeModalButtons = [
  document.getElementById("close-modal-btn"),
  document.getElementById("cancel-modal-btn"),
];
const createStudentButton = document.getElementById("create-student-btn");
const studentNameInput = document.getElementById("student-name-input");
const studentTrackInput = document.getElementById("student-track-input");
const studentProgramField = document.getElementById("student-program-field");
const studentSummaryInput = document.getElementById("student-summary-input");
const studentFocusField = document.getElementById("student-focus-field");
const studentTagsInput = document.getElementById("student-tags-input");
const studentHighlightsInput = document.getElementById("student-highlights-input");
const studentEvidenceInput = document.getElementById("student-evidence-input");
const studentStrategyInput = document.getElementById("student-strategy-input");
const studentList = document.getElementById("student-list");
const templateCards = document.querySelectorAll(".template-card");
const modeNavItems = document.querySelectorAll(".nav-item[data-mode]");
const outputBody = document.getElementById("output-body");
const outputTitle = document.getElementById("output-title");
const outputSubtitle = document.getElementById("output-subtitle");
const programInput = document.getElementById("program-input");
const toneSelect = document.getElementById("tone-select");
const focusInput = document.getElementById("focus-input");
const generateDraftButton = document.getElementById("generate-draft-btn");
const generateOutlineButton = document.getElementById("generate-outline-btn");
const rlFields = document.getElementById("rl-fields");
const recommenderRole = document.getElementById("recommender-role");
const relationshipDuration = document.getElementById("relationship-duration");
const recommendationEvidence = document.getElementById("recommendation-evidence");
const humanizeButton = document.getElementById("humanize-btn");
const aiScore = document.getElementById("ai-score");
const exportButton = document.getElementById("export-btn");
const heroStatus = document.getElementById("hero-status");
const insightHighlights = document.getElementById("insight-highlights");
const insightEvidence = document.getElementById("insight-evidence");
const insightStrategy = document.getElementById("insight-strategy");
const setupStatus = document.getElementById("setup-status");
const apiKeyInput = document.getElementById("api-key-input");
const apiBaseInput = document.getElementById("api-base-input");
const apiModelInput = document.getElementById("api-model-input");
const saveApiConfigButton = document.getElementById("save-api-config-btn");
const clearApiConfigButton = document.getElementById("clear-api-config-btn");
const topbarStatus = document.getElementById("topbar-status");
const editStudentButton = document.getElementById("edit-student-btn");
const deleteStudentButton = document.getElementById("delete-student-btn");
const studentEditBackdrop = document.getElementById("student-edit-backdrop");
const closeEditStudentButton = document.getElementById("close-edit-student-btn");
const cancelEditStudentButton = document.getElementById("cancel-edit-student-btn");
const saveEditStudentButton = document.getElementById("save-edit-student-btn");
const editStudentNameInput = document.getElementById("edit-student-name");
const editStudentTrackInput = document.getElementById("edit-student-track");
const editStudentProgramInput = document.getElementById("edit-student-program");
const editStudentSummaryInput = document.getElementById("edit-student-summary");
const editStudentFocusInput = document.getElementById("edit-student-focus");
const editStudentTagsInput = document.getElementById("edit-student-tags");
const trialBadge = document.getElementById("trial-badge");
const trimTemplates = document.querySelectorAll("[data-trial-hidden]");
const docList = document.getElementById("doc-list");

const templateMeta = {
  ps: { title: "个人陈述 PS", subtitle: "围绕成长轨迹、动机与项目匹配写首版 PS", aiScore: "试用输出" },
  rl: { title: "推荐信 RL", subtitle: "以推荐人视角输出具体可信的推荐信", aiScore: "试用输出" },
};

const seedStudents = {
  emily: {
    id: "emily",
    displayName: "Emily Zhang",
    applicationTrack: "美本申请",
    targetProgram: "Digital Media / Interactive Storytelling",
    statusLabel: "可生成",
    statusTone: "ready",
    tags: ["GPA 3.82", "IELTS 7.5", "纪录片", "交互叙事"],
    summary: "擅长把影像表达转化为数字叙事，申请故事线完整，适合先试 PS 或推荐信。",
    highlights: ["纪录片拍摄转向数字叙事", "能统筹内容项目并推进协作", "作品关注社会议题与互动体验"],
    evidence: ["校内短片获奖", "学生媒体 campaign 项目", "创意内容方向 2 段实习"],
    strategy: ["PS 先写转向契机", "突出跨学科创作能力", "RL 要强调执行力和带团队能力"],
    tone: "真诚、有反思感",
    focus: "突出她从纪录片拍摄走向数字叙事的转变，强调跨学科能力、项目影响力，以及与创意科技项目的匹配。",
    recommenderRole: "影视叙事课程导师",
    relationshipDuration: "2 年",
    recommendationEvidence: "她在课程项目中独立完成选题、采访、后期剪辑，并主动协调组员完成拍摄排期。",
  },
};

const state = {
  students: cloneData(seedStudents),
  studentOrder: Object.keys(seedStudents),
  selectedStudent: "emily",
  selectedTemplate: "ps",
  currentDocument: [
    "这里会显示 AI 生成的内容。先在右上角填入你的 PoloAPI 信息，再点击“生成初稿”即可开始试用。",
  ],
};

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function getStoredValue(key, fallback = "") {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (_error) {
    return memoryStorage[key] || fallback;
  }
}

function setStoredValue(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (_error) {
    memoryStorage[key] = value;
  }
}

function removeStoredValue(key) {
  try {
    localStorage.removeItem(key);
  } catch (_error) {
    delete memoryStorage[key];
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `student-${Date.now()}`;
}

function splitList(value) {
  return String(value || "")
    .split(/[\n,，、；;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function setHeroStatus(message, variant = "info") {
  if (!heroStatus) {
    return;
  }
  heroStatus.textContent = message;
  const palette = {
    info: ["rgba(16, 183, 222, 0.1)", "#0985b7"],
    success: ["rgba(31, 157, 107, 0.12)", "#1f9d6b"],
    warning: ["rgba(216, 154, 29, 0.14)", "#b4780d"],
    danger: ["rgba(214, 69, 69, 0.12)", "#b33939"],
  };
  const [bg, fg] = palette[variant] || palette.info;
  heroStatus.style.background = bg;
  heroStatus.style.color = fg;
}

function getSelectedProfile() {
  return state.students[state.selectedStudent] || state.students[state.studentOrder[0]];
}

function getApiConfig() {
  return {
    apiKey: getStoredValue(API_KEY_STORAGE, ""),
    baseUrl: getStoredValue(API_BASE_STORAGE, "https://api.newapi.life/v1"),
    model: getStoredValue(API_MODEL_STORAGE, "gpt-5"),
  };
}

function renderApiConfig() {
  const config = getApiConfig();
  apiKeyInput.value = config.apiKey;
  apiBaseInput.value = config.baseUrl;
  apiModelInput.value = config.model;
  if (setupStatus) {
    setupStatus.textContent = config.apiKey
      ? "已保存浏览器本地 API 配置，可直接生成。"
      : "未保存 API Key。静态站上线后，需要你先在本浏览器里填一次才能生成。";
  }
  topbarStatus.textContent = config.apiKey ? "API 已保存" : "等待保存 API";
  saveApiConfigButton.textContent = config.apiKey ? "已保存" : "保存 API";
}

function saveApiConfig() {
  const apiKey = apiKeyInput.value.trim();
  const baseUrl = apiBaseInput.value.trim().replace(/\/+$/, "");
  const model = apiModelInput.value.trim() || "gpt-5";

  if (!apiKey) {
    if (setupStatus) {
      setupStatus.textContent = "请先输入 API Key。";
    }
    topbarStatus.textContent = "请先输入 API Key";
    return;
  }

  try {
    setStoredValue(API_KEY_STORAGE, apiKey);
    setStoredValue(API_BASE_STORAGE, baseUrl || "https://api.newapi.life/v1");
    setStoredValue(API_MODEL_STORAGE, model);
    renderApiConfig();
    setHeroStatus("API 配置已保存，本次试用可以直接生成。", "success");
    topbarStatus.textContent = "API 已保存";
    saveApiConfigButton.textContent = "已保存";
  } catch (error) {
    if (setupStatus) {
      setupStatus.textContent = error.message || "保存失败，请检查浏览器隐私设置。";
    }
    setHeroStatus("保存 API 配置失败。", "danger");
    topbarStatus.textContent = "保存失败";
  }
}

function clearApiConfig() {
  removeStoredValue(API_KEY_STORAGE);
  removeStoredValue(API_BASE_STORAGE);
  removeStoredValue(API_MODEL_STORAGE);
  renderApiConfig();
  setHeroStatus("已清除浏览器本地 API 配置。", "warning");
  topbarStatus.textContent = "已清除";
  saveApiConfigButton.textContent = "保存 API";
}

function renderInsightList(element, items) {
  element.innerHTML = (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderInsights(profile) {
  renderInsightList(insightHighlights, profile.highlights || []);
  renderInsightList(insightEvidence, profile.evidence || []);
  renderInsightList(insightStrategy, profile.strategy || []);
}

function renderStudentList() {
  studentList.innerHTML = state.studentOrder
    .map((key) => {
      const student = state.students[key];
      return `
        <article class="student-card ${key === state.selectedStudent ? "active" : ""}" data-student="${escapeHtml(key)}">
          <div class="student-topline">
            <div>
              <h3>${escapeHtml(student.displayName)}</h3>
              <p>${escapeHtml(student.applicationTrack)} · ${escapeHtml(student.targetProgram)}</p>
            </div>
            <span class="status-badge ${escapeHtml(student.statusTone || "review")}">${escapeHtml(student.statusLabel || "待确认")}</span>
          </div>
          <div class="tag-row">${(student.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>
          <p class="student-summary">${escapeHtml(student.summary || "")}</p>
        </article>
      `;
    })
    .join("");

  studentList.querySelectorAll(".student-card").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedStudent = card.dataset.student;
      syncAll();
      setHeroStatus(`已切换到 ${getSelectedProfile().displayName} 的试用档案。`, "info");
    });
  });
}

function renderOutput(result) {
  const meta = templateMeta[state.selectedTemplate];
  outputTitle.textContent = result.title || meta.title;
  outputSubtitle.textContent = result.subtitle || meta.subtitle;
  aiScore.textContent = result.aiScore || meta.aiScore;
  state.currentDocument = Array.isArray(result.content) ? result.content : [];
  outputBody.innerHTML = state.currentDocument.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function syncFormWithStudent() {
  const profile = getSelectedProfile();
  programInput.value = profile.targetProgram || "";
  toneSelect.value = profile.tone || "真诚、有反思感";
  focusInput.value = profile.focus || "";
  recommenderRole.value = profile.recommenderRole || "授课教师 / 项目导师";
  relationshipDuration.value = profile.relationshipDuration || "1-2 年";
  recommendationEvidence.value = profile.recommendationEvidence || "";
}

function syncTemplateState() {
  const isRl = state.selectedTemplate === "rl";
  rlFields.classList.toggle("hidden", !isRl);
  templateCards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.template === state.selectedTemplate);
  });
  modeNavItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.mode === state.selectedTemplate);
  });
  window.location.hash = `writer/${state.selectedTemplate}`;
}

function syncAll() {
  renderStudentList();
  renderInsights(getSelectedProfile());
  syncFormWithStudent();
  syncTemplateState();
}

function openModal() {
  modalBackdrop.classList.remove("hidden");
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
}

function openStudentEditor() {
  const profile = getSelectedProfile();
  editStudentNameInput.value = profile.displayName || "";
  editStudentTrackInput.value = profile.applicationTrack || "";
  editStudentProgramInput.value = profile.targetProgram || "";
  editStudentSummaryInput.value = profile.summary || "";
  editStudentFocusInput.value = profile.focus || "";
  editStudentTagsInput.value = Array.isArray(profile.tags) ? profile.tags.join("，") : "";
  studentEditBackdrop.classList.remove("hidden");
}

function closeStudentEditor() {
  studentEditBackdrop.classList.add("hidden");
}

function buildStudentFromModal() {
  const name = studentNameInput.value.trim() || "未命名学生";
  const key = slugify(name);
  return {
    id: key,
    displayName: name,
    applicationTrack: studentTrackInput.value.trim() || "待补充申请阶段",
    targetProgram: studentProgramField.value.trim() || "待补充申请方向",
    statusLabel: "可生成",
    statusTone: "ready",
    tags: splitList(studentTagsInput.value),
    summary: studentSummaryInput.value.trim() || "已创建试用档案，可以直接开始生成 PS 或推荐信。",
    highlights: splitList(studentHighlightsInput.value),
    evidence: splitList(studentEvidenceInput.value),
    strategy: splitList(studentStrategyInput.value),
    tone: "真诚、有反思感",
    focus: studentFocusField.value.trim() || "请突出学生的成长线索、项目证据和申请项目匹配度。",
    recommenderRole: "授课教师 / 项目导师",
    relationshipDuration: "1-2 年",
    recommendationEvidence: "请补充推荐人视角下最有说服力的一两个观察事例。",
  };
}

function resetModalForm() {
  studentNameInput.value = "";
  studentTrackInput.value = "";
  studentProgramField.value = "";
  studentSummaryInput.value = "";
  studentFocusField.value = "";
  studentTagsInput.value = "";
  studentHighlightsInput.value = "";
  studentEvidenceInput.value = "";
  studentStrategyInput.value = "";
}

function createStudent() {
  createStudentButton.disabled = true;
  createStudentButton.textContent = "处理中...";

  try {
    const profile = buildStudentFromModal();
    state.students[profile.id] = profile;
    state.studentOrder = [profile.id, ...state.studentOrder.filter((item) => item !== profile.id)];
    state.selectedStudent = profile.id;
    syncAll();
    closeModal();
    resetModalForm();
    setHeroStatus(`已创建 ${profile.displayName} 的试用档案。`, "success");
  } finally {
    createStudentButton.disabled = false;
    createStudentButton.textContent = "确认创建";
  }
}

function saveStudentEdits() {
  const profile = getSelectedProfile();
  profile.displayName = editStudentNameInput.value.trim() || profile.displayName;
  profile.applicationTrack = editStudentTrackInput.value.trim() || profile.applicationTrack;
  profile.targetProgram = editStudentProgramInput.value.trim() || profile.targetProgram;
  profile.summary = editStudentSummaryInput.value.trim() || profile.summary;
  profile.focus = editStudentFocusInput.value.trim() || profile.focus;
  profile.tags = splitList(editStudentTagsInput.value);
  syncAll();
  closeStudentEditor();
  setHeroStatus("已更新当前试用档案。", "success");
}

function deleteCurrentStudent() {
  if (state.studentOrder.length === 1) {
    setHeroStatus("至少保留一个试用档案，方便继续生成。", "warning");
    return;
  }
  const profile = getSelectedProfile();
  if (!window.confirm(`确认删除 ${profile.displayName} 吗？`)) {
    return;
  }
  delete state.students[profile.id];
  state.studentOrder = state.studentOrder.filter((item) => item !== profile.id);
  state.selectedStudent = state.studentOrder[0];
  syncAll();
  setHeroStatus("已删除当前试用档案。", "success");
}

function collectWriterPayload(requestMode) {
  return {
    requestMode,
    template: state.selectedTemplate,
    studentProfile: getSelectedProfile(),
    targetProgram: programInput.value.trim(),
    tone: toneSelect.value,
    focus: focusInput.value.trim(),
    recommenderRole: recommenderRole.value.trim(),
    relationshipDuration: relationshipDuration.value.trim(),
    recommendationEvidence: recommendationEvidence.value.trim(),
  };
}

function buildSystemPrompt() {
  return [
    "你是 ZionApply 的资深留学文书顾问。",
    "输出语言默认与用户输入一致。",
    "不要使用空洞套话，不要泛泛而谈。",
    "必须基于学生背景、目标项目、证据和写作任务生成具体内容。",
    "输出使用自然段，不要加 markdown 标题或项目符号，除非任务明确要求大纲。",
  ].join("\n");
}

function buildUserPrompt(payload) {
  const profile = payload.studentProfile;
  const common = [
    `任务：${payload.requestMode === "outline" ? "生成写作大纲" : "生成完整文稿"}`,
    `模板：${payload.template === "ps" ? "个人陈述 PS" : "推荐信 RL"}`,
    `学生姓名：${profile.displayName}`,
    `申请阶段：${profile.applicationTrack}`,
    `目标项目：${payload.targetProgram || profile.targetProgram}`,
    `写作语气：${payload.tone}`,
    `学生摘要：${profile.summary}`,
    `亮点：${(profile.highlights || []).join("；")}`,
    `证据：${(profile.evidence || []).join("；")}`,
    `申请策略：${(profile.strategy || []).join("；")}`,
    `重点强调：${payload.focus || profile.focus}`,
  ];

  if (payload.template === "rl") {
    common.push(`推荐人身份：${payload.recommenderRole}`);
    common.push(`认识时长：${payload.relationshipDuration}`);
    common.push(`推荐信重点事例：${payload.recommendationEvidence}`);
    common.push("请用推荐人第一人称写作，避免像学生自述。");
  } else {
    common.push("请用第一人称写作，形成完整个人陈述。");
  }

  if (payload.requestMode === "outline") {
    common.push("请输出 4 到 6 段结构大纲，每段说明作用和要写的证据。");
  } else {
    common.push("请输出一版可直接继续修改的首稿，长度控制在 600 到 850 英文单词左右。");
  }

  return common.join("\n");
}

async function runCompletion(messages) {
  const config = getApiConfig();
  if (!config.apiKey) {
    throw new Error("请先在右上角保存 API Key。");
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages,
      temperature: 0.8,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || data.error || "AI 请求失败，请检查 API 配置或稍后重试。");
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("模型没有返回可用内容。");
  }
  return content;
}

function textToParagraphs(text) {
  return String(text)
    .split(/\n{2,}/)
    .map((item) => item.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

async function generateDocument(mode) {
  const payload = collectWriterPayload(mode);
  const label = mode === "outline" ? "生成大纲" : "生成初稿";
  const button = mode === "outline" ? generateOutlineButton : generateDraftButton;
  const original = button.textContent;
  button.disabled = true;
  button.textContent = "生成中...";

  try {
    const content = await runCompletion([
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserPrompt(payload) },
    ]);
    renderOutput({
      title: templateMeta[state.selectedTemplate].title,
      subtitle: mode === "outline" ? "AI 已生成结构大纲" : templateMeta[state.selectedTemplate].subtitle,
      aiScore: "实时生成",
      content: textToParagraphs(content),
    });
    setHeroStatus(`${label}完成，可以继续人工修改或点“降低 AI 痕迹”。`, "success");
  } catch (error) {
    setHeroStatus(error.message || "生成失败。", "danger");
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

async function humanizeDocument() {
  if (!state.currentDocument.length) {
    setHeroStatus("当前还没有可优化的文稿。", "warning");
    return;
  }

  const original = humanizeButton.textContent;
  humanizeButton.disabled = true;
  humanizeButton.textContent = "优化中...";

  try {
    const content = await runCompletion([
      {
        role: "system",
        content: [
          "你是留学文书润色顾问。",
          "请在不改变事实和结构主线的前提下，让文本更像真人写作。",
          "减少模板味、均匀句式和过度工整表达。",
        ].join("\n"),
      },
      {
        role: "user",
        content: `请润色下面这篇文书，保留原意但让表达更自然：\n\n${state.currentDocument.join("\n\n")}`,
      },
    ]);
    renderOutput({
      title: `${templateMeta[state.selectedTemplate].title} · 优化版`,
      subtitle: "已完成一次自然化改写",
      aiScore: "已优化",
      content: textToParagraphs(content),
    });
    setHeroStatus("已完成自然化改写。", "success");
  } catch (error) {
    setHeroStatus(error.message || "优化失败。", "danger");
  } finally {
    humanizeButton.disabled = false;
    humanizeButton.textContent = original;
  }
}

function exportDocument() {
  if (!state.currentDocument.length) {
    setHeroStatus("当前没有可导出的内容。", "warning");
    return;
  }

  const blob = new Blob([state.currentDocument.join("\n\n")], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `zionapply-${state.selectedTemplate}-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function initializeFromHash() {
  const modeFromHash = window.location.hash.replace(/^#writer\//, "");
  if (modeFromHash && templateMeta[modeFromHash]) {
    state.selectedTemplate = modeFromHash;
  }
}

function initializeTrialUi() {
  trialBadge.textContent = "Static Trial";
  docList.innerHTML = '<p class="empty-copy">静态试用版不保存历史文稿，建议生成后立即导出。</p>';
  trimTemplates.forEach((element) => element.classList.add("hidden"));
}

openModalButtons.forEach((button) => button?.addEventListener("click", openModal));
closeModalButtons.forEach((button) => button?.addEventListener("click", closeModal));
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});
closeEditStudentButton.addEventListener("click", closeStudentEditor);
cancelEditStudentButton.addEventListener("click", closeStudentEditor);
studentEditBackdrop.addEventListener("click", (event) => {
  if (event.target === studentEditBackdrop) {
    closeStudentEditor();
  }
});
saveApiConfigButton.addEventListener("click", saveApiConfig);
clearApiConfigButton.addEventListener("click", clearApiConfig);
createStudentButton.addEventListener("click", createStudent);
saveEditStudentButton.addEventListener("click", saveStudentEdits);
editStudentButton.addEventListener("click", openStudentEditor);
deleteStudentButton.addEventListener("click", deleteCurrentStudent);
generateDraftButton.addEventListener("click", () => generateDocument("draft"));
generateOutlineButton.addEventListener("click", () => generateDocument("outline"));
humanizeButton.addEventListener("click", humanizeDocument);
exportButton.addEventListener("click", exportDocument);
templateCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!templateMeta[card.dataset.template]) {
      return;
    }
    state.selectedTemplate = card.dataset.template;
    syncAll();
  });
});
modeNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (!templateMeta[item.dataset.mode]) {
      return;
    }
    state.selectedTemplate = item.dataset.mode;
    syncAll();
  });
});
window.addEventListener("hashchange", () => {
  initializeFromHash();
  syncTemplateState();
});

initializeFromHash();
initializeTrialUi();
renderApiConfig();
renderOutput({
  title: templateMeta.ps.title,
  subtitle: "先配置 API，再开始试用 PS / RL 生成",
  aiScore: "Static Trial",
  content: state.currentDocument,
});
syncAll();
setHeroStatus("静态试用版已就绪，适合先挂到 GitHub Pages 进行试用。", "info");
