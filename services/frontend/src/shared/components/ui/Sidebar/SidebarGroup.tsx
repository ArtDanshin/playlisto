"use client"

import type { ComponentProps } from "react"

import { cn } from "@/shared/utils/utils"

function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
    return (
      <div
        data-slot="sidebar-group"
        data-sidebar="group"
        className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
        {...props}
      />
    )
  }

export default SidebarGroup;
