"use client";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";

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
        className="file:border-1 mt-2 flex h-fit cursor-pointer items-center file:cursor-pointer  file:rounded-md"
        accept=".jpg,.jpeg,.png,.webp"
        type="file"
        multiple
        name={name}
        ref={ref}
        onChange={onChange}
      />
      {errors[name]?.message && (
        <p className="mt-2 rounded-md border-2 border-red-600 bg-red-100 p-2 text-red-600">
          {errors[name]?.message}
        </p>
      )}
    </div>
  );
}
