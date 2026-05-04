import { NextResponse } from "next/server";

import { getUsersStats } from "@/utils/getUsersStats";
import { parseMonthInputValue } from "@/utils/month";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const begin = searchParams.get("begin");
  const end = searchParams.get("end");

  if (!begin || !end) {
    return NextResponse.json(
      { message: "Les périodes de début et de fin sont requises." },
      { status: 400 },
    );
  }

  const beginDate = parseMonthInputValue(begin);
  const endDate = parseMonthInputValue(end);

  if (!beginDate || !endDate) {
    return NextResponse.json(
      { message: "Les valeurs de période sont invalides." },
      { status: 400 },
    );
  }

  const stats = await getUsersStats(begin, end);

  return NextResponse.json(stats);
}
