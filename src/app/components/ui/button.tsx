import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background text-foreground hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = ({ 
  children, 
  variant = "primary", 
  className = "", 
  fullWidth = false,
  onClick,
  icon: Icon,
  disabled = false
}: { 
  children: React.ReactNode; 
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost"; 
  className?: string;
  fullWidth?: boolean;
  onClick?: () => void;
  icon?: any;
  disabled?: boolean;
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 px-5 py-2.5 font-bold transition-all duration-200 rounded-md text-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: `${THEME.primary} text-white ${THEME.primaryHover} shadow-sm`,
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-sm",
    outline: `bg-transparent text-[#30364F] border ${THEME.border} hover:border-[#30364F] hover:text-[#30364F]`,
    danger: "bg-white text-red-600 border border-red-200 hover:bg-red-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-[#30364F]",
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

function Button1({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
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

export { Button, buttonVariants };
