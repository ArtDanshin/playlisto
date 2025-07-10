"use client"

import type { ComponentProps } from "react"
import { Trigger } from "@radix-ui/react-dialog"

function DialogTrigger({
    ...props
}: ComponentProps<typeof Trigger>) {
    return <Trigger data-slot="dialog-trigger" {...props} />
}

export default DialogTrigger;