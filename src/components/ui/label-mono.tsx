import { cn } from "@/lib/utils";

interface LabelMonoProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "sm" | "md";
}

export function LabelMono({
  className,
  size = "md",
  children,
  ...props
}: LabelMonoProps) {
  const sizes = {
    sm: "text-[0.7rem]",
    md: "text-[0.75rem]",
  };

  return (
    <span
      className={cn(
        "font-mono uppercase tracking-[0.1em] opacity-60",
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
