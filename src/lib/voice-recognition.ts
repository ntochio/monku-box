/**
 * Web Speech API（Chrome / Edge 等）の薄いラッパー。
 * PoC ではサーバ STT なしでクライアント完結。
 */

export type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

export type SpeechRecognitionEventLike = {
  results: ArrayLike<SpeechRecognitionResultLike>;
};

export type SpeechRecognitionErrorLike = {
  error: string;
};

export type MonkuSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null;
  onerror: ((ev: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
};

type WindowWithSpeech = Window &
  typeof globalThis & {
    SpeechRecognition?: new () => MonkuSpeechRecognition;
    webkitSpeechRecognition?: new () => MonkuSpeechRecognition;
  };

export function getSpeechRecognitionConstructor():
  | (new () => MonkuSpeechRecognition)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as WindowWithSpeech;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** 1 回の onresult から最終テキストと中間テキストを取り出す */
export function parseRecognitionResults(ev: SpeechRecognitionEventLike): {
  finalText: string;
  interimText: string;
} {
  let finalText = "";
  let interimText = "";
  const { results } = ev;
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const piece = r[0]?.transcript ?? "";
    if (r.isFinal) finalText += piece;
    else interimText += piece;
  }
  return { finalText: finalText.trim(), interimText: interimText.trim() };
}

export function mergeVoiceTranscript(
  previous: string,
  incoming: string,
  append: boolean,
): string {
  const next = incoming.trim();
  if (!next) return previous;
  const prev = previous.trim();
  if (!append || !prev) return next;
  return `${prev} ${next}`;
}

export function speechErrorMessage(code: string): string {
  switch (code) {
    case "no-speech":
      return "音声が検出されませんでした。マイクに向かって話しかけ、もう一度お試しください。";
    case "audio-capture":
      return "マイクを取得できませんでした。デバイス接続やブラウザの権限を確認してください。";
    case "not-allowed":
      return "マイクの使用が拒否されました。アドレスバーの許可設定を確認するか、テキストで入力してください。";
    case "network":
      return "音声認識サービスに接続できませんでした（ネットワーク）。テキスト入力に切り替えてください。";
    case "aborted":
      return "音声入力を停止しました。";
    default:
      return `音声認識エラー（${code}）。テキスト入力に切り替えてください。`;
  }
}
