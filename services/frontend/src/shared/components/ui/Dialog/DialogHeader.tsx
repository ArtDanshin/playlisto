"use client"

import type { ComponentProps } from "react"

import { cn } from "@/shared/utils/utils";

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
    return (
      <div
        data-slot="dialog-header"
        className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
        {...props}
      />
    )
  }

export default DialogHeader;