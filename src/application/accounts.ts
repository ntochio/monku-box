import { ValidationError } from "@/application/errors";
import { createId } from "@/domain/ids";
import type { AccountRecord } from "@/domain/models";
import type { Role } from "@/domain/role";
import { MonkuJsonStore } from "@/infrastructure/persistence/json-store";

export function listAccounts(store: MonkuJsonStore = new MonkuJsonStore()): AccountRecord[] {
  return store.read().accounts;
}

export function createAccount(
  email: string,
  role: Role,
  store: MonkuJsonStore = new MonkuJsonStore(),
): AccountRecord {
  const em = email.trim().toLowerCase();
  if (!em) throw new ValidationError("email が必要です");
  return store.withTransaction((data) => {
    if (data.accounts.some((a) => a.email.toLowerCase() === em)) {
      throw new ValidationError("同じメールのアカウントがあります");
    }
    const acc: AccountRecord = {
      accountId: createId(),
      email: em,
      role,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    data.accounts.push(acc);
    return acc;
  });
}

export function updateBlockedWords(
  words: string[],
  store: MonkuJsonStore = new MonkuJsonStore(),
) {
  return store.withTransaction((data) => {
    data.blockedWords = [...new Set(words.map((w) => w.trim()).filter(Boolean))];
    return { blockedWords: data.blockedWords };
  });
}

export function getBlockedWords(store: MonkuJsonStore = new MonkuJsonStore()) {
  return store.read().blockedWords;
}
