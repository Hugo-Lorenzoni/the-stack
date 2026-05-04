import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { cache } from "react";
import { formatMonthInputValue } from "@/utils/month";

export const STATS_ROLES = [Role.USER, Role.WAITING, Role.BAPTISE, Role.ADMIN];

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
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}
function addMonths(date: Date, amount: number) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1),
  );
}
function compareMonths(left: Date, right: Date) {
  const leftKey = left.getUTCFullYear() * 12 + left.getUTCMonth();
  const rightKey = right.getUTCFullYear() * 12 + right.getUTCMonth();
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

export const getUsersStats = cache(async (beginDate?: Date, endDate?: Date) => {
  const now = new Date();
  const defaultEndMonth = normalizeMonth(now);
  const defaultBeginMonth = addMonths(defaultEndMonth, -11);

  const normalizedBegin = normalizeMonth(beginDate ?? defaultBeginMonth);
  const normalizedEnd = normalizeMonth(endDate ?? defaultEndMonth);

  const beginMonth =
    compareMonths(normalizedBegin, normalizedEnd) <= 0
      ? normalizedBegin
      : normalizedEnd;
  const endMonth =
    compareMonths(normalizedBegin, normalizedEnd) <= 0
      ? normalizedEnd
      : normalizedBegin;

  const afterEndMonth = addMonths(endMonth, 1);

  const [usersInWindow, usersBeforeWindow] = await Promise.all([
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: beginMonth,
          lt: afterEndMonth,
        },
      },
      select: {
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.findMany({
      where: {
        createdAt: {
          lt: beginMonth,
        },
      },
      select: {
        role: true,
      },
    }),
  ]);

  const monthlyNewByRole: Record<StatsRole, number[]> = {
    USER: [],
    WAITING: [],
    BAPTISE: [],
    ADMIN: [],
  };

  const totalMonths =
    (endMonth.getFullYear() - beginMonth.getFullYear()) * 12 +
    (endMonth.getMonth() - beginMonth.getMonth()) +
    1;

  for (const role of STATS_ROLES) {
    monthlyNewByRole[role] = Array(totalMonths).fill(0);
  }

  const baselineByRole = buildEmptyRoleCounts();

  for (const user of usersBeforeWindow) {
    baselineByRole[user.role] += 1;
  }

  const startMonthIndex = beginMonth.getFullYear() * 12 + beginMonth.getMonth();

  for (const user of usersInWindow) {
    const monthIndex =
      user.createdAt.getFullYear() * 12 + user.createdAt.getMonth();
    const index = monthIndex - startMonthIndex;

    if (index >= 0 && index < totalMonths) {
      monthlyNewByRole[user.role][index] += 1;
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
      const date = addMonths(beginMonth, index);
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
    beginMonth: formatMonthInputValue(beginMonth),
    endMonth: formatMonthInputValue(endMonth),
  } satisfies UsersStats;
});
