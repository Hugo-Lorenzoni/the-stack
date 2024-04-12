import { cache } from "react";
import minioClient from "@/lib/minio";

export const getComite = cache(async () => {
  const selectOpts = {
    expression: "SELECT * FROM s3object",
    expressionType: "SQL",
    inputSerialization: {
      JSON: { Type: "LINES" },
    },
    outputSerialization: { JSON: {} },
    requestProgress: { Enabled: true },
  };

  const response = await minioClient
    .selectObjectContent("cpv", "JSON/comite.json", selectOpts)
    .catch((err: Error) => {
      console.log(err);
    });
  const comite = JSON.parse(response.records.toString());

  return comite;
});
