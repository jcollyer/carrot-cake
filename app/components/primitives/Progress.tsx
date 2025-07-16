import * as ProgressPrimitive from "@radix-ui/react-progress";
import clsx from "clsx";
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from "react";
import { tv, VariantProps } from "tailwind-variants";

const progress = tv({
  base: "",
  variants: {
    size: {
      medium: "h-2",
      large: "h-3",
    },
  },
  defaultVariants: {
    size: "medium",
  },
});
type ProgressProps = VariantProps<typeof progress>;

const Progress = forwardRef<
  ElementRef<typeof ProgressPrimitive.Root>,
  ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & ProgressProps
>(({ className, value, size, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={clsx(
      "relative w-full overflow-hidden rounded-full bg-gray-300",
      progress({ size }),
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-gray-700 transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
