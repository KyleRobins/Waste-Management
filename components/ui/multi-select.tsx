"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

export function MultiSelect({
  value = [],
  onValueChange,
  placeholder,
  className,
  children,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string[]>(value);

  const handleSelect = (currentValue: string) => {
    const newSelected = selected.includes(currentValue)
      ? selected.filter((item) => item !== currentValue)
      : [...selected, currentValue];

    setSelected(newSelected);
    onValueChange?.(newSelected);
  };

  const handleRemove = (currentValue: string) => {
    const newSelected = selected.filter((item) => item !== currentValue);
    setSelected(newSelected);
    onValueChange?.(newSelected);
  };

  return (
    <Command className={cn("overflow-visible bg-transparent", className)}>
      <div
        className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        onClick={() => setOpen(true)}
      >
        <div className="flex gap-1 flex-wrap">
          {selected.map((item) => (
            <Badge
              key={item}
              variant="secondary"
              className="hover:bg-secondary"
            >
              {item}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRemove(item);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleRemove(item)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            placeholder={placeholder}
            className="bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            onFocus={() => setOpen(true)}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto max-h-[200px]">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === CommandItem) {
                  return React.cloneElement(child, {
                    ...child.props,
                    onSelect: () => {
                      handleSelect(child.props.value);
                      setOpen(false);
                    },
                    onMouseDown: (e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();
                    },
                  });
                }
                return child;
              })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  );
}

export const MultiSelectItem = CommandItem;
