import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { cache } from "react";

export const STATS_ROLES = [Role.USER, Role.WAITING, Role.BAPTISE, Role.ADMIN];

export type StatsRole = (typeof STATS_ROLES)[number];

export type UserStatsMonth = {
  key: string;
  label: string;
  newUsersByRole: Record<StatsRole, number>;
  cumulativeByRole: Record<StatsRole, number>;
};

export const getUsersStats = cache(async () => {
  const now = new Date();
  const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startMonth = new Date(
    endMonth.getFullYear(),
    endMonth.getMonth() - 11,
    1,
  );

  const [usersInWindow, usersBeforeWindow] = await Promise.all([
    prisma.user.findMany({
      where: {
        createdAt: {
          gte: startMonth,
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
          lt: startMonth,
        },
      },
      select: {
        role: true,
      },
    }),
  ]);

  const monthlyNewByRole: Record<StatsRole, number[]> = {
    USER: Array(12).fill(0),
    WAITING: Array(12).fill(0),
    BAPTISE: Array(12).fill(0),
    ADMIN: Array(12).fill(0),
  };

  const baselineByRole: Record<StatsRole, number> = {
    USER: 0,
    WAITING: 0,
    BAPTISE: 0,
    ADMIN: 0,
  };

  for (const user of usersBeforeWindow) {
    baselineByRole[user.role] += 1;
  }

  const startMonthIndex = startMonth.getFullYear() * 12 + startMonth.getMonth();

  for (const user of usersInWindow) {
    const monthIndex =
      user.createdAt.getFullYear() * 12 + user.createdAt.getMonth();
    const index = monthIndex - startMonthIndex;

    if (index >= 0 && index < 12) {
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

  const months: UserStatsMonth[] = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(
      startMonth.getFullYear(),
      startMonth.getMonth() + index,
      1,
    );
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

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
  });

  return {
    months,
    roles: STATS_ROLES,
  };
});
