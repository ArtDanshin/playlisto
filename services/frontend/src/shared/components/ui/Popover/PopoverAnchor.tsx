"use client"

import type { ComponentProps } from "react"
import { Anchor } from "@radix-ui/react-popover"

function PopoverAnchor({
    ...props
}: ComponentProps<typeof Anchor>) {
    return <Anchor data-slot="popover-anchor" {...props} />
} 

export default PopoverAnchor;
