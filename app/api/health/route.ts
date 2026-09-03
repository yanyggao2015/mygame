import { NextResponse } from "next/server";
import { getBuildId } from "@/lib/build-info";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      buildId: getBuildId(),
    },
    { status: 200 },
  );
}
