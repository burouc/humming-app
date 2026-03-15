import { NextResponse } from "next/server";
import { z } from "zod";
import { addSession, listSessions } from "@/lib/sessionStore";

const sessionSchema = z.object({
  durationMs: z.number().int().positive(),
  bananasEarned: z.number().int().min(0)
});

export function GET() {
  return NextResponse.json({ sessions: listSessions() });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = sessionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid session payload", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const session = addSession(parsed.data);
  return NextResponse.json({ session }, { status: 201 });
}
