"use client";
import React, { ChangeEvent, useCallback, useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function PhotosInput({
  errors,
  register,
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
}) {
  const name = "photos";
  const { onChange, ref } = register(name);
  // const [image, setImage] = useState<string | null>();

  // const onAvatarChange = useCallback(
  //   async (event: ChangeEvent<HTMLInputElement>) => {
  //     if (event.target.files?.[0]) {
  //       // const base64 = await getBase64(event.target.files[0]);
  //       // if (typeof base64 == "string") {
  //       //   setImage(base64);
  //       // }
  //       console.log(event.target.files?.[0]);

  //       onChange(event);
  //     }
  //   },
  //   []
  // );

  return (
    <div>
      <Label>Photos de l&apos;événement</Label>
      {/* {image && <img src={image} className="w-full rounded-xl mt-1" />} */}
      <Input
        className="mt-2 cursor-pointer h-fit flex items-center file:cursor-pointer file:border-1  file:rounded-md"
        //accept=".jpg,.jpeg,.png,.webp"
        type="file"
        multiple
        name={name}
        ref={ref}
        onChange={onChange}
      />
      {errors[name]?.message && (
        <p className="mt-2 p-2 bg-red-100 text-red-600 border-red-600 border-2 rounded-md">
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
