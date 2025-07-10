"use client"

import type { ComponentProps } from "react"

import { cn } from "@/shared/utils/utils"

function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
    return (
      <li
        data-slot="sidebar-menu-item"
        data-sidebar="menu-item"
        className={cn("group/menu-item relative", className)}
        {...props}
      />
    )
  }

export default SidebarMenuItem;
