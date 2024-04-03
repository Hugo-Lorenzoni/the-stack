import { encodeString } from "@/utils/encodeString";

export const encodePath = (type: string, date: string, title: string) => {
  const encodedPath = `/${type}/${date}_${encodeString(title)}`;
  return encodedPath;
};
