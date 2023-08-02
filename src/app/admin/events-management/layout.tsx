import AdminSearchBar from "@/components/AdminSearchBar";

export default function AdminSearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="pb-4">Events Management Page</h2>
      <h3 className="font-semibold text-xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
        Recherche :
      </h3>
      <AdminSearchBar />
      {children}
    </section>
  );
}
