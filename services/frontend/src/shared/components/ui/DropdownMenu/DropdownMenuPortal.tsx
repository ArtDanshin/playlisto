"use client"

import type { ComponentProps } from "react"
import { Portal } from "@radix-ui/react-dropdown-menu"

function DropdownMenuPortal({
  ...props
}: ComponentProps<typeof Portal>) {
  return (
    <Portal data-slot="dropdown-menu-portal" {...props} />
  )
}

export default DropdownMenuPortal;
