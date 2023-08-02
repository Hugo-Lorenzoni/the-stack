export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      <h1 className="font-semibold text-2xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
        Résultats :
      </h1>
      {children}
    </main>
  );
}
