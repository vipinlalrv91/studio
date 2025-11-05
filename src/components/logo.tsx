import { cn } from "@/lib/utils";

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-6 w-6", className)}
      {...props}
    >
      <path d="M10 16.5l-3.5-3.5" />
      <path d="M14 16.5l3.5-3.5" />
      <path d="M8 19h8" />
      <path d="M12 5l-8 8" />
      <path d="M20 13l-8 8" />
      <path d="M12 5v14" />
    </svg>
  );
}
