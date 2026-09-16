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
};

/** Logo Hexatara — pakai aset sesuai arahan; tanpa border/clip tambahan. */
export function BrandLogo({
  variant = "default",
  size = 32,
  className,
  alt = "Hexatara",
  priority,
}: BrandLogoProps) {
  const imgClass = cn("object-contain", className);

  // unoptimized: next/image WEBP sering drop alpha → pojok transparan jadi kotak hitam
  if (variant === "auto") {
    return (
      <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
        <Image
          src={SRC.default}
          alt={alt}
          width={size}
          height={size}
          priority={priority}
          unoptimized
          className={cn(imgClass, "dark:hidden")}
        />
        <Image
          src={SRC.mono}
          alt=""
          width={size}
          height={size}
          priority={priority}
          unoptimized
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
      unoptimized
      className={imgClass}
    />
  );
}
