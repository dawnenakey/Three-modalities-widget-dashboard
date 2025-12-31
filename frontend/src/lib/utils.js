import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

/**
 * @typedef {import('clsx').ClassValue} ClassValue
 */

/**
 * Combines class names using clsx and tailwind-merge
 * @param {...ClassValue} inputs - Class values to combine
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
