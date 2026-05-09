import { createId } from "./ids";
import type { PolicyResultRecord } from "./models";

const MIN_LEN = 1;
const MAX_LEN = 8000;

export type PolicyApplyOutput = {
  bodyDisplay: string;
  policyResult: PolicyResultRecord;
};

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function applyContentPolicy(
  bodyRaw: string,
  blockedWords: string[],
  messageId: string,
): PolicyApplyOutput {
  const trimmed = bodyRaw.trim();
  const requiredCheckOk = trimmed.length >= MIN_LEN;
  const lengthCheckOk = bodyRaw.length <= MAX_LEN;

  let bodyDisplay = trimmed.length > 0 ? trimmed : "（空の投稿）";
  if (!lengthCheckOk) {
    bodyDisplay = bodyRaw.slice(0, MAX_LEN).trim() || "（長さ上限で切り詰め）";
  }

  const maskedTerms: string[] = [];
  for (const word of blockedWords) {
    if (!word) continue;
    const re = new RegExp(escapeRegExp(word), "gi");
    if (re.test(bodyDisplay)) {
      maskedTerms.push(word);
      bodyDisplay = bodyDisplay.replace(re, "***");
    }
  }

  const policyResult: PolicyResultRecord = {
    policyResultId: createId(),
    messageId,
    requiredCheckOk,
    lengthCheckOk: bodyRaw.length <= MAX_LEN,
    maskApplied: maskedTerms.length > 0,
    maskedTerms,
    finalAction: "accept_with_mask",
  };

  return { bodyDisplay, policyResult };
}
