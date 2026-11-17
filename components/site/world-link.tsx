"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { rememberReturnZone } from "@/lib/return-zone";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  /** The building to reappear outside of; omit to start at the beginning. */
  zoneId?: string;
};

/** A link back to the 3D world that lands the character outside the given building. */
export default function WorldLink({ zoneId, onClick, ...props }: Props) {
  return (
    <Link
      href="/"
      {...props}
      onClick={(event) => {
        if (zoneId) rememberReturnZone(zoneId);
        onClick?.(event);
      }}
    />
  );
}
