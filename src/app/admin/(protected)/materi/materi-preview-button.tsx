import { ExternalLinkIcon } from 'lucide-react';
import { getMateriHeroHref } from '@/lib/materi';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Pratinjau LMS publik lewat pintu bernama. Sembunyi jika belum ada course aktif. */
export async function MateriPreviewButton() {
  const href = await getMateriHeroHref();
  if (href == null) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: 'outline' }), 'h-11 gap-1.5 px-5')}
    >
      <ExternalLinkIcon className="size-4" />
      Pratinjau
    </a>
  );
}
