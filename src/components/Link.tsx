"use client";

import NextjsLink, { LinkProps } from "next/link";
import { HTMLProps, useState } from "react";

type Props = LinkProps & HTMLProps<HTMLAnchorElement>;

export default function Link({ href, children, ...props }: Props) {
  const [active, setActive] = useState(false);

  return (
    <NextjsLink
      href={href}
      prefetch={active ? null : false}
      onMouseEnter={() => {
        console.log("prefetching", href);
        setActive(true);
      }}
      {...props}
    >
      {children}
    </NextjsLink>
  );
}
