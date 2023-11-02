import AdminSearchBar from "@/app/admin/events-management/AdminSearchBar";

export default function AdminSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="pb-4">Events Management Page</h2>
      <h3 className="relative w-fit text-xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        Recherche :
      </h3>
      <AdminSearchBar />
      {children}
    </section>
  );
}
