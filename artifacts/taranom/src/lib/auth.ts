export interface StoredStudent {
  id: number;
  nationalCode: string;
  fullName: string;
  grade?: string | null;
  schoolName?: string | null;
}

const STUDENT_KEY = "taranom_student";
const ADMIN_KEY = "taranom_admin_token";

export function getStoredStudent(): StoredStudent | null {
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredStudent;
  } catch {
    return null;
  }
}

export function setStoredStudent(student: StoredStudent): void {
  localStorage.setItem(STUDENT_KEY, JSON.stringify(student));
}

export function clearStoredStudent(): void {
  localStorage.removeItem(STUDENT_KEY);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_KEY, token);
}

export function clearAdminToken(): void {
  localStorage.removeItem(ADMIN_KEY);
}

export function getNationalCode(): string | null {
  return getStoredStudent()?.nationalCode ?? null;
}
