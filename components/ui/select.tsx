// components/ui/select.tsx
"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

type TriggerProps = React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Trigger
>;

export const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Trigger>,
    TriggerProps
>(function SelectTrigger({ className, children, ...props }, ref) {
    return (
        <SelectPrimitive.Trigger
            ref={ref}
            className={[
                "inline-flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                "disabled:cursor-not-allowed disabled:opacity-60",
                className ?? "",
            ].join(" ")}
            {...props}
        >
            {/* Contenido (SelectValue) */}
            <span className="flex min-w-0 flex-1 items-center truncate">
                {children}
            </span>

            {/* Flecha más grande y visible */}
            <span
                aria-hidden="true"
                className="ml-1 flex h-5 w-5 items-center justify-center text-sm text-neutral-500"
            >
                ▾
            </span>
        </SelectPrimitive.Trigger>
    );
});

type ContentProps = React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Content
>;

export const SelectContent = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Content>,
    ContentProps
>(function SelectContent({ className, children, ...props }, ref) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Content
                ref={ref}
                className={[
                    "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-sm shadow-md",
                    className ?? "",
                ].join(" ")}
                {...props}
            >
                <SelectPrimitive.Viewport className="p-1">
                    {children}
                </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
    );
});

type ItemProps = React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Item
>;

export const SelectItem = React.forwardRef<
    React.ElementRef<typeof SelectPrimitive.Item>,
    ItemProps
>(function SelectItem({ className, children, ...props }, ref) {
    return (
        <SelectPrimitive.Item
            ref={ref}
            className={[
                "relative flex w-full cursor-pointer select-none items-center rounded px-2 py-1.5 text-sm text-neutral-800 outline-none",
                "focus:bg-neutral-100",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                className ?? "",
            ].join(" ")}
            {...props}
        >
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
});
