import Image from "next/image";
import clsx from "clsx";

type LogoMarkProps = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeMap: Record<NonNullable<LogoMarkProps["size"]>, string> = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
  xl: "h-24 w-24",
};

export function LogoMark({ size = "md", className }: LogoMarkProps) {
  return (
    <div
      className={clsx("relative select-none", sizeMap[size], className)}
      aria-label="vAcAnt logo"
    >
      <Image
        src="/logo.svg"
        alt="vAcAnt"
        fill
        priority
        className="object-contain"
        sizes="96px"
      />
    </div>
  );
}
