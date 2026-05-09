import { describe, expect, it } from "vitest";
import {
  mergeVoiceTranscript,
  parseRecognitionResults,
  speechErrorMessage,
} from "@/lib/voice-recognition";

describe("voice-recognition helpers", () => {
  it("parseRecognitionResults splits final and interim", () => {
    const ev = {
      results: [
        { isFinal: false, 0: { transcript: "こんに" } },
        { isFinal: true, 0: { transcript: "ちは" } },
      ],
    };
    expect(parseRecognitionResults(ev)).toEqual({
      finalText: "ちは",
      interimText: "こんに",
    });
  });

  it("mergeVoiceTranscript appends when requested", () => {
    expect(mergeVoiceTranscript("a", "b", true)).toBe("a b");
    expect(mergeVoiceTranscript("a", "b", false)).toBe("b");
    expect(mergeVoiceTranscript("", "x", true)).toBe("x");
  });

  it("speechErrorMessage covers known codes", () => {
    expect(speechErrorMessage("no-speech")).toContain("検出");
    expect(speechErrorMessage("not-allowed")).toContain("拒否");
  });
});
