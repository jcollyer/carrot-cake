import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/primitives/Tooltip";
import clsx from "clsx";
import {
  ComponentProps,
  ComponentType,
  ReactNode,
  SVGProps,
  forwardRef,
} from "react";
import { VariantProps, tv } from "tailwind-variants";

const icon = tv({
  variants: {
    variant: {
      default:
        "text-gray-600 hover:bg-gray-300 active:bg-gray-200",
      success:
        "text-green-700 bg-green-100 hover:bg-green-200",
      warning:
        "text-yellow-700 bg-yellow-100 hover:bg-yellow-200",
      error:
        "text-red-600 hover:bg-red-100 active:bg-red-200",
      cta:
        "text-white bg-gradient-to-r from-red-500 to-orange-500 hover:bg-gradient-to-l",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type IconVariants = VariantProps<typeof icon>;

interface ButtonIconProps extends IconVariants, ComponentProps<"button"> {
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>;
  className?: string;
  variant?: IconVariants["variant"];
  label: ReactNode;
  tooltip?: boolean;
  strokeWidth?: number;
  size?: number;
}

const ButtonIcon = forwardRef<HTMLButtonElement, ButtonIconProps>(
  ({ icon: Icon, label, className, size = 16, variant, tooltip, strokeWidth = 1.5, ...props }, ref) => {
    const button = (
      <button
        type="button"
        {...props}
        className={clsx(
          `inline-flex shrink-0 items-center justify-center p-2 rounded-full border-0 disabled:pointer-events-none disabled:opacity-50`,
          className,
          icon({ variant }),
        )}
        ref={ref}
      >
        <Icon strokeWidth={strokeWidth} size={size} />
        <span className="sr-only">{label}</span>
      </button>
    );

    if (tooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{label}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  },
);

ButtonIcon.displayName = "ButtonIcon";

export default ButtonIcon;
