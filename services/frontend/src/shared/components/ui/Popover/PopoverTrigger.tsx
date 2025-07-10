"use client"

import type { ComponentProps } from "react"
import { Trigger } from "@radix-ui/react-popover"

function PopoverTrigger({
  ...props
}: ComponentProps<typeof Trigger>) {
  return <Trigger data-slot="popover-trigger" {...props} />
}

export default PopoverTrigger;
