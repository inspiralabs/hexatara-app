"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  toggleLabelShow?: string;
  toggleLabelHide?: string;
};

export function PasswordInput({
  className,
  toggleLabelShow = "Tampilkan kata sandi",
  toggleLabelHide = "Sembunyikan kata sandi",
  ...props
}: PasswordInputProps) {
  const [tampil, setTampil] = useState(false);

  return (
    <div className="relative">
      <Input
        type={tampil ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <button
        type="button"
        className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center text-muted-foreground hover:text-foreground"
        onClick={() => setTampil((v) => !v)}
        aria-label={tampil ? toggleLabelHide : toggleLabelShow}
        tabIndex={-1}
      >
        {tampil ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
      </button>
    </div>
  );
}
