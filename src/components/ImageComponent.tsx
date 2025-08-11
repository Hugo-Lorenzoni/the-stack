"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, HTMLAttributes } from "react";

interface ImageComponentProps extends HTMLAttributes<HTMLDivElement> {
  src: string;
  width: number;
  height: number;
  alt: string;
  index?: number;
  quality?: "thumbnail" | "preview";
}

export default function ImageComponent({
  src,
  width,
  height,
  className,
  alt,
  index,
  quality,
  ...props
}: ImageComponentProps) {
  //* The "pretty loading" effect was removed because it blocked the image from appearing until the javascript was loaded on the page.
  //* This was problematic because the javascript was not loaded until all lazy loaded images were downloaded.
  //   const [isLoading, setIsLoading] = useState(true);
  return (
    <div className={cn("relative overflow-hidden", className)} {...props}>
      {/* {isLoading && (
        <div className="absolute inset-0 -z-20 animate-pulse bg-zinc-200/50 dark:bg-zinc-800/50" />
      )} */}
      {!index ? (
        <Image
          loader={({ src }) =>
            `http://localhost:3000/api/image${src}?placeholder=true`
          }
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          priority
        />
      ) : index < 10 ? (
        <Image
          loader={({ src }) =>
            `http://localhost:3000/api/image${src}?placeholder=true`
          }
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
          priority
        />
      ) : (
        <Image
          loading="lazy"
          loader={({ src }) =>
            `http://localhost:3000/api/image${src}?placeholder=true`
          }
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
      )}
      <Image
        loading="lazy"
        loader={({ src }) =>
          `http://localhost:3000/api/image${src}${
            quality ? `?quality=${quality}` : ""
          }`
        }
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="h-full w-full object-cover transition-opacity duration-500 ease-in-out"
        // className={cn(
        //   "h-full w-full object-cover transition-opacity duration-500 ease-in-out",
        //     isLoading ? "opacity-0" : "opacity-100",
        // )}
        // onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
