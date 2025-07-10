"use client"

import type { ComponentProps } from "react"
import { Close } from "@radix-ui/react-dialog"

function SheetClose({
  ...props
}: ComponentProps<typeof Close>) {
  return <Close data-slot="sheet-close" {...props} />
}

export default SheetClose;
