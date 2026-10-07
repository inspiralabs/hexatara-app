import { getTranslations } from 'next-intl/server';
import { getFreemiumLmsAccess } from '@/lib/site-settings';

/** Strip hanya saat saklar tertutup dan viewer admin. */
export async function LmsAdminPreviewStrip() {
  const { open, isAdminPreview } = await getFreemiumLmsAccess();
  if (open || !isAdminPreview) return null;
  const t = await getTranslations('lmsClosed');
  return (
    <div
      role="status"
      className="border-b border-amber-600/30 bg-amber-500/15 px-4 py-2 text-center text-sm font-medium text-amber-950 dark:text-amber-100"
    >
      {t('adminPreviewStrip')}
    </div>
  );
}
