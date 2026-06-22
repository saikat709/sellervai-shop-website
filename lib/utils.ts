import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Inline `style` for inputs that use `focus:ring-2`. Tailwind can't express
 * a dynamic ring color from a CSS variable without `ring-{color}` utilities,
 * so we set the ring-color custom property directly.
 */
export function ringColorStyle(primary: string): React.CSSProperties {
  return { ["--tw-ring-color" as string]: `${primary}66` };
}