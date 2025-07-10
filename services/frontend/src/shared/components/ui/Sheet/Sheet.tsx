"use client"

import type { ComponentProps } from "react"
import { Root } from "@radix-ui/react-dialog"

function Sheet({ ...props }: ComponentProps<typeof Root>) {
  return <Root data-slot="sheet" {...props} />
}

export default Sheet;
