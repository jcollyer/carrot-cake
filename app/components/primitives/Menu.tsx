import {
    Menu as AriaKitMenu,
    MenuButton as AriaKitMenuButton,
    MenuItem as AriaKitMenuItem,
    MenuItemCheckbox as AriaKitMenuItemCheckbox,
    MenuSeparator as AriaKitMenuSeparator,
    MenuButtonProps,
    MenuItemCheckboxProps,
    MenuItemProps,
    MenuProps,
    MenuSeparatorProps,
  } from "@ariakit/react";
  import clsx from "clsx";
  import styles from "./Menu.module.css";
  import { forwardRef, type FC } from "react";



  
  // Export everything and override the rest below with some default styles and
  // sensible defaults.
  export * from "@ariakit/react";
  
  const Menu = forwardRef<HTMLDivElement, MenuProps>(
    ({ store, className, ...props }, ref) => {
      return (
        <AriaKitMenu
          gutter={8}
          {...props}
          store={store}
          className={clsx(
            "relative z-50 flex max-h-[calc(100vh)] min-w-[180px] max-w-[calc(100vw_-_16px)] flex-col overflow-auto overscroll-contain rounded-lg border border-gray-300 bg-white p-3 text-base text-gray-900 shadow-lg outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white",
            className,
          )}
          ref={ref}
        />
      );
    },
  );
  
  Menu.displayName = "Menu";
  
  const MenuButton = forwardRef<HTMLButtonElement, MenuButtonProps>(
    ({ className, ...props }, ref) => {
      return (
        <AriaKitMenuButton
          {...props}
          ref={ref}
          className={clsx(
            "flex items-center gap-3 rounded-lg p-1 text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600",
            styles.button,
            className,
          )}
        />
      );
    },
  );
  
  MenuButton.displayName = "MenuButton";
  
  const MenuItem = forwardRef<HTMLDivElement, MenuItemProps<"div">>(
    ({ className, ...props }, ref) => {
      return (
        <AriaKitMenuItem
          {...props}
          ref={ref}
          className={clsx(
            "flex cursor-default items-center gap-2 rounded-md px-2 py-2 text-sm lg:py-1.5",
            `hover:bg-gray-100 dark:hover:bg-gray-600`,
            {
              "opacity-50": props["aria-disabled"] || props.disabled,
            },
            styles.menuItem,
            className,
          )}
        />
      );
    },
  );
  
  MenuItem.displayName = "MenuItem";
  
  const MenuSeparator: FC<MenuSeparatorProps> = ({ className, ...props }) => {
    return (
      <AriaKitMenuSeparator
        {...props}
        className={clsx(
          "my-2 h-0 w-full border-t border-gray-300 dark:border-gray-700",
          className,
        )}
      />
    );
  };
  
  const MenuItemCheckbox = forwardRef<
    HTMLDivElement,
    MenuItemCheckboxProps<"div">
  >(({ className, ...props }, ref) => {
    return (
      <AriaKitMenuItemCheckbox
        {...props}
        ref={ref}
        className={clsx(
          "flex items-center gap-2 rounded-md px-2 py-2 text-sm lg:py-1.5",
          `hover:bg-gray-100 dark:hover:bg-gray-600`,
          {
            "opacity-50": props["aria-disabled"] || props.disabled,
          },
          styles.menuItem,
          className,
        )}
      />
    );
  });
  
  MenuItemCheckbox.displayName = "MenuItemCheckbox";
  
  export { Menu, MenuButton, MenuItem, MenuItemCheckbox, MenuSeparator };
  