import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { cache } from "react";
import { formatMonthInputValue, parseMonthInputValue } from "@/utils/month";

export const STATS_ROLES = [Role.USER, Role.WAITING, Role.BAPTISE, Role.ADMIN];

export const MAX_STATS_MONTHS = 120;

export type StatsRole = (typeof STATS_ROLES)[number];

export type UserStatsMonth = {
  key: string;
  label: string;
  newUsersByRole: Record<StatsRole, number>;
  cumulativeByRole: Record<StatsRole, number>;
};

export type UsersStats = {
  months: UserStatsMonth[];
  roles: StatsRole[];
  beginMonth: string;
  endMonth: string;
};

function normalizeMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}
function compareMonths(left: Date, right: Date) {
  const leftKey = left.getFullYear() * 12 + left.getMonth();
  const rightKey = right.getFullYear() * 12 + right.getMonth();
  return leftKey - rightKey;
}

function buildEmptyRoleCounts() {
  return {
    USER: 0,
    WAITING: 0,
    BAPTISE: 0,
    ADMIN: 0,
  } satisfies Record<StatsRole, number>;
}

export const getUsersStats = cache(
  async (beginMonth?: string, endMonth?: string) => {
    const now = new Date();
    const defaultEndMonth = normalizeMonth(now);
    const defaultBeginMonth = addMonths(defaultEndMonth, -11);

    const parsedBegin = beginMonth ? parseMonthInputValue(beginMonth) : null;
    const parsedEnd = endMonth ? parseMonthInputValue(endMonth) : null;

    const normalizedBegin = normalizeMonth(parsedBegin ?? defaultBeginMonth);
    const normalizedEnd = normalizeMonth(parsedEnd ?? defaultEndMonth);

    const startDate =
      compareMonths(normalizedBegin, normalizedEnd) <= 0
        ? normalizedBegin
        : normalizedEnd;
    const endDate =
      compareMonths(normalizedBegin, normalizedEnd) <= 0
        ? normalizedEnd
        : normalizedBegin;

    const afterEndDate = addMonths(endDate, 1);

    const totalMonths =
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth()) +
      1;

    if (totalMonths > MAX_STATS_MONTHS) {
      throw new RangeError(
        `La période demandée dépasse le maximum autorisé de ${MAX_STATS_MONTHS} mois.`,
      );
    }

    const [windowGroups, baselineGroups] = await Promise.all([
      prisma.$queryRaw<{ month: string; role: string; count: bigint }[]>`
        SELECT DATE_FORMAT(createdAt, '%Y-%m') AS month,
               role,
               COUNT(*) AS count
        FROM User
        WHERE createdAt >= ${startDate} AND createdAt < ${afterEndDate}
        GROUP BY DATE_FORMAT(createdAt, '%Y-%m'), role
        ORDER BY month
      `,
      prisma.user.groupBy({
        by: ["role"],
        where: { createdAt: { lt: startDate } },
        _count: { _all: true },
      }),
    ]);

    const monthlyNewByRole: Record<StatsRole, number[]> = {
      USER: Array(totalMonths).fill(0),
      WAITING: Array(totalMonths).fill(0),
      BAPTISE: Array(totalMonths).fill(0),
      ADMIN: Array(totalMonths).fill(0),
    };

    const startMonthIndex =
      startDate.getFullYear() * 12 + startDate.getMonth();

    for (const row of windowGroups) {
      const role = row.role as StatsRole;
      if (!STATS_ROLES.includes(role)) continue;
      const [year, month] = row.month.split("-").map(Number);
      const index = year * 12 + (month - 1) - startMonthIndex;
      if (index >= 0 && index < totalMonths) {
        monthlyNewByRole[role][index] += Number(row.count);
      }
    }

    const baselineByRole = buildEmptyRoleCounts();
    for (const group of baselineGroups) {
      const role = group.role as StatsRole;
      if (STATS_ROLES.includes(role)) {
        baselineByRole[role] = group._count._all;
      }
    }

    const formatter = new Intl.DateTimeFormat("fr-BE", {
      month: "short",
      year: "2-digit",
    });

    const runningTotals: Record<StatsRole, number> = {
      ...baselineByRole,
    };

    const months: UserStatsMonth[] = Array.from(
      { length: totalMonths },
      (_, index) => {
        const date = addMonths(startDate, index);
        const key = formatMonthInputValue(date);

        const newUsersByRole: Record<StatsRole, number> = {
          USER: monthlyNewByRole.USER[index],
          WAITING: monthlyNewByRole.WAITING[index],
          BAPTISE: monthlyNewByRole.BAPTISE[index],
          ADMIN: monthlyNewByRole.ADMIN[index],
        };

        runningTotals.USER += newUsersByRole.USER;
        runningTotals.WAITING += newUsersByRole.WAITING;
        runningTotals.BAPTISE += newUsersByRole.BAPTISE;
        runningTotals.ADMIN += newUsersByRole.ADMIN;

        const cumulativeByRole: Record<StatsRole, number> = {
          ...runningTotals,
        };

        return {
          key,
          label: formatter.format(date),
          newUsersByRole,
          cumulativeByRole,
        };
      },
    );

    return {
      months,
      roles: STATS_ROLES,
      beginMonth: formatMonthInputValue(startDate),
      endMonth: formatMonthInputValue(endDate),
    } satisfies UsersStats;
  },
);
