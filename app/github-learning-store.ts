export type ApprovedPackRef = {
  id: string;
  version: string;
  url: string;
  approvedAt: string;
};

export type GitHubProfileConnection = {
  token: string;
  passphrase: string;
};

export type GitHubProfileSnapshot<T> = {
  profile: T | null;
  sha: string | null;
  exists: boolean;
};

export type GitHubProfileSaveResult<T> = {
  profile: T;
  sha: string;
};

type EncryptedEnvelope = {
  kind: "math-raccoon-learning-profile";
  schemaVersion: 1;
  encryptedAt: string;
  encryption: {
    algorithm: "AES-GCM";
    keyDerivation: "PBKDF2-SHA-256";
    iterations: number;
    salt: string;
    iv: string;
  };
  ciphertext: string;
};

type GitHubContentResponse = {
  content?: string;
  sha?: string;
};

const GITHUB_OWNER = "zzbond007";
const GITHUB_REPOSITORY = "nhatminhtoan3";
const GITHUB_DATA_BRANCH = "learning-data";
const GITHUB_PROFILE_PATH = "profiles/math-raccoon.enc.json";
const GITHUB_API_VERSION = "2026-03-10";
const ENCRYPTION_ITERATIONS = 310_000;

export const GITHUB_PROFILE_LOCATION = `${GITHUB_OWNER}/${GITHUB_REPOSITORY}@${GITHUB_DATA_BRANCH}:${GITHUB_PROFILE_PATH}`;

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };
}

function profileApiUrl() {
  const path = GITHUB_PROFILE_PATH.split("/").map(encodeURIComponent).join("/");
  return `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/contents/${path}`;
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunk = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunk) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunk));
  }
  return window.btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = window.atob(value.replace(/\s/g, ""));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function ownedArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function utf8ToBase64(value: string) {
  return bytesToBase64(new TextEncoder().encode(value));
}

function base64ToUtf8(value: string) {
  return new TextDecoder().decode(base64ToBytes(value));
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(passphrase.normalize("NFC")),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: ownedArrayBuffer(salt),
      iterations: ENCRYPTION_ITERATIONS,
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptProfile<T>(
  profile: T,
  passphrase: string,
): Promise<EncryptedEnvelope> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const plaintext = new TextEncoder().encode(JSON.stringify(profile));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ownedArrayBuffer(iv) },
    key,
    ownedArrayBuffer(plaintext),
  );
  return {
    kind: "math-raccoon-learning-profile",
    schemaVersion: 1,
    encryptedAt: new Date().toISOString(),
    encryption: {
      algorithm: "AES-GCM",
      keyDerivation: "PBKDF2-SHA-256",
      iterations: ENCRYPTION_ITERATIONS,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
    },
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decryptProfile<T>(
  envelope: EncryptedEnvelope,
  passphrase: string,
): Promise<T> {
  if (
    envelope.kind !== "math-raccoon-learning-profile" ||
    envelope.schemaVersion !== 1 ||
    envelope.encryption.algorithm !== "AES-GCM" ||
    envelope.encryption.keyDerivation !== "PBKDF2-SHA-256"
  ) {
    throw new Error("unsupported-profile-envelope");
  }
  const salt = base64ToBytes(envelope.encryption.salt);
  const iv = base64ToBytes(envelope.encryption.iv);
  const key = await deriveKey(passphrase, salt);
  try {
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ownedArrayBuffer(iv) },
      key,
      ownedArrayBuffer(base64ToBytes(envelope.ciphertext)),
    );
    return JSON.parse(new TextDecoder().decode(plaintext)) as T;
  } catch {
    throw new Error("profile-decryption-failed");
  }
}

function githubError(status: number) {
  if (status === 401) return new Error("github-token-invalid");
  if (status === 403) return new Error("github-token-forbidden");
  if (status === 409) return new Error("github-profile-conflict");
  if (status === 422) return new Error("github-profile-rejected");
  return new Error(`github-profile-http-${status}`);
}

export async function loadGitHubProfile<T>(
  connection: GitHubProfileConnection,
): Promise<GitHubProfileSnapshot<T>> {
  const response = await fetch(
    `${profileApiUrl()}?ref=${encodeURIComponent(GITHUB_DATA_BRANCH)}&t=${Date.now()}`,
    {
      headers: githubHeaders(connection.token),
      cache: "no-store",
    },
  );
  if (response.status === 404)
    return { profile: null, sha: null, exists: false };
  if (!response.ok) throw githubError(response.status);
  const data = (await response.json()) as GitHubContentResponse;
  if (!data.content || !data.sha)
    throw new Error("github-profile-invalid-response");
  const envelope = JSON.parse(base64ToUtf8(data.content)) as EncryptedEnvelope;
  return {
    profile: await decryptProfile<T>(envelope, connection.passphrase),
    sha: data.sha,
    exists: true,
  };
}

export async function saveGitHubProfile<T>(
  connection: GitHubProfileConnection,
  profile: T,
  sha: string | null,
): Promise<GitHubProfileSaveResult<T>> {
  const envelope = await encryptProfile(profile, connection.passphrase);
  const body: Record<string, string> = {
    message: "Cập nhật lịch sử học Math Raccoon",
    content: utf8ToBase64(`${JSON.stringify(envelope, null, 2)}\n`),
    branch: GITHUB_DATA_BRANCH,
  };
  if (sha) body.sha = sha;
  const response = await fetch(profileApiUrl(), {
    method: "PUT",
    headers: {
      ...githubHeaders(connection.token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw githubError(response.status);
  const data = (await response.json()) as { content?: { sha?: string } };
  const nextSha = data.content?.sha;
  if (!nextSha) throw new Error("github-profile-missing-sha");
  return { profile, sha: nextSha };
}

export async function verifyGitHubProfile<T>(
  connection: GitHubProfileConnection,
  expectedProfileId: string,
): Promise<GitHubProfileSnapshot<T>> {
  const snapshot = await loadGitHubProfile<T>(connection);
  const profile = snapshot.profile as { profileId?: unknown } | null;
  if (!profile || profile.profileId !== expectedProfileId)
    throw new Error("github-profile-verification-failed");
  return snapshot;
}

export function describeGitHubProfileError(error: unknown) {
  const code = error instanceof Error ? error.message : "unknown";
  const messages: Record<string, string> = {
    "github-token-invalid": "Token GitHub không hợp lệ hoặc đã hết hạn.",
    "github-token-forbidden":
      "Token chưa có quyền Contents: Read and write đối với repository này.",
    "github-profile-conflict":
      "Hồ sơ vừa được thay đổi ở nơi khác. Hãy tải lại trước khi tiếp tục.",
    "github-profile-rejected":
      "GitHub từ chối bản ghi. Hãy kiểm tra nhánh learning-data và quyền token.",
    "github-profile-invalid-response": "Phản hồi hồ sơ từ GitHub không đầy đủ.",
    "github-profile-missing-sha":
      "GitHub đã nhận yêu cầu nhưng chưa trả mã xác minh tệp.",
    "github-profile-verification-failed":
      "Bản vừa lưu không khớp hồ sơ đang mở.",
    "profile-decryption-failed":
      "Không giải mã được hồ sơ. Mật khẩu mã hóa có thể chưa đúng.",
    "unsupported-profile-envelope":
      "Định dạng hồ sơ GitHub chưa được phiên bản này hỗ trợ.",
  };
  return (
    messages[code] ??
    "Chưa kết nối được kho lịch sử GitHub. Dữ liệu trong phiên hiện tại chưa bị xóa."
  );
}
