import AES from "crypto-js/aes";
import { env } from "process";
import { enc } from "crypto-js";

const encrypt = (str: string) => {
  const ciphertext = AES.encrypt(
    str,
    env.NEXTAUT_SECRET ? env.NEXTAUT_SECRET : ""
  );
  return encodeURIComponent(ciphertext.toString());
};

const decrypt = (str: string) => {
  const decodedStr = decodeURIComponent(str);
  return AES.decrypt(
    decodedStr,
    env.NEXTAUT_SECRET ? env.NEXTAUT_SECRET : ""
  ).toString(enc.Utf8);
};

export { encrypt, decrypt };
