"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  StatsRole,
  UserStatsMonth,
  UsersStats,
} from "@/utils/getUsersStats";
import { isValidMonthInputValue } from "@/utils/month";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const ROLE_LABELS: Record<StatsRole, string> = {
  USER: "Utilisateur",
  WAITING: "En attente",
  BAPTISE: "Baptisé",
  ADMIN: "Administrateur",
};

const ROLE_COLORS: Record<StatsRole, string> = {
  USER: "#2563eb",
  WAITING: "#f59e0b",
  BAPTISE: "#10b981",
  ADMIN: "#ef4444",
};

const MONTH_LABELS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

type UsersStatsChartsProps = {
  initialStats: UsersStats;
};

const API_ROUTE = "/api/admin/statistiques";

export function UsersStatsCharts({ initialStats }: UsersStatsChartsProps) {
  const [selectedRoles, setSelectedRoles] = useState<StatsRole[]>(
    initialStats.roles,
  );
  const [beginMonth, setBeginMonth] = useState(initialStats.beginMonth);
  const [endMonth, setEndMonth] = useState(initialStats.endMonth);
  const [stats, setStats] = useState<UsersStats>(initialStats);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadStats() {
      if (
        !isValidMonthInputValue(beginMonth) ||
        !isValidMonthInputValue(endMonth)
      ) {
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(
          `${API_ROUTE}?begin=${beginMonth}&end=${endMonth}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;

          throw new Error(
            payload?.message ?? "Impossible de charger les statistiques.",
          );
        }

        const nextStats = (await response.json()) as UsersStats;
        setStats(nextStats);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Erreur inconnue.";
        setErrorMessage(message);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();

    return () => {
      controller.abort();
    };
  }, [beginMonth, endMonth]);

  const months = stats.months;
  const roles = stats.roles;

  const selectedLabel =
    selectedRoles.length === roles.length
      ? "Tous les rôles"
      : `${selectedRoles.length} rôles sélectionnés`;

  const selectedSet = useMemo(() => new Set(selectedRoles), [selectedRoles]);
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const beginYear = Number(beginMonth.slice(0, 4));
    const endYear = Number(endMonth.slice(0, 4));
    const minimumYear = Math.min(beginYear, endYear, currentYear - 5);
    const maximumYear = Math.max(beginYear, endYear, currentYear);

    return Array.from({ length: maximumYear - minimumYear + 1 }, (_, index) =>
      String(minimumYear + index),
    );
  }, [beginMonth, endMonth]);

  const beginMonthIndex = Number(beginMonth.slice(5, 7)) - 1;
  const beginYearValue = beginMonth.slice(0, 4);
  const endMonthIndex = Number(endMonth.slice(5, 7)) - 1;
  const endYearValue = endMonth.slice(0, 4);

  const cumulativeMax = useMemo(() => {
    return Math.max(
      1,
      ...months.flatMap((month: UserStatsMonth) =>
        roles.map((role: StatsRole) =>
          selectedSet.has(role) ? month.cumulativeByRole[role] : 0,
        ),
      ),
    );
  }, [months, roles, selectedSet]);

  const newUsersMax = useMemo(() => {
    return Math.max(
      1,
      ...months.flatMap((month: UserStatsMonth) =>
        roles.map((role: StatsRole) =>
          selectedSet.has(role) ? month.newUsersByRole[role] : 0,
        ),
      ),
    );
  }, [months, roles, selectedSet]);

  const toggleRole = (role: StatsRole, checked: boolean) => {
    setSelectedRoles((current) => {
      if (checked) {
        return current.includes(role) ? current : [...current, role];
      }

      return current.filter((item) => item !== role);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between">
              Filtrer les rôles ({selectedLabel})
              <ChevronDown className="size-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3">
            <div className="space-y-2">
              {roles.map((role: StatsRole) => (
                <label
                  key={role}
                  className="hover:bg-muted flex items-center gap-2 rounded px-2 py-1 text-sm"
                >
                  <Checkbox
                    checked={selectedSet.has(role)}
                    onCheckedChange={(value) =>
                      toggleRole(role, value === true)
                    }
                  />
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: ROLE_COLORS[role] }}
                    />
                    {ROLE_LABELS[role]}
                  </span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <MonthYearSelect
          label="Début de période"
          monthValue={beginMonthIndex}
          yearValue={beginYearValue}
          years={availableYears}
          maxYear={Number(endYearValue)}
          onMonthChange={(monthIndex) => {
            const nextMonth = String(monthIndex + 1).padStart(2, "0");
            setBeginMonth(`${beginYearValue}-${nextMonth}`);
          }}
          onYearChange={(year) => {
            const nextYear = year;
            const nextMonth = String(beginMonthIndex + 1).padStart(2, "0");
            setBeginMonth(`${nextYear}-${nextMonth}`);
          }}
        />
        <MonthYearSelect
          label="Fin de période"
          monthValue={endMonthIndex}
          yearValue={endYearValue}
          years={availableYears}
          minYear={Number(beginYearValue)}
          maxYear={new Date().getFullYear()}
          onMonthChange={(monthIndex) => {
            const nextMonth = String(monthIndex + 1).padStart(2, "0");
            setEndMonth(`${endYearValue}-${nextMonth}`);
          }}
          onYearChange={(year) => {
            const nextYear = year;
            const nextMonth = String(endMonthIndex + 1).padStart(2, "0");
            setEndMonth(`${nextYear}-${nextMonth}`);
          }}
        />
      </div>

      {errorMessage ? (
        <p className="text-sm text-red-600">{errorMessage}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Évolution cumulée des utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground flex h-90.5 w-full animate-pulse items-center justify-center rounded-2xl bg-gray-50 text-sm">
                Chargement des statistiques...
              </p>
            ) : selectedRoles.length === 0 ? (
              <p className="text-muted-foreground flex h-90.5 w-full items-center justify-center text-sm">
                Sélectionnez au moins un rôle pour afficher le graphique.
              </p>
            ) : (
              <CumulativeChart
                months={months}
                roles={roles}
                selectedSet={selectedSet}
                maxValue={cumulativeMax}
              />
            )}
          </CardContent>
        </Card>

        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="text-lg">
              Nouveaux utilisateurs par mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground flex h-90.5 w-full animate-pulse items-center justify-center rounded-2xl bg-gray-50 text-sm">
                Chargement des statistiques...
              </p>
            ) : selectedRoles.length === 0 ? (
              <p className="text-muted-foreground flex h-90.5 w-full items-center justify-center text-sm">
                Sélectionnez au moins un rôle pour afficher le graphique.
              </p>
            ) : (
              <NewUsersChart
                months={months}
                roles={roles}
                selectedSet={selectedSet}
                maxValue={newUsersMax}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MonthYearSelect({
  label,
  monthValue,
  yearValue,
  years,
  onMonthChange,
  onYearChange,
  minYear,
  maxYear,
}: {
  label: string;
  monthValue: number;
  yearValue: string;
  years: string[];
  onMonthChange: (monthIndex: number) => void;
  onYearChange: (year: string) => void;
  minYear?: number;
  maxYear?: number;
}) {
  const filteredYears = years.filter((year) => {
    const numericYear = Number(year);

    if (typeof minYear === "number" && numericYear < minYear) {
      return false;
    }

    if (typeof maxYear === "number" && numericYear > maxYear) {
      return false;
    }

    return true;
  });

  return (
    <label className="space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <Select
          value={String(monthValue)}
          onValueChange={(value) => onMonthChange(Number(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            {MONTH_LABELS.map((monthLabel, index) => (
              <SelectItem key={monthLabel} value={String(index)}>
                {monthLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={yearValue} onValueChange={onYearChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            {filteredYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </label>
  );
}

function CumulativeChart({
  months,
  roles,
  selectedSet,
  maxValue,
}: {
  months: UserStatsMonth[];
  roles: StatsRole[];
  selectedSet: Set<StatsRole>;
  maxValue: number;
}) {
  const data = months.map((m) => ({
    label: m.label,
    ...m.cumulativeByRole,
  }));

  const config = Object.fromEntries(
    roles.map((role) => [
      role,
      { label: ROLE_LABELS[role], color: ROLE_COLORS[role] },
    ]),
  );

  return (
    <ChartContainer config={config} className="min-h-80 w-full">
      <LineChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" />
        <YAxis domain={[0, Math.max(1, maxValue)]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {roles
          .filter((role) => selectedSet.has(role))
          .map((role) => (
            <Line
              key={role}
              type="monotone"
              dataKey={role}
              stroke={`var(--color-${role})`}
              strokeWidth={3}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          ))}
      </LineChart>
    </ChartContainer>
  );
}

function NewUsersChart({
  months,
  roles,
  selectedSet,
  maxValue,
}: {
  months: UserStatsMonth[];
  roles: StatsRole[];
  selectedSet: Set<StatsRole>;
  maxValue: number;
}) {
  const activeRoles = roles.filter((role) => selectedSet.has(role));
  const data = months.map((m) => ({
    label: m.label,
    ...m.newUsersByRole,
  }));

  const config = Object.fromEntries(
    roles.map((role) => [
      role,
      { label: ROLE_LABELS[role], color: ROLE_COLORS[role] },
    ]),
  );

  return (
    <ChartContainer config={config} className="min-h-80 w-full">
      <BarChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" />
        <YAxis domain={[0, Math.max(1, maxValue)]} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {activeRoles.map((role) => (
          <Bar
            key={role}
            dataKey={role}
            fill={`var(--color-${role})`}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}
