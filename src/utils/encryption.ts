import AES from "crypto-js/aes";
import { env } from "process";
import { enc } from "crypto-js";

// const encrypt = (str: string) => {
//   const ciphertext = AES.encrypt(
//     JSON.stringify(str),
//     env.ENCRYPTION_KEY ? env.ENCRYPTION_KEY : ""
//   );
//   return encodeURIComponent(ciphertext.toString());
// };

const encrypt = (str: string) => {
  const encJson = AES.encrypt(
    JSON.stringify(str),
    env.ENCRYPTION_KEY ? env.ENCRYPTION_KEY : "secret",
  ).toString();
  const encData = enc.Base64.stringify(enc.Utf8.parse(encJson));
  return encData;
};

// const decrypt = (str: string) => {
//   const decodedStr = decodeURIComponent(str);
//   return AES.decrypt(
//     decodedStr,
//     env.ENCRYPTION_KEY ? env.ENCRYPTION_KEY : ""
//   ).toString(enc.Utf8);
// };

const decrypt = (str: string) => {
  let decData = enc.Base64.parse(str).toString(enc.Utf8);
  let bytes = AES.decrypt(
    decData,
    env.ENCRYPTION_KEY ? env.ENCRYPTION_KEY : "secret",
  ).toString(enc.Utf8);
  return JSON.parse(bytes);
};

export { encrypt, decrypt };
