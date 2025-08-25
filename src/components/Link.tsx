"use client";

import NextjsLink from "next/link";
import { useRouter } from "next/navigation";
import { type ComponentPropsWithRef } from "react";

export default function Link(props: ComponentPropsWithRef<typeof NextjsLink>) {
  const router = useRouter();
  const strHref = typeof props.href === "string" ? props.href : props.href.href;

  const conditionalPrefetch = () => {
    if (strHref) {
      router.prefetch(strHref);
    }
  };

  return (
    <NextjsLink
      {...props}
      prefetch={false}
      onMouseEnter={(e) => {
        conditionalPrefetch();
        return props.onMouseEnter?.(e);
      }}
      onPointerEnter={(e) => {
        conditionalPrefetch();
        return props.onPointerEnter?.(e);
      }}
      onTouchStart={(e) => {
        conditionalPrefetch();
        return props.onTouchStart?.(e);
      }}
      onFocus={(e) => {
        conditionalPrefetch();
        return props.onFocus?.(e);
      }}
    />
  );
}
