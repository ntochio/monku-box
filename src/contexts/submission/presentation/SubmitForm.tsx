"use client";

import { startTransition, useCallback, useEffect, useState } from "react";
import type { Role } from "@/domain/role";
import { monkuFetch } from "@/lib/client-api";

type Topic = { topicId: string; label: string };

export function SubmitForm({ role }: { role: Role }) {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topicId, setTopicId] = useState("");
  const [newTopicLabel, setNewTopicLabel] = useState("");
  const [body, setBody] = useState("");
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

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

  const startVoice = () => {
    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        start: () => void;
        onresult: ((ev: {
          results: ArrayLike<{ 0: { transcript: string } }>;
        }) => void) | null;
        onerror: (() => void) | null;
      };
      webkitSpeechRecognition?: new () => {
        lang: string;
        continuous: boolean;
        interimResults: boolean;
        start: () => void;
        onresult: ((ev: {
          results: ArrayLike<{ 0: { transcript: string } }>;
        }) => void) | null;
        onerror: (() => void) | null;
      };
    };
    const SR =
      typeof window !== "undefined"
        ? w.SpeechRecognition || w.webkitSpeechRecognition
        : null;
    if (!SR) {
      setStatus("このブラウザでは音声認識に未対応です。テキストで入力してください。");
      return;
    }
    const rec = new SR();
    rec.lang = "ja-JP";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const text = ev.results[0]?.[0]?.transcript ?? "";
      setTranscript(text);
      setListening(false);
      setStatus("文字起こし完了。内容を確認してから topic と一緒に送信してください。");
    };
    rec.onerror = () => {
      setListening(false);
      setStatus("音声認識に失敗しました。テキスト入力に切り替えてください。");
    };
    setListening(true);
    setStatus(null);
    rec.start();
  };

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
    setNewTopicLabel("");
    void loadTopics();
  };

  if (role !== "submitter") {
    return (
      <p className="text-amber-800" data-testid="submit-role-warning">
        投稿は「投稿者」ロールで行ってください（ホームでロールを切り替え）。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-xl" data-testid="submit-form">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">既存 topic</span>
        <select
          className="border rounded px-2 py-2"
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
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">新規 topic 名（既存と排他）</span>
        <input
          className="border rounded px-2 py-2"
          value={newTopicLabel}
          onChange={(e) => {
            setNewTopicLabel(e.target.value);
            if (e.target.value) setTopicId("");
          }}
          data-testid="submit-new-topic-input"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">本文（テキスト）</span>
        <textarea
          className="border rounded px-2 py-2 min-h-[100px]"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          data-testid="submit-body-textarea"
        />
      </label>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">音声（ブラウザ）</span>
        <button
          type="button"
          className="rounded bg-zinc-200 px-3 py-2 text-sm disabled:opacity-50"
          onClick={startVoice}
          disabled={listening}
          data-testid="submit-voice-button"
        >
          {listening ? "聞き取り中…" : "音声入力開始"}
        </button>
        {transcript ? (
          <label className="flex flex-col gap-1">
            <span className="text-sm">文字起こし（送信前に編集可）</span>
            <textarea
              className="border rounded px-2 py-2"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              data-testid="submit-transcript-textarea"
            />
          </label>
        ) : null}
      </div>
      <button
        type="button"
        className="rounded bg-black text-white px-4 py-2 w-fit"
        onClick={() => void submit()}
        data-testid="submit-send-button"
      >
        送信
      </button>
      {status ? (
        <p className="text-sm text-zinc-700" data-testid="submit-status">
          {status}
        </p>
      ) : null}
    </div>
  );
}
