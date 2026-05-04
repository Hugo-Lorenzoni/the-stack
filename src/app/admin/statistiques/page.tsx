import { getUsersStats } from "@/utils/getUsersStats";
import { UsersStatsCharts } from "@/app/admin/statistiques/users-stats-charts";

export default async function StatisticsPage() {
  const stats = await getUsersStats();

  return (
    <section className="space-y-5">
      <h2 className="text-xl font-semibold">Statistiques utilisateurs</h2>
      <p className="text-muted-foreground text-sm">
        Vue sur les 12 derniers mois, groupée par role.
      </p>
      <UsersStatsCharts months={stats.months} roles={stats.roles} />
    </section>
  );
}
