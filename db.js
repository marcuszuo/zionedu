import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");

ensureDb();

export function createUser({ email, password, name }) {
  const db = readDb();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("邮箱和密码不能为空。");
  }

  if (db.users.some((user) => user.email === normalizedEmail)) {
    throw new Error("该邮箱已注册。");
  }

  const user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    name: String(name || normalizedEmail.split("@")[0] || "顾问").trim(),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  writeDb(db);
  return sanitizeUser(user);
}

export function authenticateUser({ email, password }) {
  const db = readDb();
  const normalizedEmail = String(email).trim().toLowerCase();
  const user = db.users.find((item) => item.email === normalizedEmail);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    throw new Error("邮箱或密码错误。");
  }

  return sanitizeUser(user);
}

export function createSession(userId) {
  const db = readDb();
  const token = crypto.randomBytes(24).toString("hex");

  db.sessions = db.sessions.filter((session) => session.userId !== userId);
  db.sessions.push({
    token,
    userId,
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
  return token;
}

export function getUserBySessionToken(token) {
  if (!token) {
    return null;
  }

  const db = readDb();
  const session = db.sessions.find((item) => item.token === token);
  if (!session) {
    return null;
  }

  const user = db.users.find((item) => item.id === session.userId);
  return user ? sanitizeUser(user) : null;
}

export function deleteSession(token) {
  const db = readDb();
  db.sessions = db.sessions.filter((session) => session.token !== token);
  writeDb(db);
}

export function listStudentsByUser(userId) {
  const db = readDb();
  return db.students
    .filter((student) => student.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function saveStudentForUser(userId, profile) {
  const db = readDb();
  const existingIndex = db.students.findIndex(
    (student) =>
      student.userId === userId &&
      student.displayName === profile.displayName &&
      student.targetProgram === profile.targetProgram
  );

  const student = {
    id: existingIndex >= 0 ? db.students[existingIndex].id : crypto.randomUUID(),
    userId,
    ...profile,
    updatedAt: new Date().toISOString(),
    createdAt: existingIndex >= 0 ? db.students[existingIndex].createdAt : new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    db.students[existingIndex] = student;
  } else {
    db.students.push(student);
  }

  writeDb(db);
  return student;
}

export function saveDocumentForUser(userId, document) {
  const db = readDb();
  const record = {
    id: crypto.randomUUID(),
    userId,
    ...document,
    createdAt: new Date().toISOString(),
  };
  db.documents.push(record);
  writeDb(db);
  return record;
}

export function listDocumentsByUser(userId) {
  const db = readDb();
  return db.documents
    .filter((document) => document.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getDocumentById(userId, documentId) {
  const db = readDb();
  return db.documents.find((document) => document.userId === userId && document.id === documentId) || null;
}

export function updateStudentForUser(userId, studentId, updates) {
  const db = readDb();
  const index = db.students.findIndex((student) => student.userId === userId && student.id === studentId);
  if (index < 0) {
    throw new Error("未找到学生档案。");
  }

  db.students[index] = {
    ...db.students[index],
    ...updates,
    id: db.students[index].id,
    userId: db.students[index].userId,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.students[index];
}

export function deleteStudentForUser(userId, studentId) {
  const db = readDb();
  const exists = db.students.some((student) => student.userId === userId && student.id === studentId);
  if (!exists) {
    throw new Error("未找到学生档案。");
  }

  db.students = db.students.filter((student) => !(student.userId === userId && student.id === studentId));
  db.documents = db.documents.filter((document) => !(document.userId === userId && document.studentId === studentId));
  writeDb(db);
}

export function deleteDocumentForUser(userId, documentId) {
  const db = readDb();
  const exists = db.documents.some((document) => document.userId === userId && document.id === documentId);
  if (!exists) {
    throw new Error("未找到文稿。");
  }

  db.documents = db.documents.filter((document) => !(document.userId === userId && document.id === documentId));
  writeDb(db);
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password, storedHash) {
  const [salt, derived] = String(storedHash || "").split(":");
  if (!salt || !derived) {
    return false;
  }

  const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(derived, "hex"));
}

function ensureDb() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath,
      JSON.stringify({ users: [], sessions: [], students: [], documents: [] }, null, 2) + "\n"
    );
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbPath, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2) + "\n");
}
