export const encodeString = (str: string) => {
  const encodedString = str
    .toLocaleLowerCase()
    // This method normalizes the string to Normalization Form D (NFD) Unicode normalization.
    // NFD decomposes combined characters into base characters and combining diacritical marks.
    // For example, if you have the character "é" (U+00E9), it will be decomposed into "e" (U+0065)
    // and the combining acute accent (U+0301).
    .normalize("NFD")
    //  This part of the code uses a regular expression to replace all characters within the range \u0300 to \u036f.
    // These are the code points for combining diacritical marks in Unicode. By replacing them with an empty string,
    // it effectively removes all combining diacritical marks from the string.
    .replace(/[\u0300-\u036f]/g, "")
    // This part of the code uses a regular expression to replace all characters that are not letters,
    // numbers, or hyphens with a hyphen.
    .replace(/[^a-zA-Z0-9-]/g, "-")
    // This part of the code uses a regular expression to replace all sequences of hyphens with a single hyphen.
    .replace(/[-]+/g, "-")
    // This part of the code uses a regular expression to remove any hyphens at the beginning or end of the string.
    .replace(/^-+/, "") // Remove leading hyphens
    .replace(/-+$/, ""); // Remove trailing hyphens
  return encodedString;
};
