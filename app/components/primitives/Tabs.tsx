import * as RadixTabs from "@radix-ui/react-tabs";
import React, { ReactNode } from "react";
import { clsx } from "clsx";

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
};

export const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  children,
  className,
}) => (
  <RadixTabs.Root
    className={clsx("w-full", className)}
    defaultValue={defaultValue}
  >
    {children}
  </RadixTabs.Root>
);

export const TabsList = ({
  children,
  className,
  ...rest
}: RadixTabs.TabsListProps) => (
  <RadixTabs.List
    className={clsx("flex text-sm dark:border-gray-700", className)}
    {...rest}
  >
    {children}
    <div className="grow border-b border-gray-200 dark:border-gray-700"></div>
  </RadixTabs.List>
);

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
};

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  children,
}) => (
  <RadixTabs.Trigger
    className="border-b border-gray-200 px-4 py-2 font-normal text-gray-600 hover:text-gray-800 focus:outline-hidden data-[state=active]:rounded-t data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:border-b-white data-[state=active]:font-medium data-[state=active]:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:text-gray-100 dark:data-[state=active]:border-gray-700 dark:data-[state=active]:border-b-gray-900 dark:data-[state=active]:text-gray-100"
    value={value}
  >
    {children}
  </RadixTabs.Trigger>
);

type TabsContentProps = {
  value: string;
  children: ReactNode;
};

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  children,
}) => (
  <RadixTabs.Content className="pt-6" value={value}>
    {children}
  </RadixTabs.Content>
);
