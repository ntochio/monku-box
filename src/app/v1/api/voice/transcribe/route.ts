import { NextResponse } from "next/server";

/** PoC: ブラウザ STT 優先。サーバ経由 STT は未設定時 501。 */
export async function POST() {
  return NextResponse.json(
    {
      error: {
        code: "NOT_IMPLEMENTED",
        message:
          "サーバ側 STT は未実装です。ブラウザの音声認識を利用してください。",
      },
    },
    { status: 501 },
  );
}
