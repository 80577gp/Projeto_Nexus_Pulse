"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode } from "react";


type RaizLinkProps = LinkProps & {
  children: ReactNode;
  className?: string;
  transitionType?: "fade-flow" | "page-curl" | "soft-focus";
};


export function RaizLink({
  children,
  className,
  transitionType = "fade-flow",
  ...props
}: RaizLinkProps) {
  return (
    <Link
      {...props}
      className={className}
      data-transition-type={transitionType}
      style={{
        viewTransitionName: `koru-${transitionType}`,
      }}
    >
      {children}
    </Link>
  );
}
