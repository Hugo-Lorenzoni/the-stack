import { Skeleton } from "@/components/ui/skeleton";

export default function AccountsManagementLoadingPage() {
  return (
    <section className="h-full">
      <h2 className="pb-4">Accounts Management Page</h2>
      <Skeleton className="h-full w-full" />
    </section>
  );
}
