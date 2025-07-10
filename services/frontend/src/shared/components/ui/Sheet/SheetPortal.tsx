"use client"

import type { ComponentProps } from "react"
import { Portal } from "@radix-ui/react-dialog"

function SheetPortal({
  ...props
}: ComponentProps<typeof Portal>) {
  return <Portal data-slot="sheet-portal" {...props} />
}

export default SheetPortal;
