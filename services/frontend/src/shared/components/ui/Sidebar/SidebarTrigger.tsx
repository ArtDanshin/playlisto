"use client"

import type { ComponentProps } from "react"
import { PanelLeftIcon } from "lucide-react"

import { cn } from "@/shared/utils/utils"
import { Button } from "@/shared/components/ui/Button"
import { useSidebar } from "./SidebarProvider"

function SidebarTrigger({
  className,
  onClick,
  ...props
}: ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

export default SidebarTrigger;
