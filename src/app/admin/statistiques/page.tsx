import { getUsersStats } from "@/utils/getUsersStats";
import { UsersStatsCharts } from "./users-stats-charts";

export default async function StatisticsPage() {
  const stats = await getUsersStats();

  return (
    <section>
      <h2>Statistiques utilisateurs</h2>
      <p className="text-muted-foreground pb-6 text-sm">
        Vue sur les 12 derniers mois, groupée par rôle.
      </p>
      <UsersStatsCharts initialStats={stats} />
    </section>
  );
}
