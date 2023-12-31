"use client";
import { ChangeEvent, Dispatch, SetStateAction, useCallback } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function CoverInput({
  errors,
  register,
  setImage,
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
  setImage: Dispatch<SetStateAction<string | null | undefined>>;
}) {
  const name = "cover";
  const { onChange, ref } = register(name);

  const onAvatarChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.[0]) {
        const base64 = await getBase64(event.target.files[0]);
        if (typeof base64 == "string") {
          setImage(base64);
        }
        console.log(event.target.files?.[0]);

        onChange(event);
      } else {
        setImage(null);
        // reset();
      }
    },
    [onChange, setImage],
  );

  return (
    <div>
      <Label>Photo de couverture</Label>

      <Input
        className="file:border-1 mt-2 flex h-fit cursor-pointer items-center file:cursor-pointer  file:rounded-md"
        accept=".jpg,.jpeg,.png,.webp"
        type="file"
        name={name}
        ref={ref}
        onChange={onAvatarChange}
      />
      {errors[name]?.message && (
        <p className="mt-2 rounded-md border-2 border-red-600 bg-red-100 p-2 text-red-600">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
}

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
