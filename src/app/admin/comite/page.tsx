import ComiteForm from "@/components/ComiteForm";

export type Data = {
  president: string;
  responsableVideo: string;
  responsablePhoto: string;
  delegueVideo: string;
  deleguePhoto: string;
};

async function getData() {
  const res = await fetch("http://localhost:3000/api/comite", {
    cache: "no-store",
  });
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default async function ComitePage() {
  const data: Data = await getData();

  return (
    <>
      <h2>Modification du comité</h2>
      <ComiteForm data={data} />
    </>
  );
}
