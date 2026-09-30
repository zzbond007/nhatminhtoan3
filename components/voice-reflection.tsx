"use client";

// Ghi âm lời phản tư (lưu trên máy, xem app/voice-notes.ts). Ẩn hẳn khi trình duyệt không hỗ trợ.

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2 } from "lucide-react";
import { deleteVoiceNote, loadVoiceNote, saveVoiceNote, VOICE_MAX_SECONDS, voiceRecordingSupported } from "@/app/voice-notes";

type Props = {
  noteKey: string;
  /** Báo cho màn nhiệm vụ biết đã có bản ghi âm hay chưa. */
  onChange?: (hasNote: boolean) => void;
  /** Chỉ nghe lại (màn kết quả, góc phụ huynh). */
  readOnly?: boolean;
};

export function VoiceReflection({ noteKey, onChange, readOnly = false }: Props) {
  const [supported, setSupported] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const changeRef = useRef(onChange);
  useEffect(() => { changeRef.current = onChange; });

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    const task = window.setTimeout(() => {
      setSupported(voiceRecordingSupported());
      void loadVoiceNote(noteKey).then((note) => {
        if (cancelled) return;
        url = note ? URL.createObjectURL(note.blob) : null;
        setAudioUrl(url);
        changeRef.current?.(Boolean(note));
      });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(task);
      if (url) URL.revokeObjectURL(url);
    };
  }, [noteKey]);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
  }, []);

  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    setRecording(false);
  }

  async function start() {
    setMessage("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/mp4" });
        if (!blob.size) { setMessage("Chưa thu được tiếng. Con thử lại nhé."); return; }
        void saveVoiceNote(noteKey, blob).then((saved) => {
          if (!saved) { setMessage("Máy chưa lưu được bản ghi âm. Con có thể chọn câu mở đầu bên trên."); return; }
          setAudioUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return URL.createObjectURL(blob); });
          changeRef.current?.(true);
        });
      };
      recorderRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = window.setInterval(() => {
        setSeconds((value) => {
          if (value + 1 >= VOICE_MAX_SECONDS) stop();
          return value + 1;
        });
      }, 1000);
    } catch {
      setMessage("Chưa dùng được micro. Ba mẹ hãy cho phép micro, hoặc con chọn câu mở đầu bên trên.");
    }
  }

  async function remove() {
    await deleteVoiceNote(noteKey);
    setAudioUrl((previous) => { if (previous) URL.revokeObjectURL(previous); return null; });
    changeRef.current?.(false);
  }

  if (readOnly) {
    return audioUrl ? <div className="voice-reflection"><span className="voice-reflection-label"><Mic /> Lời con kể</span><audio controls src={audioUrl} /></div> : null;
  }
  if (!supported && !audioUrl) return null;

  return (
    <div className="voice-reflection">
      {recording ? (
        <button type="button" className="voice-button recording" onClick={stop}><Square /> Dừng ghi âm · {seconds}s</button>
      ) : supported ? (
        <button type="button" className="voice-button" onClick={() => void start()}><Mic /> {audioUrl ? "Ghi âm lại" : "Nói thay vì gõ"}</button>
      ) : null}
      {audioUrl && !recording && <><audio controls src={audioUrl} /><button type="button" className="voice-delete" onClick={() => void remove()} aria-label="Xoá bản ghi âm"><Trash2 /></button></>}
      <small>{message || `Bản ghi âm chỉ lưu trên máy này, dài nhất ${VOICE_MAX_SECONDS} giây.`}</small>
    </div>
  );
}
