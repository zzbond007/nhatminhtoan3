// Đồng bộ đám mây qua Google Sheets + Apps Script của chính phụ huynh (docs/cloud-sync).
// Dữ liệu gửi đi là Mã tiến trình (đã nén); mã PIN chỉ được gửi dưới dạng băm SHA-256.

export type CloudConfig = {
  url: string;
  familyCode: string;
  pin: string;
  auto: boolean;
  lastSyncedAt: string | null; // thời điểm đám mây mà máy này đã khớp lần gần nhất
};

export type CloudReply = { ok: true; updatedAt: string | null; code?: string } | { ok: false; error: string };

export const CLOUD_KEY = "math-raccoon-cloud-v1";
const URL_PATTERN = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]{10,}\/exec$/;

export function emptyCloudConfig(): CloudConfig {
  return { url: "", familyCode: "", pin: "", auto: false, lastSyncedAt: null };
}

export function validateCloudConfig(config: Pick<CloudConfig, "url" | "familyCode" | "pin">): string | null {
  if (!URL_PATTERN.test(config.url.trim())) return "Đường dẫn phải là URL Ứng dụng web của Apps Script, dạng https://script.google.com/macros/s/…/exec.";
  if (!/^[A-Za-z0-9-]{4,40}$/.test(config.familyCode.trim())) return "Mã gia đình gồm 4–40 chữ cái không dấu, số hoặc dấu gạch ngang.";
  if (!/^\d{4,8}$/.test(config.pin.trim())) return "Mã PIN gồm 4–8 chữ số.";
  return null;
}

export function normalizeCloudConfig(raw: unknown): CloudConfig {
  if (!raw || typeof raw !== "object") return emptyCloudConfig();
  const value = raw as Partial<CloudConfig>;
  return {
    url: typeof value.url === "string" ? value.url : "",
    familyCode: typeof value.familyCode === "string" ? value.familyCode : "",
    pin: typeof value.pin === "string" ? value.pin : "",
    auto: Boolean(value.auto),
    lastSyncedAt: typeof value.lastSyncedAt === "string" ? value.lastSyncedAt : null,
  };
}

export async function pinHash(familyCode: string, pin: string) {
  const bytes = new TextEncoder().encode(`math-raccoon:${familyCode.trim()}:${pin.trim()}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

type Fetcher = (input: string, init: RequestInit) => Promise<Pick<Response, "ok" | "status" | "json">>;

async function call(config: CloudConfig, body: Record<string, unknown>, fetcher: Fetcher): Promise<CloudReply> {
  const problem = validateCloudConfig(config);
  if (problem) return { ok: false, error: problem };
  try {
    const response = await fetcher(config.url.trim(), {
      method: "POST",
      // text/plain tránh yêu cầu preflight CORS mà Apps Script không hỗ trợ.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ ...body, familyCode: config.familyCode.trim(), pinHash: await pinHash(config.familyCode, config.pin) }),
      redirect: "follow",
    });
    if (!response.ok) return { ok: false, error: `Máy chủ đồng bộ trả lỗi ${response.status}.` };
    const data = await response.json() as Partial<{ ok: boolean; updatedAt: string | null; code: string; error: string }>;
    if (!data.ok) return { ok: false, error: data.error ?? "Không đồng bộ được." };
    return { ok: true, updatedAt: data.updatedAt ?? null, code: data.code };
  } catch {
    return { ok: false, error: "Không kết nối được máy chủ đồng bộ. Kiểm tra mạng rồi thử lại." };
  }
}

const defaultFetch: Fetcher = (input, init) => fetch(input, init);

export function cloudStatus(config: CloudConfig, fetcher: Fetcher = defaultFetch) {
  return call(config, { action: "status" }, fetcher);
}
export function saveToCloud(config: CloudConfig, code: string, fetcher: Fetcher = defaultFetch) {
  return call(config, { action: "save", code }, fetcher);
}
export function loadFromCloud(config: CloudConfig, fetcher: Fetcher = defaultFetch) {
  return call(config, { action: "load" }, fetcher);
}

/** Tự động lưu chỉ an toàn khi đám mây chưa bị máy khác ghi sau lần khớp gần nhất của máy này. */
export function safeToAutoSave(config: CloudConfig, cloudUpdatedAt: string | null) {
  if (!config.auto || !config.lastSyncedAt) return false;
  return !cloudUpdatedAt || cloudUpdatedAt <= config.lastSyncedAt;
}
