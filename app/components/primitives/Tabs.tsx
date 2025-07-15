import * as RadixTabs from "@radix-ui/react-tabs";
import React, { FC, ReactNode } from "react";
import { clsx } from "clsx";

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  className?: string;
};

export const Tabs: FC<TabsProps> = ({
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
    className={clsx("flex text-sm", className)}
    {...rest}
  >
    {children}
    <div className="grow border-b-2 border-gray-200"></div>
  </RadixTabs.List>
);

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
};

export const TabsTrigger: FC<TabsTriggerProps> = ({
  value,
  children,
}) => (
  <RadixTabs.Trigger
    className="border-b-2 border-gray-200 px-4 py-2 font-normal text-gray-600 hover:text-gray-800 focus:outline-hidden data-[state=active]:rounded-t data-[state=active]:border-2 data-[state=active]:border-gray-200 data-[state=active]:border-b-gray-50 data-[state=active]:font-medium data-[state=active]:text-gray-900"
    value={value}
  >
    {children}
  </RadixTabs.Trigger>
);

type TabsContentProps = {
  value: string;
  children: ReactNode;
};

export const TabsContent: FC<TabsContentProps> = ({
  value,
  children,
}) => (
  <RadixTabs.Content className="pt-4" value={value}>
    {children}
  </RadixTabs.Content>
);
