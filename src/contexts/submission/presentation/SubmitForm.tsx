"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Role } from "@/domain/role";
import { monkuFetch } from "@/lib/client-api";
import type { MonkuSpeechRecognition } from "@/lib/voice-recognition";
import {
  getSpeechRecognitionConstructor,
  mergeVoiceTranscript,
  parseRecognitionResults,
  speechErrorMessage,
} from "@/lib/voice-recognition";

type Topic = { topicId: string; label: string };

export function SubmitForm({ role }: { role: Role }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState("");
  const [newTopicLabel, setNewTopicLabel] = useState("");
  const [body, setBody] = useState("");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [appendVoice, setAppendVoice] = useState(true);
  const recRef = useRef<MonkuSpeechRecognition | null>(null);

  const loadTopics = useCallback(async () => {
    const res = await monkuFetch("/v1/api/topics", role);
    const data = (await res.json()) as { topics: Topic[] };
    setTopics(data.topics ?? []);
  }, [role]);

  useEffect(() => {
    startTransition(() => {
      void loadTopics();
    });
  }, [loadTopics]);

  const stopVoice = useCallback(() => {
    const rec = recRef.current;
    recRef.current = null;
    if (rec) {
      try {
        rec.stop();
      } catch {
        try {
          rec.abort();
        } catch {
          /* ignore */
        }
      }
    }
    setListening(false);
    setInterim("");
  }, []);

  useEffect(() => () => stopVoice(), [stopVoice]);

  const startVoice = useCallback(() => {
    const SR = getSpeechRecognitionConstructor();
    if (!SR) {
      setStatus(
        "このブラウザでは Web Speech API（音声認識）に未対応です。Chrome / Edge の最新版、または HTTPS で開いてください。テキストで入力できます。",
      );
      return;
    }

    stopVoice();

    const rec = new SR();
    recRef.current = rec;
    rec.lang = "ja-JP";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (ev) => {
      const { finalText, interimText } = parseRecognitionResults(ev);
      setInterim(interimText);
      if (finalText) {
        setTranscript((prev) => mergeVoiceTranscript(prev, finalText, appendVoice));
        setInterim("");
        setStatus(
          "文字起こしを反映しました。必要なら編集し、topic を選んで送信してください。",
        );
      }
    };

    rec.onerror = (errEv) => {
      const code = errEv.error ?? "unknown";
      setListening(false);
      setInterim("");
      recRef.current = null;
      if (code === "aborted") {
        setStatus(speechErrorMessage(code));
        return;
      }
      setStatus(speechErrorMessage(code));
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
      recRef.current = null;
    };

    setListening(true);
    setStatus("聞き取り中です。話し終えたら「認識を停止」を押してください。");
    try {
      rec.start();
    } catch {
      setListening(false);
      recRef.current = null;
      setStatus("音声認識を開始できませんでした。テキストで入力してください。");
    }
  }, [appendVoice, stopVoice]);

  const submit = async () => {
    setStatus(null);
    const text = transcript || body;
    if (!text.trim()) {
      setStatus("本文（または音声の文字起こし）を入力してください。");
      return;
    }
    const tid = topicId || undefined;
    const tlabel = newTopicLabel.trim();
    if (!tid && !tlabel) {
      setStatus("既存 topic を選ぶか、新規 topic 名を入力してください。");
      return;
    }
    const res = await monkuFetch("/v1/api/messages", role, {
      method: "POST",
      body: JSON.stringify({
        topicId: tid || undefined,
        topicLabel: tlabel || undefined,
        body: text,
        inputType: transcript ? "voice" : "text",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setStatus((data as { error?: { message?: string } }).error?.message ?? "送信に失敗しました");
      return;
    }
    setStatus("投稿しました。");
    setBody("");
    setTranscript("");
    setInterim("");
    setNewTopicLabel("");
    void loadTopics();
  };

  if (role !== "submitter") {
    return (
      <p
        className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
        data-testid="submit-role-warning"
      >
        投稿は「投稿者」ロールで行ってください（ホームでロールを切り替え）。
      </p>
    );
  }

  return (
    <div className="flex max-w-xl flex-col gap-4" data-testid="submit-form">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">既存 topic</span>
        <select
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-950"
          value={topicId}
          onChange={(e) => {
            setTopicId(e.target.value);
            if (e.target.value) setNewTopicLabel("");
          }}
          data-testid="submit-topic-select"
        >
          <option value="">（選択なし）</option>
          {topics.map((t) => (
            <option key={t.topicId} value={t.topicId}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">新規 topic 名（既存と排他）</span>
        <input
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-950"
          value={newTopicLabel}
          onChange={(e) => {
            setNewTopicLabel(e.target.value);
            if (e.target.value) setTopicId("");
          }}
          data-testid="submit-new-topic-input"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">本文（テキスト）</span>
        <textarea
          className="min-h-[100px] rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm shadow-sm dark:border-zinc-600 dark:bg-zinc-950"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          data-testid="submit-body-textarea"
        />
      </label>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">音声入力（ブラウザ Web Speech API）</span>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
          Chrome / Edge 推奨。HTTPS または localhost でマイク許可が必要です。確定した認識結果は下の「文字起こし」に入ります（送信前に編集可能）。
        </p>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={appendVoice}
            onChange={(e) => setAppendVoice(e.target.checked)}
            data-testid="submit-voice-append"
          />
          新しい発話を既存の文字起こしに追記する（オフのときは最新の確定結果で上書き）
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            onClick={() => void startVoice()}
            disabled={listening}
            data-testid="submit-voice-button"
          >
            {listening ? "聞き取り中…" : "音声入力を開始"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            onClick={() => {
              stopVoice();
              setStatus("音声入力を停止しました。");
            }}
            disabled={!listening}
            data-testid="submit-voice-stop-button"
          >
            認識を停止
          </button>
        </div>
        {listening && interim ? (
          <p className="mt-2 text-sm italic text-zinc-500 dark:text-zinc-400" data-testid="submit-voice-interim">
            認識中: {interim}
          </p>
        ) : null}
        <label className="mt-4 flex flex-col gap-1">
          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">文字起こし（送信前に編集可）</span>
          <textarea
            className="min-h-[100px] rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm dark:border-zinc-600 dark:bg-zinc-950"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="音声の結果がここに入ります。テキストのみで投稿する場合は空のままでも構いません。"
            data-testid="submit-transcript-textarea"
          />
        </label>
      </div>

      <button
        type="button"
        className="w-fit rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        onClick={() => void submit()}
        data-testid="submit-send-button"
      >
        送信
      </button>
      {status ? (
        <p className="text-sm text-zinc-700 dark:text-zinc-300" data-testid="submit-status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
