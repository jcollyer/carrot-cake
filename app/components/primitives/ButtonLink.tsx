import { button } from "@/app/components/primitives/Button";
import clsx from "clsx";
import Link, { LinkProps } from "next/link";
import { FC, ReactNode } from "react";
import { VariantProps } from "tailwind-variants";

type ButtonLinkVariants = VariantProps<typeof button>;

interface ButtonLinkProps extends ButtonLinkVariants, LinkProps {
  children: ReactNode;
  className?: string;
}

const ButtonLink: FC<ButtonLinkProps> = ({
  locale,
  children,
  href,
  as,
  replace,
  shallow,
  legacyBehavior,
  onClick,
  onTouchStart,
  onMouseEnter,
  prefetch,
  passHref = true,
  className,
  variant,
  full,
  size,
  isDisabled,
}) => {
  return (
    <Link
      href={href}
      as={as}
      replace={replace}
      shallow={shallow}
      onClick={onClick}
      legacyBehavior={legacyBehavior}
      onTouchStart={onTouchStart}
      onMouseEnter={onMouseEnter}
      prefetch={prefetch}
      passHref={passHref}
      locale={locale}
      className={clsx(
        button({ variant, full, size, isDisabled }),
        className,
      )}
      aria-disabled={isDisabled}
    >
      <>{children}</>
    </Link>
  );
};

export default ButtonLink;
