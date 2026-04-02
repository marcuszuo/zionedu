import mammoth from "https://esm.sh/mammoth@1.9.1";
import * as pdfjs from "https://esm.sh/pdfjs-dist@4.10.38/legacy/build/pdf.mjs";
import { Document, Packer, Paragraph, TextRun } from "https://esm.sh/docx@9.5.1";
import { jsPDF } from "https://esm.sh/jspdf@2.5.2";

const API_KEY_STORAGE = "zionapply_api_key";
const API_BASE_STORAGE = "zionapply_api_base";
const API_MODEL_STORAGE = "zionapply_api_model";
const memoryStorage = {};

pdfjs.GlobalWorkerOptions.workerSrc = "https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs";

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

const templateCards = document.querySelectorAll(".template-card");
const pageNavItems = document.querySelectorAll(".nav-item[data-page]");
const studentLists = document.querySelectorAll(".js-student-list");
const overviewView = document.getElementById("overview-view");
const studentsView = document.getElementById("students-view");
const writerView = document.getElementById("writer-view");
const agentView = document.getElementById("agent-view");
const pageKicker = document.getElementById("page-kicker");
const pageTitle = document.getElementById("page-title");
const pageSubtitle = document.getElementById("page-subtitle");
const studentDetailCard = document.getElementById("student-detail-card");
const quickLinkCards = document.querySelectorAll("[data-page-jump]");
const metricActiveStudents = document.getElementById("metric-active-students");
const metricGeneratedDocs = document.getElementById("metric-generated-docs");
const metricPendingActions = document.getElementById("metric-pending-actions");

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
const exportMenu = document.getElementById("export-menu");
const exportWordButton = document.getElementById("export-word-btn");
const exportPdfButton = document.getElementById("export-pdf-btn");
const insightHighlights = document.getElementById("insight-highlights");
const insightEvidence = document.getElementById("insight-evidence");
const insightStrategy = document.getElementById("insight-strategy");

const apiKeyInput = document.getElementById("api-key-input");
const apiBaseInput = document.getElementById("api-base-input");
const apiModelInput = document.getElementById("api-model-input");
const saveApiConfigButton = document.getElementById("save-api-config-btn");
const clearApiConfigButton = document.getElementById("clear-api-config-btn");
const openApiSettingsButton = document.getElementById("open-api-settings-btn");
const apiSettingsBackdrop = document.getElementById("api-settings-backdrop");
const closeApiSettingsButton = document.getElementById("close-api-settings-btn");

const agentUploadTab = document.getElementById("agent-upload-tab");
const agentLibraryTab = document.getElementById("agent-library-tab");
const agentUploadPanel = document.getElementById("agent-upload-panel");
const agentLibraryPanel = document.getElementById("agent-library-panel");
const agentFileInput = document.getElementById("agent-file-input");
const agentDropzone = document.getElementById("agent-dropzone");
const agentFileList = document.getElementById("agent-file-list");
const agentLibraryList = document.getElementById("agent-library-list");
const agentProgramInput = document.getElementById("agent-program-input");
const agentInstructionInput = document.getElementById("agent-instruction-input");
const agentGenerateButton = document.getElementById("agent-generate-btn");
const agentOutputBody = document.getElementById("agent-output-body");
const agentOutputSubtitle = document.getElementById("agent-output-subtitle");
const agentUseResultButton = document.getElementById("agent-use-result-btn");

const editStudentButtons = document.querySelectorAll("[data-edit-student]");
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
  currentPage: "overview",
  selectedStudent: "emily",
  selectedTemplate: "ps",
  agentMode: "upload",
  agentFiles: [],
  agentResult: [],
  currentDocument: [
    "这里会显示 AI 生成的内容。先打开 AI 设置完成配置，然后点击“生成初稿”即可开始使用。",
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

function setStatusMessage(message, variant = "info") {
  const palette = {
    info: "rgba(16, 183, 222, 0.08)",
    success: "rgba(31, 157, 107, 0.08)",
    warning: "rgba(216, 154, 29, 0.08)",
    danger: "rgba(214, 69, 69, 0.08)",
  };
  outputSubtitle.textContent = message;
  outputSubtitle.style.color =
    variant === "danger" ? "#b33939" : variant === "success" ? "#1f9d6b" : variant === "warning" ? "#b4780d" : "#6e7a90";
  outputSubtitle.style.background = palette[variant];
  outputSubtitle.style.display = "inline-block";
  outputSubtitle.style.padding = "8px 12px";
  outputSubtitle.style.borderRadius = "999px";
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

function getApiConfigFromInputs() {
  const stored = getApiConfig();
  return {
    apiKey: apiKeyInput.value.trim() || stored.apiKey,
    baseUrl: (apiBaseInput.value.trim() || stored.baseUrl || "https://api.newapi.life/v1").replace(/\/+$/, ""),
    model: apiModelInput.value.trim() || stored.model || "gpt-5",
  };
}

function renderApiConfig() {
  const config = getApiConfig();
  apiBaseInput.value = config.baseUrl;
  apiModelInput.value = config.model;
  apiKeyInput.value = config.apiKey;
  saveApiConfigButton.textContent = config.apiKey ? "已保存" : "保存 API";
}

function saveApiConfig() {
  const apiKey = apiKeyInput.value.trim();
  const baseUrl = apiBaseInput.value.trim().replace(/\/+$/, "");
  const model = apiModelInput.value.trim() || "gpt-5";

  if (!apiKey) {
    setStatusMessage("请先输入 API Key。", "warning");
    return;
  }

  setStoredValue(API_KEY_STORAGE, apiKey);
  setStoredValue(API_BASE_STORAGE, baseUrl || "https://api.newapi.life/v1");
  setStoredValue(API_MODEL_STORAGE, model);
  renderApiConfig();
  setStatusMessage("API 配置已保存。", "success");
  closeApiSettings();
}

function clearApiConfig() {
  removeStoredValue(API_KEY_STORAGE);
  removeStoredValue(API_BASE_STORAGE);
  removeStoredValue(API_MODEL_STORAGE);
  renderApiConfig();
  saveApiConfigButton.textContent = "保存 API";
  setStatusMessage("已清除 API 配置。", "warning");
}

function renderInsightList(element, items) {
  if (!element) {
    return;
  }
  element.innerHTML = (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderInsights(profile) {
  renderInsightList(insightHighlights, profile.highlights || []);
  renderInsightList(insightEvidence, profile.evidence || []);
  renderInsightList(insightStrategy, profile.strategy || []);
}

function renderStudentList() {
  const markup = state.studentOrder
    .map((key) => {
      const student = state.students[key];
      return `
        <article class="student-card ${key === state.selectedStudent ? "active" : ""}" data-student="${escapeHtml(key)}">
          <div class="student-topline">
            <div>
              <h3>${escapeHtml(student.displayName)}</h3>
              <p>${escapeHtml(student.applicationTrack)} · ${escapeHtml(student.targetProgram)}</p>
            </div>
            <span class="status-badge ${escapeHtml(student.statusTone || "review")}">${escapeHtml(student.statusTone === "ready" ? "就绪" : student.statusLabel || "待确认")}</span>
          </div>
          <p class="student-summary">${escapeHtml((student.tags || []).slice(0, 3).join(" · ") || student.summary || "")}</p>
        </article>
      `;
    })
    .join("");

  studentLists.forEach((container) => {
    container.innerHTML = markup;
    container.querySelectorAll(".student-card").forEach((card) => {
      card.addEventListener("click", () => {
        state.selectedStudent = card.dataset.student;
        syncAll();
        setStatusMessage(`已切换到 ${getSelectedProfile().displayName} 的档案。`, "info");
      });
    });
  });
}

function renderStudentDetail() {
  if (!studentDetailCard) {
    return;
  }

  const profile = getSelectedProfile();
  studentDetailCard.innerHTML = `
    <div class="detail-hero">
      <div>
        <h3>${escapeHtml(profile.displayName)}</h3>
        <p>${escapeHtml(profile.applicationTrack)} · ${escapeHtml(profile.targetProgram)}</p>
      </div>
      <span class="status-badge ${escapeHtml(profile.statusTone || "review")}">${escapeHtml(profile.statusTone === "ready" ? "就绪" : profile.statusLabel || "待确认")}</span>
    </div>
    <p class="detail-summary">${escapeHtml(profile.summary || "当前还没有摘要。")}</p>
    <div class="detail-block">
      <p class="detail-label">标签</p>
      <div class="detail-tags">${(profile.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("") || "<span>待补充</span>"}</div>
    </div>
    <div class="detail-columns">
      <div class="detail-block">
        <p class="detail-label">亮点</p>
        <ul>${(profile.highlights || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>待补充</li>"}</ul>
      </div>
      <div class="detail-block">
        <p class="detail-label">证据</p>
        <ul>${(profile.evidence || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>待补充</li>"}</ul>
      </div>
    </div>
    <div class="detail-block">
      <p class="detail-label">申请策略</p>
      <ul>${(profile.strategy || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("") || "<li>待补充</li>"}</ul>
    </div>
  `;
}

function renderAgentLibrary() {
  agentLibraryList.innerHTML = state.studentOrder
    .map((key) => {
      const student = state.students[key];
      return `
        <article class="agent-library-card ${key === state.selectedStudent ? "active" : ""}" data-agent-student="${escapeHtml(key)}">
          <strong>${escapeHtml(student.displayName)}</strong>
          <p>${escapeHtml(student.applicationTrack)} · ${escapeHtml(student.targetProgram)}</p>
          <button class="ghost-btn compact-btn">选择此档案</button>
        </article>
      `;
    })
    .join("");

  agentLibraryList.querySelectorAll("[data-agent-student]").forEach((card) => {
    card.addEventListener("click", () => {
      state.selectedStudent = card.dataset.agentStudent;
      renderAgentLibrary();
      renderStudentList();
      setStatusMessage(`文书Agent 已选择 ${getSelectedProfile().displayName} 的资料库档案。`, "info");
    });
  });
}

function renderAgentFiles() {
  if (!state.agentFiles.length) {
    agentFileList.innerHTML = '<p class="empty-copy">还没有上传资料。</p>';
    return;
  }

  agentFileList.innerHTML = state.agentFiles
    .map(
      (file) => `
        <article class="agent-file-item">
          <strong>${escapeHtml(file.name)}</strong>
          <span>${escapeHtml(file.type || "未知类型")} · ${Math.max(1, Math.round(file.size / 1024))} KB</span>
        </article>
      `
    )
    .join("");
}

function renderOutput(result) {
  const meta = templateMeta[state.selectedTemplate];
  outputTitle.textContent = result.title || meta.title;
  outputSubtitle.textContent = result.subtitle || meta.subtitle;
  outputSubtitle.removeAttribute("style");
  aiScore.textContent = result.aiScore || meta.aiScore;
  state.currentDocument = Array.isArray(result.content) ? result.content : [];
  outputBody.innerHTML = state.currentDocument.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function renderOverviewMetrics() {
  if (!metricActiveStudents || !metricGeneratedDocs || !metricPendingActions) {
    return;
  }

  const activeStudents = state.studentOrder.length;
  const generatedDocs = activeStudents * 6 + (state.agentResult.length ? 3 : 0);
  const pendingActions = Math.max(
    1,
    state.studentOrder.filter((key) => {
      const student = state.students[key];
      return !(student.highlights || []).length || !(student.evidence || []).length;
    }).length
  );

  metricActiveStudents.textContent = String(activeStudents);
  metricGeneratedDocs.textContent = String(generatedDocs);
  metricPendingActions.textContent = String(pendingActions);
}

function syncFormWithStudent() {
  const profile = getSelectedProfile();
  programInput.value = profile.targetProgram || "";
  toneSelect.value = profile.tone || "真诚、有反思感";
  focusInput.value = profile.focus || "";
  recommenderRole.value = profile.recommenderRole || "授课教师 / 项目导师";
  relationshipDuration.value = profile.relationshipDuration || "1-2 年";
  recommendationEvidence.value = profile.recommendationEvidence || "";
  agentProgramInput.value = agentProgramInput.value || profile.targetProgram || "";
}

function syncTemplateState() {
  const isRl = state.selectedTemplate === "rl";
  rlFields.classList.toggle("hidden", !isRl);
  templateCards.forEach((card) => {
    card.classList.toggle("selected", card.dataset.template === state.selectedTemplate);
  });
}

function syncPageState() {
  const pageMeta = {
    overview: {
      kicker: "Dashboard",
      title: "下午好，欢迎回来",
      subtitle: "先看今天的客户使用情况，再继续处理文书。",
    },
    students: {
      kicker: "Students",
      title: "学生档案",
      subtitle: "集中管理学生资料、亮点和申请策略。",
    },
    ps: {
      kicker: "Writer",
      title: "个人陈述 PS",
      subtitle: "围绕成长线、动机与项目匹配生成首稿。",
    },
    rl: {
      kicker: "Writer",
      title: "推荐信 RL",
      subtitle: "用推荐人视角生成可信、具体的推荐信。",
    },
    agent: {
      kicker: "Agent",
      title: "文书Agent",
      subtitle: "上传新材料，自动分析并生成 PS 首稿。",
    },
  };

  const currentMeta = pageMeta[state.currentPage] || pageMeta.overview;
  pageKicker.textContent = currentMeta.kicker;
  pageTitle.textContent = currentMeta.title;
  pageSubtitle.textContent = currentMeta.subtitle;

  overviewView.classList.toggle("hidden", state.currentPage !== "overview");
  studentsView.classList.toggle("hidden", state.currentPage !== "students");
  writerView.classList.toggle("hidden", !["ps", "rl"].includes(state.currentPage));
  agentView.classList.toggle("hidden", state.currentPage !== "agent");

  pageNavItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.page === state.currentPage);
  });
}

function syncAgentMode() {
  const isUpload = state.agentMode === "upload";
  agentUploadTab.classList.toggle("active", isUpload);
  agentLibraryTab.classList.toggle("active", !isUpload);
  agentUploadPanel.classList.toggle("hidden", !isUpload);
  agentLibraryPanel.classList.toggle("hidden", isUpload);
}

function syncAll() {
  renderStudentList();
  renderStudentDetail();
  renderAgentLibrary();
  renderAgentFiles();
  renderInsights(getSelectedProfile());
  renderOverviewMetrics();
  syncFormWithStudent();
  syncTemplateState();
  syncPageState();
  syncAgentMode();
}

function openModal() {
  modalBackdrop.classList.remove("hidden");
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
}

function openApiSettings() {
  apiSettingsBackdrop?.classList.remove("hidden");
}

function closeApiSettings() {
  apiSettingsBackdrop?.classList.add("hidden");
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
    setStatusMessage(`已创建 ${profile.displayName} 的试用档案。`, "success");
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
  setStatusMessage("已更新当前档案。", "success");
}

function deleteCurrentStudent() {
  if (state.studentOrder.length === 1) {
    setStatusMessage("至少保留一个试用档案，方便继续生成。", "warning");
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
  setStatusMessage("已删除当前档案。", "success");
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
  const config = getApiConfigFromInputs();
  if (!config.apiKey) {
    throw new Error("请先在 AI 设置里填写 API Key。");
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
    setStatusMessage(`${label}完成，可以继续人工修改或点“降低 AI 痕迹”。`, "success");
  } catch (error) {
    setStatusMessage(error.message || "生成失败。", "danger");
  } finally {
    button.disabled = false;
    button.textContent = original;
  }
}

async function humanizeDocument() {
  if (!state.currentDocument.length) {
    setStatusMessage("当前还没有可优化的文稿。", "warning");
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
    setStatusMessage("已完成自然化改写。", "success");
  } catch (error) {
    setStatusMessage(error.message || "优化失败。", "danger");
  } finally {
    humanizeButton.disabled = false;
    humanizeButton.textContent = original;
  }
}

function exportDocument() {
  exportMenu?.classList.toggle("hidden");
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function buildExportBaseName() {
  const safeTitle = `${outputTitle.textContent || templateMeta[state.selectedTemplate].title}`
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safeTitle || `zionapply-${state.selectedTemplate}`;
}

async function exportWordDocument() {
  if (!state.currentDocument.length) {
    setStatusMessage("当前没有可导出的内容。", "warning");
    return;
  }

  try {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: outputTitle.textContent || templateMeta[state.selectedTemplate].title, bold: true, size: 32 })],
              spacing: { after: 240 },
            }),
            ...state.currentDocument.map(
              (paragraph) =>
                new Paragraph({
                  children: [new TextRun({ text: paragraph })],
                  spacing: { after: 180 },
                })
            ),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    downloadBlob(blob, `${buildExportBaseName()}.docx`);
    exportMenu?.classList.add("hidden");
    setStatusMessage("已导出 Word 文稿。", "success");
  } catch (error) {
    setStatusMessage(error.message || "Word 导出失败。", "danger");
  }
}

function exportPdfDocument() {
  if (!state.currentDocument.length) {
    setStatusMessage("当前没有可导出的内容。", "warning");
    return;
  }

  try {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const marginX = 56;
    const marginTop = 64;
    const marginBottom = 56;
    let cursorY = marginTop;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    const titleLines = pdf.splitTextToSize(outputTitle.textContent || templateMeta[state.selectedTemplate].title, pageWidth - marginX * 2);
    pdf.text(titleLines, marginX, cursorY);
    cursorY += titleLines.length * 24 + 12;

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);

    for (const paragraph of state.currentDocument) {
      const lines = pdf.splitTextToSize(paragraph, pageWidth - marginX * 2);
      const blockHeight = lines.length * 18 + 10;
      if (cursorY + blockHeight > pageHeight - marginBottom) {
        pdf.addPage();
        cursorY = marginTop;
      }
      pdf.text(lines, marginX, cursorY);
      cursorY += blockHeight;
    }

    pdf.save(`${buildExportBaseName()}.pdf`);
    exportMenu?.classList.add("hidden");
    setStatusMessage("已导出 PDF 文稿。", "success");
  } catch (error) {
    setStatusMessage(error.message || "PDF 导出失败。", "danger");
  }
}

function switchPage(page) {
  state.currentPage = page;
  if (page === "ps" || page === "rl") {
    state.selectedTemplate = page;
  }
  window.location.hash = page;
  syncPageState();
  syncTemplateState();
}

function setAgentMode(mode) {
  state.agentMode = mode;
  syncAgentMode();
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`读取文件失败：${file.name}`));
    reader.readAsDataURL(file);
  });
}

async function extractAgentMaterials(files) {
  const textBlocks = [];
  const imageParts = [];
  const unsupported = [];

  for (const file of files) {
    const lower = file.name.toLowerCase();
    const isTextLike =
      file.type.startsWith("text/") ||
      [".txt", ".md", ".markdown", ".csv", ".json"].some((ext) => lower.endsWith(ext));

    if (isTextLike) {
      const text = await file.text();
      if (text.trim()) {
        textBlocks.push(`文件：${file.name}\n${text.slice(0, 12000)}`);
      }
      continue;
    }

    if (lower.endsWith(".docx")) {
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      if (result.value.trim()) {
        textBlocks.push(`文件：${file.name}\n${result.value.slice(0, 12000)}`);
      }
      continue;
    }

    if (lower.endsWith(".pdf") || file.type === "application/pdf") {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: buffer }).promise;
      const pageTexts = [];

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        if (pageText) {
          pageTexts.push(pageText);
        }
      }

      const merged = pageTexts.join("\n");
      if (merged.trim()) {
        textBlocks.push(`文件：${file.name}\n${merged.slice(0, 12000)}`);
      }
      continue;
    }

    if (file.type.startsWith("image/")) {
      const dataUrl = await readFileAsDataUrl(file);
      imageParts.push({
        type: "image_url",
        image_url: { url: dataUrl },
      });
      continue;
    }

    unsupported.push(file.name);
  }

  return { textBlocks, imageParts, unsupported };
}

function buildAgentPrompt(materials) {
  const profile = getSelectedProfile();
  const lines = [
    "请根据以下学生材料，直接生成一版英文个人陈述（PS）首稿。",
    "要求：真实、具体、有叙事线，不要空泛套话。",
    `学生姓名：${profile.displayName}`,
    `申请阶段：${profile.applicationTrack}`,
    `目标项目：${agentProgramInput.value.trim() || profile.targetProgram}`,
    `已有档案摘要：${profile.summary}`,
    `重点强调：${agentInstructionInput.value.trim() || profile.focus}`,
    `已有亮点：${(profile.highlights || []).join("；")}`,
    `已有证据：${(profile.evidence || []).join("；")}`,
    "",
    "以下是上传材料中可直接读取的内容：",
    materials.textBlocks.join("\n\n---\n\n") || "无可提取文本，仅参考图片内容。",
  ];

  if (materials.unsupported.length) {
    lines.push("", `以下文件当前静态版无法自动解析，请只将其视为补充：${materials.unsupported.join("、")}`);
  }

  lines.push("", "请输出 650-850 英文单词左右的可用 PS 首稿。");
  return lines.join("\n");
}

async function generateAgentPs() {
  const original = agentGenerateButton.textContent;
  agentGenerateButton.disabled = true;
  agentGenerateButton.textContent = "分析中...";

  try {
    const materials = await extractAgentMaterials(state.agentFiles);
    if (state.agentMode === "upload" && !materials.textBlocks.length && !materials.imageParts.length) {
      throw new Error("请先上传可读取的 TXT / Markdown / CSV / JSON / 图片资料。");
    }

    const userContent = [{ type: "text", text: buildAgentPrompt(materials) }, ...materials.imageParts];
    const content = await runCompletion([
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: userContent },
    ]);

    state.agentResult = textToParagraphs(content);
    agentOutputSubtitle.textContent = `已根据 ${state.agentFiles.length || 1} 份资料生成 PS。`;
    agentOutputBody.innerHTML = state.agentResult.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
    setStatusMessage("文书Agent 已完成 PS 生成。", "success");
  } catch (error) {
    agentOutputSubtitle.textContent = "生成失败";
    agentOutputBody.innerHTML = `<p>${escapeHtml(error.message || "生成失败，请稍后重试。")}</p>`;
    setStatusMessage(error.message || "文书Agent 生成失败。", "danger");
  } finally {
    agentGenerateButton.disabled = false;
    agentGenerateButton.textContent = original;
  }
}

function useAgentResult() {
  if (!state.agentResult.length) {
    setStatusMessage("Agent 结果还没有生成。", "warning");
    return;
  }
  state.currentPage = "ps";
  state.selectedTemplate = "ps";
  renderOutput({
    title: "个人陈述 PS",
    subtitle: "已从文书Agent 载入到主工作台",
    aiScore: "Agent 输出",
    content: state.agentResult,
  });
  syncAll();
  window.location.hash = "ps";
  setStatusMessage("已将 Agent 结果载入主工作台。", "success");
}

function initializeFromHash() {
  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) {
    state.currentPage = "overview";
    return;
  }

  if (["overview", "students", "agent", "ps", "rl"].includes(hash)) {
    state.currentPage = hash;
    if (hash === "ps" || hash === "rl") {
      state.selectedTemplate = hash;
    }
  }
}

function initializeTrialUi() {
  if (docList) {
    docList.innerHTML = '<p class="empty-copy">静态试用版不保存历史文稿，建议生成后立即导出。</p>';
  }
  trimTemplates.forEach((element) => element.classList.add("hidden"));
}

openModalButtons.forEach((button) => button?.addEventListener("click", openModal));
closeModalButtons.forEach((button) => button?.addEventListener("click", closeModal));
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) {
    closeModal();
  }
});
openApiSettingsButton?.addEventListener("click", openApiSettings);
closeApiSettingsButton?.addEventListener("click", closeApiSettings);
apiSettingsBackdrop?.addEventListener("click", (event) => {
  if (event.target === apiSettingsBackdrop) {
    closeApiSettings();
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

agentUploadTab.addEventListener("click", () => setAgentMode("upload"));
agentLibraryTab.addEventListener("click", () => setAgentMode("library"));
agentFileInput.addEventListener("change", (event) => {
  state.agentFiles = [...(event.target.files || [])];
  renderAgentFiles();
});
agentDropzone.addEventListener("dragover", (event) => {
  event.preventDefault();
  agentDropzone.classList.add("dragover");
});
agentDropzone.addEventListener("dragleave", () => {
  agentDropzone.classList.remove("dragover");
});
agentDropzone.addEventListener("drop", (event) => {
  event.preventDefault();
  agentDropzone.classList.remove("dragover");
  state.agentFiles = [...(event.dataTransfer?.files || [])];
  renderAgentFiles();
});
agentGenerateButton.addEventListener("click", generateAgentPs);
agentUseResultButton.addEventListener("click", useAgentResult);

createStudentButton.addEventListener("click", createStudent);
saveEditStudentButton.addEventListener("click", saveStudentEdits);
editStudentButtons.forEach((button) => button.addEventListener("click", openStudentEditor));
deleteStudentButton?.addEventListener("click", deleteCurrentStudent);
generateDraftButton.addEventListener("click", () => generateDocument("draft"));
generateOutlineButton.addEventListener("click", () => generateDocument("outline"));
humanizeButton.addEventListener("click", humanizeDocument);
exportButton.addEventListener("click", exportDocument);
exportWordButton?.addEventListener("click", exportWordDocument);
exportPdfButton?.addEventListener("click", exportPdfDocument);
document.addEventListener("click", (event) => {
  if (!exportMenu || !exportButton) {
    return;
  }
  if (event.target === exportButton || exportButton.contains(event.target)) {
    return;
  }
  if (exportMenu.contains(event.target)) {
    return;
  }
  exportMenu.classList.add("hidden");
});

templateCards.forEach((card) => {
  card.addEventListener("click", () => {
    if (!templateMeta[card.dataset.template]) {
      return;
    }
    state.currentPage = card.dataset.template;
    state.selectedTemplate = card.dataset.template;
    window.location.hash = state.selectedTemplate;
    syncAll();
  });
});

pageNavItems.forEach((item) => {
  item.addEventListener("click", () => {
    switchPage(item.dataset.page);
  });
});

quickLinkCards.forEach((item) => {
  item.addEventListener("click", () => switchPage(item.dataset.pageJump));
});

window.addEventListener("hashchange", () => {
  initializeFromHash();
  syncAll();
});

initializeFromHash();
initializeTrialUi();
renderApiConfig();
renderOutput({
  title: templateMeta.ps.title,
  subtitle: "打开 AI 设置后，即可开始生成 PS 或推荐信",
  aiScore: "可生成",
  content: state.currentDocument,
});
syncAll();
