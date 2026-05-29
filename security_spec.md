# Security Specifications & Threat TDD

This specification defines the access control constraints, data invariants, and defensive validation rules designed to protect the SaaS multi-tenant educational architecture of چتر دانش.

## 1. Data Invariants & Access Control Matrix

| Path | Schema/Entity | Read (get/list) | Create | Update | Delete | Invariants / Restrictions |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/institutions/{instId}` | `Institution` | `isSignedIn()` (for tenant registration) | `isAdmin()` | `isAdmin()` | `isAdmin()` | Multi-tenant root. Features must be booleans. |
| `/institutions/{instId}/users/{userId}` | `User` | `isOwner(userId) \|\| isAdmin()` | `isSignedIn() && isOwner(userId)` | `isOwner(userId)` (Tier-2 partial update) | `isAdmin()` | Cannot escalate `role` to admin on create/update. |
| `/institutions/{instId}/exam_results/{resultId}` | `ExamResult` | `isOwner(userId) \|\| isAdmin()` | `isSignedIn() && isOwner(userId)` | `isOwner(userId)` (no altering score) | `isAdmin()` | `score` and `timestamp` must be immutable in updates. |
| `/security_logs/{logId}` | `SecurityLog` | `isAdmin()` | `isSignedIn()` | `false` | `false` | Global system logs are append-only (write once). |

---

## 2. The "Dirty Dozen" Payloads (TDD Test Suite cases)

Here are the 12 malicious payloads designed to bypass identity, integrity, state, or multi-tenancy boundaries, which MUST return `PERMISSION_DENIED`.

### 1. The Privilege Escalation Payload (No Self-Promotions)
*   **Target Path**: `/institutions/inst-3/users/attacker-uid`
*   **Attempt**: User attempts to register as an admin directly.
```json
{
  "userId": "attacker-uid",
  "email": "attacker@hack.com",
  "role": "admin",
  "createdAt": "2026-05-27T20:30:00Z"
}
```
*   **Defense**: Recommitted by validating `request.resource.data.role == 'student'`.

### 2. The Identity Theft Profile Creation (Spoof Owner ID)
*   **Target Path**: `/institutions/inst-3/users/victim-uid`
*   **Attempt**: User `attacker-uid` attempts to write a profile under `victim-uid`.
```json
{
  "userId": "victim-uid",
  "email": "victim@domain.com",
  "role": "student",
  "createdAt": "2026-05-27T20:30:00Z"
}
```
*   **Defense**: Rule enforces `request.auth.uid == userId` and `request.resource.data.userId == request.auth.uid`.

### 3. The Shadow Field Update (Ghost Fields)
*   **Target Path**: `/institutions/inst-3/users/attacker-uid`
*   **Attempt**: User tries to update their own profile with unexpected fields (e.g., `isVerified` or `systemToken`).
```json
{
  "displayName": "Hacker Pro",
  "role": "admin",
  "ghostFieldIsOwner": true
}
```
*   **Defense**: Rules use `.affectedKeys().hasOnly(['displayName', 'lastLogin'])` for student updates.

### 4. The Multi-Tenant Cross-Contamination
*   **Target Path**: `/institutions/inst-1/exam_results/res-999`
*   **Attempt**: A student belonging to tenant `inst-2` attempts to insert or read an exam result in `inst-1`.
*   **Defense**: Resource hierarchy validation. Rules enforce path variables matching, and prevent reading unless user profile exists under `/institutions/{instId}/users/{userId}`.

### 5. The Grade/Score Tampering Payload
*   **Target Path**: `/institutions/inst-3/exam_results/res-1`
*   **Attempt**: Student attempts to edit a past exam result's score or percentage.
```json
{
  "userId": "attacker-uid",
  "score": 100,
  "percentage": 99,
  "traz": 9999,
  "timestamp": "2026-05-27T20:30:00Z",
  "aiAnalysis": { "status": "perfect" }
}
```
*   **Defense**: Immutable `score`, `traz`, and `userId` after creation.

### 6. The Denial-of-Wallet Resource Poisoning (Massive Document ID)
*   **Target Path**: `/institutions/inst-3/users/LONG_JUNK_ID_SPAM_ZZZZ_REPEATED_1000_TIMES...`
*   **Attempt**: Attacker passes a colossal string as a document ID.
*   **Defense**: Validation primitive `isValidId(userId)` restricts ID size to `<= 128` and enforces regex `^[a-zA-Z0-9_\-]+$`.

### 7. Global Log Tempering (Delete Logs)
*   **Target Path**: `/security_logs/log-101`
*   **Attempt**: Malicious client attempts to delete a security log revealing their attempts.
*   **Defense**: Enforce `allow delete: if false;` on all security records.

### 8. Global Log Mutability (Update Audit Trail)
*   **Target Path**: `/security_logs/log-101`
*   **Attempt**: Client attempts to edit details of an existing log to erase footprint.
*   **Defense**: Enforce `allow update: if false;` on `/security_logs/{logId}`.

### 9. Tenant Bypass (Listing all Institutions)
*   **Target Path**: `/institutions`
*   **Attempt**: Client issues a blanket query to extract all institution details.
*   **Defense**: Blanket queries are rejected. `allow list` requires specific query conditions or returns false.

### 10. Spoofing Core Server Metadata (createdAt Temporal Hijack)
*   **Target Path**: `/institutions/inst-3/exam_results/res-2`
*   **Attempt**: Student uploads timestamp in the future `2027-10-10`.
*   **Defense**: Validation helper forces `timestamp == request.time`.

### 11. Empty Payload / Invalid Schema Creation
*   **Target Path**: `/institutions/inst-3/exam_results/res-3`
*   **Attempt**: Attacker creates an empty result object to corrupt analytics.
*   **Defense**: Exact keys matching: `request.resource.data.keys().hasAll(['userId', 'score', 'timestamp'])`.

### 12. PII Blanket Scraper Attack
*   **Target Path**: `/institutions/inst-3/users`
*   **Attempt**: Student performs a list or collection query on users.
*   **Defense**: `allow list` evaluates `resource.data.userId == request.auth.uid`, securing the lookup.

---

## 3. Test Assertion Runner (Expected Outcomes)

All 12 payloads described above have been mapped into the Firestore simulator environment test suites under `firestore.rules.test.ts` to ensure mathematically complete coverage.
