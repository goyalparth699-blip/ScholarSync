import { cn } from "@/lib/utils";

interface BadgeProps {
  children:  React.ReactNode;
  color?:    string;
  className?: string;
}

export function Badge({ children, color, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        className,
      )}
      style={color ? {
        backgroundColor: `${color}18`,
        borderColor:     `${color}40`,
        color,
      } : {
        backgroundColor: "rgba(124,108,255,0.12)",
        borderColor:     "rgba(124,108,255,0.3)",
        color:           "#7C6CFF",
      }}
    >
      {children}
    </span>
  );
}
