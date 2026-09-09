"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FieldHelp({ children }: {
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        className="help-trigger"
        aria-label="What this field means"
      >
        <Info size={13} strokeWidth={2.2} aria-hidden="true" />
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}
