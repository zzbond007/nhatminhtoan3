// Lời phản tư bằng giọng nói: trẻ lớp 3 gõ tiếng Việt có dấu rất chậm, nên con có thể NÓI.
// Bản ghi âm nằm trong IndexedDB của chính thiết bị này:
// - không nằm trong localStorage (tránh đầy bộ nhớ hồ sơ),
// - không đi theo mã tiến trình và không đồng bộ lên mạng (giọng nói của trẻ là dữ liệu riêng tư).
// Mọi hàm đều an toàn khi trình duyệt không hỗ trợ: trả về null/false thay vì ném lỗi.

const DATABASE = "math-raccoon-voice";
const STORE = "reflections";
export const VOICE_MAX_SECONDS = 60;
/** Giữ tối đa chừng này bản ghi; bản cũ nhất bị xoá trước. */
export const VOICE_MAX_NOTES = 40;

export type VoiceNote = { key: string; blob: Blob; savedAt: string };

export function voiceNoteKey(missionId: string) {
  return `mission:${missionId}`;
}

export function voiceRecordingSupported() {
  return typeof window !== "undefined" && typeof indexedDB !== "undefined" && typeof MediaRecorder !== "undefined"
    && Boolean(navigator.mediaDevices?.getUserMedia);
}

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") { resolve(null); return; }
    try {
      const request = indexedDB.open(DATABASE, 1);
      request.onupgradeneeded = () => { request.result.createObjectStore(STORE, { keyPath: "key" }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T | null> {
  return open().then((database) => new Promise<T | null>((resolve) => {
    if (!database) { resolve(null); return; }
    try {
      const transaction = database.transaction(STORE, mode);
      const request = action(transaction.objectStore(STORE));
      transaction.oncomplete = () => { database.close(); resolve(request.result ?? null); };
      transaction.onerror = () => { database.close(); resolve(null); };
      transaction.onabort = () => { database.close(); resolve(null); };
    } catch {
      database.close();
      resolve(null);
    }
  }));
}

/** Những khoá cần xoá để chỉ còn `keep` bản ghi mới nhất. */
export function voiceNotesToPrune(notes: Pick<VoiceNote, "key" | "savedAt">[], keep = VOICE_MAX_NOTES) {
  return [...notes].sort((left, right) => right.savedAt.localeCompare(left.savedAt)).slice(keep).map((note) => note.key);
}

export async function saveVoiceNote(key: string, blob: Blob) {
  const saved = await run("readwrite", (store) => store.put({ key, blob, savedAt: new Date().toISOString() } satisfies VoiceNote));
  if (saved === null) return false;
  const all = (await run<VoiceNote[]>("readonly", (store) => store.getAll())) ?? [];
  for (const stale of voiceNotesToPrune(all)) await run("readwrite", (store) => store.delete(stale));
  return true;
}

export async function loadVoiceNote(key: string): Promise<VoiceNote | null> {
  const note = await run<VoiceNote | undefined>("readonly", (store) => store.get(key));
  return note && note.blob instanceof Blob ? note : null;
}

export async function deleteVoiceNote(key: string) {
  await run("readwrite", (store) => store.delete(key));
}
