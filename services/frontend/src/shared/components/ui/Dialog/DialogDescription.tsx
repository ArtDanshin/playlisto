"use client"

import type { ComponentProps } from "react"
import { Description } from "@radix-ui/react-dialog"

import { cn } from "@/shared/utils/utils";

function DialogDescription({
    className,
    ...props
  }: ComponentProps<typeof Description>) {
    return (
      <Description
        data-slot="dialog-description"
        className={cn("text-muted-foreground text-sm", className)}
        {...props}
      />
    )
  }

export default DialogDescription;