"use client";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useState,
} from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function CoverInput({
  errors,
  register,
  image,
  setImage,
}: {
  errors: FieldErrors<{
    title: string;
    date: Date;
    pinned: boolean;
    cover: FileList;
    type: "BAPTISE" | "OUVERT" | "AUTRE";
    password?: string | undefined;
    photos: FileList;
  }>;
  register: UseFormRegister<{
    title: string;
    date: Date;
    pinned: boolean;
    cover: FileList;
    type: "BAPTISE" | "OUVERT" | "AUTRE";
    password?: string | undefined;
    photos: FileList;
  }>;
  image: string | null | undefined;
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
    [onChange]
  );

  return (
    <div>
      <Label>Photo de couverture</Label>

      <Input
        className="mt-2 cursor-pointer h-fit flex items-center file:cursor-pointer file:border-1  file:rounded-md"
        //accept=".jpg,.jpeg,.png,.webp"
        type="file"
        name={name}
        ref={ref}
        onChange={onAvatarChange}
      />
      {errors[name]?.message && (
        <p className="mt-2 p-2 bg-red-100 text-red-600 border-red-600 border-2 rounded-md">
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
