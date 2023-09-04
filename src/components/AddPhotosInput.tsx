"use client";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function AddPhotosInput({
  errors,
  register,
}: {
  errors: FieldErrors<{
    photos: FileList;
  }>;
  register: UseFormRegister<{
    photos: FileList;
  }>;
}) {
  const name = "photos";
  const { onChange, ref } = register(name);

  return (
    <div className="mt-4">
      <Label>Ajouter des photos</Label>
      <Input
        className="mt-2 cursor-pointer h-fit flex items-center file:cursor-pointer file:border-1  file:rounded-md"
        accept=".jpg,.jpeg,.png,.webp"
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
