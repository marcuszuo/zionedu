const AUTH_TOKEN_KEY = "edupro_auth_token";

const modalBackdrop = document.getElementById("modal-backdrop");
const authBackdrop = document.getElementById("auth-backdrop");
const openModalButtons = [
  document.getElementById("open-modal-btn"),
  document.getElementById("inline-open-modal-btn"),
];
const closeModalButtons = [
  document.getElementById("close-modal-btn"),
  document.getElementById("cancel-modal-btn"),
];
const smartToggle = document.getElementById("smart-toggle");
const fileInput = document.getElementById("file-input");
const uploadList = document.getElementById("upload-list");
const dropzone = document.querySelector(".dropzone");
const createStudentButton = document.getElementById("create-student-btn");
const studentNameInput = document.getElementById("student-name-input");
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
const docList = document.getElementById("doc-list");
const userChip = document.getElementById("user-chip");
const logoutButton = document.getElementById("logout-btn");
const refreshDocsButton = document.getElementById("refresh-docs-btn");
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

const authTabs = document.querySelectorAll(".auth-tab");
const authNameField = document.getElementById("auth-name-field");
const authNameInput = document.getElementById("auth-name-input");
const authEmailInput = document.getElementById("auth-email-input");
const authPasswordInput = document.getElementById("auth-password-input");
const authSubmitButton = document.getElementById("auth-submit-btn");
const authStatus = document.getElementById("auth-status");

const templateMeta = {
  ps: { title: "个人陈述 PS", subtitle: "结合学生档案内容输出首版 PS", aiScore: "AI率 18%" },
  rl: { title: "推荐信 RL", subtitle: "基于推荐人视角输出可信、具体的推荐信", aiScore: "AI率 14%" },
  cv: { title: "简历 CV", subtitle: "围绕申请方向自动重组学生经历与成果", aiScore: "AI率 11%" },
  pe: { title: "命题文书 PE", subtitle: "针对补充题目生成结构清晰、针对性强的回应", aiScore: "AI率 16%" },
  fw: { title: "自由创作 FW", subtitle: "按自定义指令生成非标准化的申请文书内容", aiScore: "AI率 13%" },
};

const seedStudents = {
  emily: {
    displayName: "Emily Zhang",
    applicationTrack: "美本申请",
    targetProgram: "Digital Media / Interactive Storytelling",
    statusLabel: "档案完整",
    statusTone: "ready",
    tags: ["GPA 3.82", "IELTS 7.5", "3 段实习", "影像项目"],
    summary: "AI 已提取教育背景、活动经历、奖项、目标院校偏好，可直接进入文书生成。",
    highlights: ["纪录片拍摄与数字叙事转向", "跨媒体项目协调与表达能力", "作品有明确社会议题视角"],
    evidence: ["校内短片获奖", "学生媒体 campaign 项目", "2 段内容/创意相关实习"],
    strategy: ["避免只写热爱传媒", "强化交互叙事与创意科技结合", "推荐信需突出协作与执行力"],
    tone: "真诚、有反思感",
    focus: "请突出她从纪录片拍摄到数字叙事方向的转变，强调跨学科能力、项目影响力，以及为什么适合申请偏创意科技的项目。",
    recommenderRole: "影视叙事课程导师",
    relationshipDuration: "2 年",
    recommendationEvidence: "请写出她在课程项目中如何独立完成纪录片策划、采访和后期剪辑，同时能带动组员协作推进项目。",
  },
};

const state = {
  authMode: "login",
  token: localStorage.getItem(AUTH_TOKEN_KEY) || "",
  user: null,
  uploadedFiles: [],
  students: { ...seedStudents },
  studentOrder: Object.keys(seedStudents),
  selectedStudent: "emily",
  selectedTemplate: "ps",
  documents: [],
  currentDocument: [],
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setHeroStatus(message, variant = "info") {
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

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.token) {
    headers.set("Authorization", `Bearer ${state.token}`);
  }
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      throw new Error("登录状态已失效，请重新登录。");
    }
    throw new Error(data.error || "请求失败");
  }
  return data;
}

function renderFiles() {
  uploadList.innerHTML = "";
  state.uploadedFiles.forEach((file) => {
    const li = document.createElement("li");
    li.textContent = `${file.name} · ${Math.max(1, Math.round(file.size / 1024))} KB`;
    uploadList.appendChild(li);
  });
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
      setHeroStatus(`已切换到 ${getSelectedProfile().displayName} 的学生档案。`, "info");
    });
  });
}

function renderDocuments() {
  if (!state.documents.length) {
    docList.innerHTML = '<p class="empty-copy">还没有历史文稿，先生成一版试试。</p>';
    return;
  }

  docList.innerHTML = state.documents
    .slice(0, 8)
    .map(
      (doc) => `
        <article class="doc-item" data-document-id="${escapeHtml(doc.id)}">
          <strong>${escapeHtml(doc.title || "未命名文稿")}</strong>
          <span>${escapeHtml(doc.studentName || "未命名学生")} · ${escapeHtml(doc.template || "文稿")} · ${escapeHtml(doc.aiScore || "")}</span>
          <button class="text-btn danger-text-btn" data-delete-document-id="${escapeHtml(doc.id)}">删除</button>
        </article>
      `
    )
    .join("");

  docList.querySelectorAll(".doc-item").forEach((item) => {
    item.addEventListener("click", async () => {
      try {
        const data = await apiFetch(`/api/documents/${item.dataset.documentId}`);
        renderOutput(data.document);
        setHeroStatus("已打开历史文稿详情。", "success");
      } catch (error) {
        setHeroStatus(error.message || "打开文稿失败。", "danger");
      }
    });
  });

  docList.querySelectorAll("[data-delete-document-id]").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      if (!window.confirm("确认删除这篇历史文稿吗？")) {
        return;
      }
      try {
        await apiFetch(`/api/documents/${button.dataset.deleteDocumentId}`, { method: "DELETE" });
        await refreshDocuments();
        setHeroStatus("历史文稿已删除。", "success");
      } catch (error) {
        setHeroStatus(error.message || "删除文稿失败。", "danger");
      }
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
  recommendationEvidence.value = Array.isArray(profile.recommendationEvidence)
    ? profile.recommendationEvidence.join("；")
    : profile.recommendationEvidence || "";
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
  renderDocuments();
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
  editStudentTagsInput.value = Array.isArray(profile.tags) ? profile.tags.join("，") : profile.tags || "";
  studentEditBackdrop.classList.remove("hidden");
}

function closeStudentEditor() {
  studentEditBackdrop.classList.add("hidden");
}

function handleFiles(files) {
  [...files].forEach((file) => state.uploadedFiles.push(file));
  renderFiles();
}

function setAuthMode(mode) {
  state.authMode = mode;
  authTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.authMode === mode);
  });
  authNameField.classList.toggle("hidden", mode !== "register");
  authSubmitButton.textContent = mode === "register" ? "注册并进入" : "登录并进入";
}

function showAuth() {
  authBackdrop.classList.remove("hidden");
}

function hideAuth() {
  authBackdrop.classList.add("hidden");
}

function clearAuth() {
  state.token = "";
  state.user = null;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  userChip.textContent = "未登录";
  showAuth();
}

function applyAuth(user, token) {
  state.user = user;
  state.token = token;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  userChip.textContent = `${user.name} · ${user.email}`;
  hideAuth();
}

async function submitAuth() {
  authSubmitButton.disabled = true;
  authStatus.textContent = state.authMode === "register" ? "正在创建账户..." : "正在登录...";

  try {
    const payload =
      state.authMode === "register"
        ? {
            name: authNameInput.value.trim(),
            email: authEmailInput.value.trim(),
            password: authPasswordInput.value,
          }
        : {
            email: authEmailInput.value.trim(),
            password: authPasswordInput.value,
          };
    const path = state.authMode === "register" ? "/api/auth/register" : "/api/auth/login";
    const data = await apiFetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    applyAuth(data.user, data.token);
    authStatus.textContent = "登录成功。";
    setHeroStatus(`欢迎回来，${data.user.name}。`, "success");
    await loadWorkspace();
  } catch (error) {
    authStatus.textContent = error.message || "登录失败。";
  } finally {
    authSubmitButton.disabled = false;
  }
}

function normalizeStudent(student) {
  return {
    ...student,
    recommendationEvidence: Array.isArray(student.recommendationEvidence)
      ? student.recommendationEvidence.join("；")
      : student.recommendationEvidence,
  };
}

async function loadWorkspace() {
  const data = await apiFetch("/api/auth/me");
  state.user = data.user;
  userChip.textContent = `${data.user.name} · ${data.user.email}`;

  if (data.students.length) {
    state.students = {};
    state.studentOrder = [];
    data.students.forEach((student) => {
      state.students[student.id] = normalizeStudent(student);
      state.studentOrder.push(student.id);
    });
    state.selectedStudent = state.studentOrder[0];
  } else {
    state.students = { ...seedStudents };
    state.studentOrder = Object.keys(seedStudents);
    state.selectedStudent = state.studentOrder[0];
  }

  state.documents = data.documents || [];
  syncAll();
}

function buildManualStudent(name) {
  return {
    displayName: name,
    applicationTrack: "手动建档",
    targetProgram: "待补充目标专业 / 项目",
    statusLabel: "待补充",
    statusTone: "review",
    tags: ["待识别", `${state.uploadedFiles.length || 0} 份材料`, "可手动补充"],
    summary: "已创建学生档案。你可以继续补充项目方向、经历亮点和推荐人信息，再开始生成文书。",
    highlights: ["等待补充学生亮点", "等待补充可验证经历", "等待确认申请方向"],
    evidence: ["等待上传更多材料", "等待录入活动与奖项", "等待补充课程和成绩"],
    strategy: ["先补目标项目", "再补经历证据", "最后开始生成文书"],
    tone: "真诚、有反思感",
    focus: "请补充学生的关键经历、申请目标、项目匹配点和成长线索。",
    recommenderRole: "授课教师 / 项目导师",
    relationshipDuration: "1-2 年",
    recommendationEvidence: "请补充推荐人观察到的课程表现、项目协作和成长速度。",
  };
}

async function createStudent() {
  createStudentButton.disabled = true;
  createStudentButton.textContent = "处理中...";

  try {
    const nickname = studentNameInput.value.trim() || "未命名学生";
    const useSmartArchive = smartToggle.classList.contains("on");
    let profile;

    if (useSmartArchive && state.uploadedFiles.length > 0) {
      const formData = new FormData();
      formData.append("nickname", nickname);
      state.uploadedFiles.forEach((file) => formData.append("files", file));
      const data = await apiFetch("/api/profile/extract", {
        method: "POST",
        body: formData,
      });
      profile = normalizeStudent(data.profile);
      setHeroStatus(`已完成 ${profile.displayName} 的 AI 建档。`, "success");
    } else {
      const data = await apiFetch("/api/students/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: buildManualStudent(nickname) }),
      });
      profile = normalizeStudent(data.profile);
      setHeroStatus("已创建手动档案，可以直接继续生成文书。", "success");
    }

    state.students[profile.id] = profile;
    state.studentOrder = [profile.id, ...state.studentOrder.filter((item) => item !== profile.id)];
    state.selectedStudent = profile.id;
    syncAll();

    state.uploadedFiles = [];
    renderFiles();
    studentNameInput.value = "";
    closeModal();
  } catch (error) {
    setHeroStatus(error.message || "学生建档失败。", "danger");
  } finally {
    createStudentButton.disabled = false;
    createStudentButton.textContent = "确认创建";
  }
}

function collectWriterPayload(mode) {
  return {
    mode,
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

async function refreshDocuments() {
  const data = await apiFetch("/api/documents");
  state.documents = data.documents || [];
  renderDocuments();
}

async function saveStudentEdits() {
  const profile = getSelectedProfile();
  saveEditStudentButton.disabled = true;
  saveEditStudentButton.textContent = "保存中...";

  try {
    const data = await apiFetch(`/api/students/${profile.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: {
          displayName: editStudentNameInput.value.trim(),
          applicationTrack: editStudentTrackInput.value.trim(),
          targetProgram: editStudentProgramInput.value.trim(),
          summary: editStudentSummaryInput.value.trim(),
          focus: editStudentFocusInput.value.trim(),
          tags: editStudentTagsInput.value
            .split(/[,，、]/)
            .map((item) => item.trim())
            .filter(Boolean),
        },
      }),
    });

    state.students[profile.id] = normalizeStudent(data.profile);
    syncAll();
    closeStudentEditor();
    setHeroStatus("学生档案已更新。", "success");
  } catch (error) {
    setHeroStatus(error.message || "保存档案失败。", "danger");
  } finally {
    saveEditStudentButton.disabled = false;
    saveEditStudentButton.textContent = "保存档案";
  }
}

async function deleteCurrentStudent() {
  const profile = getSelectedProfile();
  if (!profile?.id) {
    setHeroStatus("示例档案不能删除，先创建或登录你的真实档案。", "warning");
    return;
  }

  if (!window.confirm(`确认删除 ${profile.displayName} 的档案及关联文稿吗？`)) {
    return;
  }

  try {
    await apiFetch(`/api/students/${profile.id}`, { method: "DELETE" });
    await loadWorkspace();
    setHeroStatus("学生档案已删除。", "success");
  } catch (error) {
    setHeroStatus(error.message || "删除学生失败。", "danger");
  }
}

async function generateDocument(mode) {
  const button = mode === "outline" ? generateOutlineButton : generateDraftButton;
  const label = button.textContent;
  button.disabled = true;
  button.textContent = mode === "outline" ? "生成中..." : "写作中...";

  try {
    const result = await apiFetch("/api/writer/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(collectWriterPayload(mode)),
    });
    renderOutput(result);
    await refreshDocuments();
    setHeroStatus("文书生成完成，已自动保存到历史记录。", "success");
  } catch (error) {
    setHeroStatus(error.message || "文书生成失败。", "danger");
  } finally {
    button.disabled = false;
    button.textContent = label;
  }
}

async function humanizeDocument() {
  humanizeButton.disabled = true;
  const label = humanizeButton.textContent;
  humanizeButton.textContent = "优化中...";

  try {
    const result = await apiFetch("/api/writer/humanize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...collectWriterPayload("humanize"),
        content: state.currentDocument,
      }),
    });
    renderOutput(result);
    await refreshDocuments();
    setHeroStatus("已完成自然化改写，结果也已保存。", "success");
  } catch (error) {
    setHeroStatus(error.message || "AI 痕迹优化失败。", "danger");
  } finally {
    humanizeButton.disabled = false;
    humanizeButton.textContent = label;
  }
}

function exportDocument() {
  const text = [outputTitle.textContent, outputSubtitle.textContent, "", ...state.currentDocument].join("\n\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.selectedTemplate}-${Date.now()}.txt`;
  link.click();
  URL.revokeObjectURL(url);
  setHeroStatus("已导出当前文稿。", "success");
}

function initModeFromHash() {
  const modeFromHash = window.location.hash.replace(/^#writer\//, "");
  if (templateMeta[modeFromHash]) {
    state.selectedTemplate = modeFromHash;
    syncAll();
  }
}

async function bootstrap() {
  renderOutput({
    ...templateMeta[state.selectedTemplate],
    content: [
      "这个版本已经支持账号登录、学生档案持久化、历史文稿保存，以及真实 OpenAI / PoloAPI 调用。",
      "登录后你创建的学生和生成的文稿都会被保存在本地数据库里。",
    ],
    aiScore: "待生成",
  });
  syncAll();

  try {
    const health = await fetch("/api/health").then((res) => res.json());
    setHeroStatus(
      health.openaiConfigured
        ? `AI 已连接，当前模型：${health.model}。`
        : "当前运行在 Demo 模式。配置密钥后可用真实建档和生成。",
      health.openaiConfigured ? "success" : "warning"
    );
  } catch {
    setHeroStatus("后端尚未启动，请先运行 npm run dev。", "danger");
  }

  if (!state.token) {
    showAuth();
    return;
  }

  try {
    await loadWorkspace();
    hideAuth();
  } catch (error) {
    clearAuth();
    authStatus.textContent = error.message || "登录状态已失效。";
  }
}

openModalButtons.forEach((button) => button?.addEventListener("click", openModal));
closeModalButtons.forEach((button) => button?.addEventListener("click", closeModal));
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});

authTabs.forEach((tab) => tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode)));
authSubmitButton.addEventListener("click", submitAuth);
logoutButton.addEventListener("click", async () => {
  try {
    await apiFetch("/api/auth/logout", { method: "POST" });
  } catch {}
  clearAuth();
});
editStudentButton.addEventListener("click", openStudentEditor);
deleteStudentButton.addEventListener("click", deleteCurrentStudent);
closeEditStudentButton.addEventListener("click", closeStudentEditor);
cancelEditStudentButton.addEventListener("click", closeStudentEditor);
saveEditStudentButton.addEventListener("click", saveStudentEdits);
studentEditBackdrop.addEventListener("click", (event) => {
  if (event.target === studentEditBackdrop) {
    closeStudentEditor();
  }
});
refreshDocsButton.addEventListener("click", async () => {
  try {
    await refreshDocuments();
    setHeroStatus("已刷新历史文稿列表。", "success");
  } catch (error) {
    setHeroStatus(error.message || "刷新失败。", "danger");
  }
});

smartToggle.addEventListener("click", () => {
  const isOn = smartToggle.classList.toggle("on");
  smartToggle.setAttribute("aria-pressed", String(isOn));
});

fileInput.addEventListener("change", (event) => handleFiles(event.target.files));
dropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropzone.classList.add("dragover");
});
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
dropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropzone.classList.remove("dragover");
  handleFiles(event.dataTransfer.files);
});

createStudentButton.addEventListener("click", createStudent);
templateCards.forEach((card) => {
  card.addEventListener("click", () => {
    state.selectedTemplate = card.dataset.template;
    syncAll();
  });
});
modeNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    state.selectedTemplate = item.dataset.mode;
    syncAll();
  });
});

generateDraftButton.addEventListener("click", () => generateDocument("draft"));
generateOutlineButton.addEventListener("click", () => generateDocument("outline"));
humanizeButton.addEventListener("click", humanizeDocument);
exportButton.addEventListener("click", exportDocument);
window.addEventListener("hashchange", initModeFromHash);

setAuthMode("login");
initModeFromHash();
bootstrap();
