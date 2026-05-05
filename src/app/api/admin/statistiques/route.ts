import { postHogServerClient } from "@/lib/posthog";
import { NextResponse } from "next/server";

import { getUsersStats, MAX_STATS_MONTHS } from "@/utils/getUsersStats";
import { parseMonthInputValue } from "@/utils/month";

export async function GET(request: Request) {
  try {
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

    const startDate = beginDate <= endDate ? beginDate : endDate;
    const endDateNorm = beginDate <= endDate ? endDate : beginDate;
    const totalMonths =
      (endDateNorm.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
      (endDateNorm.getUTCMonth() - startDate.getUTCMonth()) +
      1;

    if (totalMonths > MAX_STATS_MONTHS) {
      return NextResponse.json(
        {
          message: `La période demandée dépasse le maximum autorisé de ${MAX_STATS_MONTHS} mois.`,
        },
        { status: 400 },
      );
    }

    const stats = await getUsersStats(begin, end);

    return NextResponse.json(stats);
  } catch (error) {
    postHogServerClient.captureException(error);
    return NextResponse.json(
      { message: "Something went wrong !" },
      { status: 500 },
    );
  }
}
