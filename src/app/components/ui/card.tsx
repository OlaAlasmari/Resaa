import * as React from "react";

import { cn } from "./utils";

function Card1({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 pt-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <h4
      data-slot="card-title"
      className={cn("leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 [&:last-child]:pb-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 pb-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};

const Card = ({ title, children, className = "", noPadding = false, overflowVisible = false }: { title?: React.ReactNode; children: React.ReactNode; className?: string; noPadding?: boolean; overflowVisible?: boolean }) => (
  <div className={`bg-white border ${THEME.border} rounded-lg shadow-sm ${overflowVisible ? "overflow-visible" : "overflow-hidden"} ${className}`}>
    {title && (
      <div className={`border-b ${THEME.border} px-6 py-4 flex justify-between items-center bg-slate-50`}>
        <h3 className={`font-bold ${THEME.textPrimary} text-lg`}>{title}</h3>
      </div>
    )}
    <div className={noPadding ? "" : "p-6"}>{children}</div>
  </div>
);

const THEME = {
  primary: "bg-[#91C6BC]", // Teal/Mint Green for buttons
  primaryHover: "hover:bg-[#7BB5AA]", // Darker Teal for hover
  textPrimary: "text-[#30364F]", 
  textSecondary: "text-[#475569]", // Slate 600
  bgLight: "bg-[#f1f5f9]", // Slate 100
  border: "border-[#cbd5e1]", // Slate 300
  accent: "bg-[#334155]", // Slate 700
  accentText: "text-[#f8fafc]",
  secondary: "bg-[#B7E5CD]", // Light Blue-Green
  secondaryText: "text-[#B7E5CD]",
  navbarBg: "bg-[#30364F]", // Deep Blue for navbar
  footerBg: "bg-[#30364F]" // Deep Blue for footer
};


