"use client"

import type { ComponentProps } from "react"

import { cn } from "@/shared/utils/utils"

function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
    return (
      <div
        data-slot="sidebar-header"
        data-sidebar="header"
        className={cn("flex flex-col gap-2 p-2", className)}
        {...props}
      />
    )
}

export default SidebarHeader;
