"use client"

import type { ComponentProps } from "react"
import { Root, Viewport, Corner } from "@radix-ui/react-scroll-area"

import { cn } from "@/shared/utils/utils"

import ScrollBar from "./ScrollBar"

function ScrollArea({
  className,
  children,
  ...props
}: ComponentProps<typeof Root>) {
  return (
    <Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </Viewport>
      <ScrollBar />
      <Corner />
    </Root>
  )
}

export default ScrollArea;
