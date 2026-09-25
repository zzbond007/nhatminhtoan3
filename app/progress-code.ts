// Mã tiến trình: gói toàn bộ hồ sơ học thành một chuỗi chữ để phụ huynh chép lại,
// dán sang thiết bị khác hoặc khôi phục sau khi trình duyệt bị xóa dữ liệu.
// Dạng mã: MR1Z-<kiểm tra>-<base64url> (đã nén gzip) hoặc MR1-<kiểm tra>-<base64url> (không nén).

export type ProgressCodeResult = { ok: true; data: unknown } | { ok: false; reason: string };

const PLAIN_PREFIX = "MR1";
const GZIP_PREFIX = "MR1Z";

function checksum(text: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(text: string) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

async function transform(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const output = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

export async function encodeProgressCode(data: unknown) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  const canCompress = typeof CompressionStream !== "undefined";
  const payload = bytesToBase64Url(canCompress ? await transform(bytes, new CompressionStream("gzip")) : bytes);
  return `${canCompress ? GZIP_PREFIX : PLAIN_PREFIX}-${checksum(payload)}-${payload}`;
}

export async function decodeProgressCode(code: string): Promise<ProgressCodeResult> {
  const compact = code.replace(/\s+/g, "");
  const match = /^(MR1Z?)-([0-9a-f]{8})-([A-Za-z0-9_-]+)$/.exec(compact);
  if (!match) return { ok: false, reason: "Mã không đúng dạng Math Raccoon. Hãy dán lại toàn bộ mã, bắt đầu bằng MR1." };
  const [, prefix, sum, payload] = match;
  if (checksum(payload) !== sum) return { ok: false, reason: "Mã bị thiếu hoặc sai ký tự. Hãy chép lại đủ mã rồi thử lần nữa." };
  try {
    let bytes = base64UrlToBytes(payload);
    if (prefix === GZIP_PREFIX) {
      if (typeof DecompressionStream === "undefined") return { ok: false, reason: "Trình duyệt này chưa đọc được mã nén. Hãy cập nhật Safari hoặc dùng tệp sao lưu JSON." };
      bytes = await transform(bytes, new DecompressionStream("gzip"));
    }
    return { ok: true, data: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, reason: "Không đọc được nội dung mã. Dữ liệu hiện tại được giữ nguyên." };
  }
}
