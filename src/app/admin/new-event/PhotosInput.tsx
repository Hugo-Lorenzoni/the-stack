"use client";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function PhotosInput({
  errors,
  register,
}: {
  errors: FieldErrors<{
    title: string;
    date: Date;
    notes?: string | undefined;
    pinned: boolean;
    cover: FileList;
    type: "BAPTISE" | "OUVERT" | "AUTRE";
    password?: string | undefined;
    photos: FileList;
  }>;
  register: UseFormRegister<{
    title: string;
    date: Date;
    notes?: string | undefined;
    pinned: boolean;
    cover: FileList;
    type: "BAPTISE" | "OUVERT" | "AUTRE";
    password?: string | undefined;
    photos: FileList;
  }>;
}) {
  const name = "photos";
  const { onChange, ref } = register(name);

  return (
    <div>
      <Label>Photos de l&apos;événement</Label>
      {/* {image && <img src={image} className="w-full rounded-xl mt-1" />} */}
      <Input
        className="mt-2 flex h-fit cursor-pointer items-center file:cursor-pointer file:rounded-md file:border"
        accept=".jpg,.jpeg,.png,.webp"
        type="file"
        multiple
        name={name}
        ref={ref}
        onInput={onChange}
      />
      {errors[name]?.message && (
        <p className="mt-2 rounded-md border-2 border-red-600 bg-red-100 p-2 text-red-600">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
}

// function getBase64(file: File) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();

//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = (error) => reject(error);
//   });
// }
