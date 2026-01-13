import clsx from "clsx";
import { type ComponentProps, forwardRef, type ReactNode } from "react";
import { type VariantProps, tv } from "tailwind-variants";

export const button = tv({
  base: "inline-flex items-center justify-center font-medium leading-none transform transition duration-100 focus-visible:ring-2 ring-offset-2 outline-none ring-offset-black ring-gray-400",
  variants: {
    variant: {
      primary:
        "text-white border-2 border-orange-500 hover:border-orange-600 bg-orange-600 hover:bg-orange-700 py-2.5 rounded-lg",
      secondary:
        "text-gray-600 hover:text-gray-700 border-2 border-gray-400 hover:border-gray-500 focus:ring-4 focus:outline-none focus:ring-gray-300 rounded-lg text-sm px-5 py-2.5 text-center",
      danger:
        "text-white bg-red-500 hover:bg-red-600 active:bg-red-700 border-none !ring-red-400",
      none: "border-none text-left justify-start",
      outline:
        "border-gray-300 border-2 bg-transparent shadow-xs hover:border-gray-400",
      thin:
        "border-gray-300 bg-transparent shadow-xs hover:border-gray-400 border",
      white:
        "bg-white hover:bg-gray-100 border-2 border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 rounded-lg px-4 py-2.5",
      cta:
        "bg-gradient-to-r from-red-500 to-orange-500 text-white font-bold py-2 rounded text-center hover:border-2 border-white",
    },
    size: {
      xlarge: "h-[64px] px-6 text-xl",
      large: "h-[44px] px-[18px] text-md",
      medium: "h-[40px] px-4 py-[10px] text-md",
      small: "h-[30px] py-2 px-[14px] text-sm",
      xsmall: "h-[24px] px-3 text-sm",
      none: " ",
      icon: "h-9 w-9",
    },
    isDisabled: {
      true: "opacity-50 pointer-events-none",
      false: "",
    },
    full: {
      true: "w-full",
    },
    rounded: {
      true: "rounded-md",
      false: "rounded",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "medium",
    rounded: true,
  },
});

export type ButtonVariants = VariantProps<typeof button>;

export interface ButtonProps extends ButtonVariants, ComponentProps<"button"> {
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant,
      full,
      size,
      disabled,
      isDisabled,
      className,
      rounded,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        {...rest}
        className={clsx(
          button({
            variant,
            full,
            size,
            isDisabled: disabled || isDisabled,
            rounded,
          }),
          className,
        )}
        ref={ref}
        disabled={disabled || isDisabled}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
