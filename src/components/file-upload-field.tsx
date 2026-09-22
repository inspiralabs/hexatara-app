'use client';

import { useEffect, useId, useMemo } from 'react';
import { FileIcon, ImagePlusIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(file: File) {
  return file.type.startsWith('image/');
}

/**
 * Dropzone upload — pola visual sama ImageUploadField / identitas-foto:
 * dashed box, hint format, preview (gambar atau nama berkas) sebelum Simpan.
 */
export function FileUploadField({
  label,
  accept,
  hint,
  file,
  onFile,
  existingUrl,
  existingLabel = 'Berkas saat ini',
  onClearExisting,
  disabled = false,
  className,
}: {
  label: string;
  accept: string;
  hint: string;
  file: File | null;
  onFile: (file: File | null) => void;
  existingUrl?: string | null;
  existingLabel?: string;
  onClearExisting?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const inputId = useId();
  // Derived dari `file` — bukan sync setState di effect (react-hooks/set-state-in-effect).
  const previewUrl = useMemo(() => {
    if (!file || !isImageFile(file)) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const showExisting = Boolean(existingUrl && !file);
  const showLocalImage = Boolean(file && previewUrl);
  const showLocalFile = Boolean(file && !previewUrl);

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label ? <Label htmlFor={inputId}>{label}</Label> : null}
      <input
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />

      {showLocalImage || (showExisting && existingUrl && /\.(jpe?g|png|webp|gif)(\?|$)/i.test(existingUrl)) ? (
        <div className="relative overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element -- object URL / signed URL lokal */}
          <img
            src={showLocalImage ? previewUrl! : existingUrl!}
            alt=""
            className="mx-auto max-h-48 w-full object-contain"
          />
          <div className="absolute top-1.5 right-1.5 flex gap-1">
            {(file || onClearExisting) && (
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="size-8 rounded-full"
                disabled={disabled}
                aria-label="Hapus"
                onClick={() => {
                  if (file) onFile(null);
                  else onClearExisting?.();
                }}
              >
                <XIcon className="size-4" />
              </Button>
            )}
          </div>
          <label
            htmlFor={inputId}
            className={cn(
              'block cursor-pointer border-t border-border bg-background/80 px-3 py-2 text-center text-sm text-muted-foreground hover:bg-muted',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            {file ? `${file.name} · ${formatBytes(file.size)} — klik untuk ganti` : 'Klik untuk ganti'}
          </label>
        </div>
      ) : showLocalFile || showExisting ? (
        <div className="relative flex flex-col gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-4">
          <div className="flex items-start gap-3">
            <FileIcon className="mt-0.5 size-8 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 flex-1">
              {file ? (
                <>
                  <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </>
              ) : (
                <a
                  href={existingUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline"
                >
                  {existingLabel}
                </a>
              )}
            </div>
            {(file || onClearExisting) && (
              <Button
                type="button"
                variant="secondary"
                size="icon-sm"
                className="size-8 shrink-0 rounded-full"
                disabled={disabled}
                aria-label="Hapus"
                onClick={() => {
                  if (file) onFile(null);
                  else onClearExisting?.();
                }}
              >
                <XIcon className="size-4" />
              </Button>
            )}
          </div>
          <label
            htmlFor={inputId}
            className={cn(
              'cursor-pointer text-center text-sm text-muted-foreground hover:text-foreground',
              disabled && 'pointer-events-none opacity-60',
            )}
          >
            Klik untuk ganti berkas
          </label>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            'flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-3 text-center transition-colors hover:bg-muted',
            disabled && 'pointer-events-none opacity-60',
          )}
        >
          <ImagePlusIcon className="size-6 text-muted-foreground" aria-hidden />
          <span className="text-sm font-medium text-foreground">Pilih berkas</span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </label>
      )}
    </div>
  );
}
