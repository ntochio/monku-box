import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import type { DataStoreSnapshot } from "@/domain/models";

const DEFAULT_BLOCKED = ["死ね", "殺す"];

export function getStoreFilePath(): string {
  const base = process.env.MONKU_DATA_DIR || join(process.cwd(), ".data");
  return join(base, "store.json");
}

export function emptyStore(): DataStoreSnapshot {
  return {
    topics: [],
    messages: [],
    policyResults: [],
    notificationEvents: [],
    notificationViews: [],
    suggestions: [],
    accounts: [],
    blockedWords: [...DEFAULT_BLOCKED],
    version: 1,
  };
}

export class MonkuJsonStore {
  constructor(private readonly filePath: string = getStoreFilePath()) {}

  read(): DataStoreSnapshot {
    if (!existsSync(this.filePath)) {
      return emptyStore();
    }
    const raw = readFileSync(this.filePath, "utf-8");
    const data = JSON.parse(raw) as DataStoreSnapshot;
    if (!Array.isArray(data.blockedWords) || data.blockedWords.length === 0) {
      data.blockedWords = [...DEFAULT_BLOCKED];
    }
    return data;
  }

  write(data: DataStoreSnapshot): void {
    mkdirSync(dirname(this.filePath), { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  withTransaction<T>(fn: (data: DataStoreSnapshot) => T): T {
    const data = this.read();
    const out = fn(data);
    this.write(data);
    return out;
  }
}
