import Image from "next/image";
import { cn } from "@/lib/utils";

const SRC = {
  default: "/hexatara-logo-default.png",
  mono: "/hexatara-logo-monochrome.png",
} as const;

type BrandLogoProps = {
  /** `default` = latar terang/off-white; `mono` = latar gelap; `auto` = ikut tema dark: */
  variant?: "default" | "mono" | "auto";
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
  /**
   * Default true — next/image WEBP kadang drop alpha (kotak hitam).
   * Header publik light: set false supaya resize/AVIF (audit ~148 KiB).
   */
  unoptimized?: boolean;
};

/** Logo Hexatara — pakai aset sesuai arahan; tanpa border/clip tambahan. */
export function BrandLogo({
  variant = "default",
  size = 32,
  className,
  alt = "Hexatara",
  priority,
  unoptimized = true,
}: BrandLogoProps) {
  const imgClass = cn("object-contain", className);

  if (variant === "auto") {
    return (
      <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
        <Image
          src={SRC.default}
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          unoptimized={unoptimized}
          className={cn(imgClass, "dark:hidden")}
        />
        <Image
          src={SRC.mono}
          alt=""
          width={size}
          height={size}
          priority={priority}
          unoptimized={unoptimized}
          className={cn(imgClass, "absolute inset-0 hidden dark:block")}
          aria-hidden
        />
      </span>
    );
  }

  return (
    <Image
      src={SRC[variant === "mono" ? "mono" : "default"]}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      unoptimized={unoptimized}
      className={imgClass}
    />
  );
}
