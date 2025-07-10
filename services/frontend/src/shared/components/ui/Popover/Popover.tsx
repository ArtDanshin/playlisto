"use client"

import type { ComponentProps } from "react"
import { Root } from "@radix-ui/react-popover"

function Popover({
  ...props
}: ComponentProps<typeof Root>) {
  return <Root data-slot="popover" {...props} />
}

export default Popover;
