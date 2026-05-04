"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import type { StatsRole, UserStatsMonth } from "@/utils/getUsersStats";

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

type UsersStatsChartsProps = {
  months: UserStatsMonth[];
  roles: StatsRole[];
};

export function UsersStatsCharts({ months, roles }: UsersStatsChartsProps) {
  const [selectedRoles, setSelectedRoles] = useState<StatsRole[]>(roles);

  const selectedLabel =
    selectedRoles.length === roles.length
      ? "Tous les rôles"
      : `${selectedRoles.length} rôles sélectionnés`;

  const selectedSet = useMemo(() => new Set(selectedRoles), [selectedRoles]);

  const cumulativeMax = useMemo(() => {
    return Math.max(
      1,
      ...months.flatMap((month) =>
        roles.map((role) =>
          selectedSet.has(role) ? month.cumulativeByRole[role] : 0,
        ),
      ),
    );
  }, [months, roles, selectedSet]);

  const newUsersMax = useMemo(() => {
    return Math.max(
      1,
      ...months.flatMap((month) =>
        roles.map((role) =>
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
              {roles.map((role) => (
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

      <Card className="gap-3 border-2">
        <CardHeader>
          <CardTitle className="text-lg">
            Évolution cumulée des utilisateurs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedRoles.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Sélectionnez au moins un rôle pour afficher le graphique.
            </p>
          ) : (
            <LineChart
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
          {selectedRoles.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Sélectionnez au moins un rôle pour afficher le graphique.
            </p>
          ) : (
            <BarsChart
              months={months}
              roles={roles}
              selectedSet={selectedSet}
              maxValue={newUsersMax}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LineChart({
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
  const width = 1000;
  const height = 340;
  const left = 44;
  const right = 16;
  const top = 16;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;

  const xAt = (index: number) => {
    if (months.length === 1) {
      return left + plotWidth / 2;
    }

    return left + (index / (months.length - 1)) * plotWidth;
  };

  const yAt = (value: number) => top + (1 - value / maxValue) * plotHeight;

  return (
    <div className="space-y-4">
      <div className="h-80 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full min-w-180"
          role="img"
          aria-label="Graphique en lignes du cumul d'utilisateurs par rôle"
        >
          {Array.from({ length: 5 }, (_, index) => {
            const value = Math.round((maxValue / 4) * index);
            const y = yAt(value);

            return (
              <g key={`line-grid-${index}-${value}`}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={left - 8}
                  y={y + 4}
                  fontSize={11}
                  textAnchor="end"
                  fill="#6b7280"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {roles
            .filter((role) => selectedSet.has(role))
            .map((role) => {
              const points = months
                .map((month, index) => {
                  return `${xAt(index)},${yAt(month.cumulativeByRole[role])}`;
                })
                .join(" ");

              return (
                <polyline
                  key={role}
                  fill="none"
                  stroke={ROLE_COLORS[role]}
                  strokeWidth={3}
                  points={points}
                />
              );
            })}

          {months.map((month, index) => (
            <text
              key={month.key}
              x={xAt(index)}
              y={height - 12}
              fontSize={11}
              fill="#6b7280"
              textAnchor="middle"
            >
              {index % 2 === 0 || index === months.length - 1
                ? month.label
                : ""}
            </text>
          ))}
        </svg>
      </div>
      <RolesLegend roles={roles} selectedSet={selectedSet} />
    </div>
  );
}

function BarsChart({
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
  const width = 1000;
  const height = 340;
  const left = 44;
  const right = 16;
  const top = 16;
  const bottom = 42;
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const activeRoles = roles.filter((role) => selectedSet.has(role));
  const groupWidth = plotWidth / months.length;
  const barsPerGroup = Math.max(1, activeRoles.length);
  const barWidth = Math.max(4, (groupWidth - 10) / barsPerGroup);

  const yAt = (value: number) => top + (1 - value / maxValue) * plotHeight;

  return (
    <div className="space-y-4">
      <div className="h-80 w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-full w-full min-w-180"
          role="img"
          aria-label="Graphique en barres des nouveaux utilisateurs par rôle"
        >
          {Array.from({ length: 5 }, (_, index) => {
            const value = Math.round((maxValue / 4) * index);
            const y = yAt(value);

            return (
              <g key={`bar-grid-${index}-${value}`}>
                <line
                  x1={left}
                  y1={y}
                  x2={width - right}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={left - 8}
                  y={y + 4}
                  fontSize={11}
                  textAnchor="end"
                  fill="#6b7280"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {months.map((month, monthIndex) => {
            const xBase = left + monthIndex * groupWidth + 5;

            return (
              <g key={month.key}>
                {activeRoles.map((role, roleIndex) => {
                  const value = month.newUsersByRole[role];
                  const barHeight = (value / maxValue) * plotHeight;

                  return (
                    <rect
                      key={`${month.key}-${role}`}
                      x={xBase + roleIndex * barWidth}
                      y={top + plotHeight - barHeight}
                      width={barWidth - 2}
                      height={Math.max(0, barHeight)}
                      fill={ROLE_COLORS[role]}
                      rx={2}
                    />
                  );
                })}
              </g>
            );
          })}

          {months.map((month, index) => {
            const x = left + index * groupWidth + groupWidth / 2;
            return (
              <text
                key={month.key}
                x={x}
                y={height - 12}
                fontSize={11}
                fill="#6b7280"
                textAnchor="middle"
              >
                {index % 2 === 0 || index === months.length - 1
                  ? month.label
                  : ""}
              </text>
            );
          })}
        </svg>
      </div>
      <RolesLegend roles={roles} selectedSet={selectedSet} />
    </div>
  );
}

function RolesLegend({
  roles,
  selectedSet,
}: {
  roles: StatsRole[];
  selectedSet: Set<StatsRole>;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {roles
        .filter((role) => selectedSet.has(role))
        .map((role) => (
          <span
            key={role}
            className="border-muted-foreground/20 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
          >
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ backgroundColor: ROLE_COLORS[role] }}
            />
            {ROLE_LABELS[role]}
          </span>
        ))}
    </div>
  );
}
