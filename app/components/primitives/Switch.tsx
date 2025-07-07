import * as Switch from "@radix-ui/react-switch";
import { forwardRef } from "react";

const SwitchPrimitive = forwardRef<
  React.ElementRef<typeof Switch.Root>,
  React.ComponentPropsWithoutRef<typeof Switch.Root>
>(({ className, ...props }, ref) => (
  <Switch.Root
    ref={ref}
    className={`relative h-[15px] w-[28px] cursor-default rounded-full bg-gray-300 shadow-gray-900 outline-none focus:shadow-[0_0_0_1px] focus:shadow-gray-300 data-[state=checked]:bg-blue-600 ${className}`}
    {...props}
  >
    <Switch.Thumb className="block h-[15px] w-[15px] rounded-full bg-white border border-gray-300 shadow-gray-900 transition-transform data-[state=checked]:translate-x-[13px]" />
  </Switch.Root>
));
const SwitchThumb = forwardRef<
  React.ElementRef<typeof Switch.Thumb>,
  React.ComponentPropsWithoutRef<typeof Switch.Thumb>
>(({ className, ...props }, ref) => (
  <Switch.Thumb
    ref={ref}
    className={`block h-[21px] w-[21px] rounded-full bg-white shadow-gray-900 transition-transform data-[state=checked]:translate-x-[17px] ${className}`}
    {...props}
  />
));

export { SwitchPrimitive as Switch, SwitchThumb };