"use client"

import type { ComponentProps } from "react"
import { Sub } from "@radix-ui/react-dropdown-menu";

function DropdownMenuSub({
    ...props
  }: ComponentProps<typeof Sub>) {
    return <Sub data-slot="dropdown-menu-sub" {...props} />
  }

export default DropdownMenuSub;
