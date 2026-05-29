import { doc, setDoc, addDoc, collection, serverTimestamp, getDocs, query, limit } from 'firebase/firestore';
import { db, auth, OperationType, handleFirestoreError } from './firebase';

export interface FirestoreUser {
  userId: string;
  email: string;
  role: 'student' | 'admin';
  displayName?: string;
  createdAt?: any;
}

export interface FirestoreExamResult {
  userId: string;
  score: number;
  percentage: number;
  traz: number;
  timestamp?: any;
  aiAnalysis?: any;
}

export interface FirestoreSecurityLog {
  userId: string;
  action: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp?: any;
}

export interface FirestoreInstitution {
  id: string;
  name: string;
  subdomain: string;
  features: {
    aiAnalysis: boolean;
    customSimulator: boolean;
    securityCheck: boolean;
    whiteLabel: boolean;
  };
}

/**
 * Creates/Updates an institution under /institutions/{instId}
 */
export async function saveInstitution(inst: FirestoreInstitution): Promise<void> {
  const path = `institutions/${inst.id}`;
  try {
    await setDoc(doc(db, 'institutions', inst.id), {
      ...inst,
      createdAt: serverTimestamp(),
    });
    console.log(`[firebaseSync] Institution ${inst.id} saved successfully!`);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Creates/Updates a user under /institutions/{instId}/users/{userId}
 */
export async function saveInstitutionUser(instId: string, user: FirestoreUser): Promise<void> {
  const path = `institutions/${instId}/users/${user.userId}`;
  try {
    await setDoc(doc(db, 'institutions', instId, 'users', user.userId), {
      ...user,
      createdAt: serverTimestamp(),
    });
    console.log(`[firebaseSync] User profile for ${user.userId} saved successfully in tenant ${instId}!`);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Creates an exam result under /institutions/{instId}/exam_results/{resultId}
 */
export async function saveExamResult(instId: string, resultId: string, result: FirestoreExamResult): Promise<void> {
  const path = `institutions/${instId}/exam_results/${resultId}`;
  try {
    await setDoc(doc(db, 'institutions', instId, 'exam_results', resultId), {
      ...result,
      timestamp: serverTimestamp(),
    });
    console.log(`[firebaseSync] Exam result ${resultId} registered successfully in tenant ${instId}!`);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Appends a log entry to global /security_logs collection
 */
export async function appendSecurityLog(log: FirestoreSecurityLog): Promise<void> {
  const path = 'security_logs';
  try {
    const newLogRef = doc(collection(db, 'security_logs'));
    await setDoc(newLogRef, {
      ...log,
      timestamp: serverTimestamp(),
    });
    console.log(`[firebaseSync] Security log created with ID ${newLogRef.id}!`);
  } catch (error: any) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Test fetch to verify connection is alive
 */
export async function fetchRecentSecurityLogs(): Promise<any[]> {
  const path = 'security_logs';
  try {
    const q = query(collection(db, 'security_logs'), limit(10));
    const querySnapshot = await getDocs(q);
    const logs: any[] = [];
    querySnapshot.forEach((docSnap) => {
      logs.push({ id: docSnap.id, ...docSnap.data() });
    });
    return logs;
  } catch (error: any) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}
