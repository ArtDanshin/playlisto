"use client"

import type { ComponentProps } from "react"
import { Trigger } from "@radix-ui/react-dropdown-menu"

function DropdownMenuTrigger({
    ...props
  }: ComponentProps<typeof Trigger>) {
    return (
      <Trigger
        data-slot="dropdown-menu-trigger"
        {...props}
      />
    )
  }

export default DropdownMenuTrigger;
