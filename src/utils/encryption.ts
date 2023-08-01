import AES from "crypto-js/aes";
import { env } from "process";
import { enc } from "crypto-js";

const encrypt = (str: string) => {
  const ciphertext = AES.encrypt(
    str,
    env.ENCRYPTION_KEY ? env.ENCRYPTION_KEY : ""
  );
  return encodeURIComponent(ciphertext.toString());
};

const decrypt = (str: string) => {
  const decodedStr = decodeURIComponent(str);
  return AES.decrypt(
    decodedStr,
    env.ENCRYPTION_KEY ? env.ENCRYPTION_KEY : ""
  ).toString(enc.Utf8);
};

export { encrypt, decrypt };
