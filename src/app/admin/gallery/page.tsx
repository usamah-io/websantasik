import { getAuthSession, requireAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getGalleryPhotos } from '@/app/actions/galleryActions';
import { GalleryClientManager } from '@/components/admin/GalleryClientManager';

export default async function AdminGalleryPage() {
  const session = await requireAdminSession();
  const photos = await getGalleryPhotos();

  return (
    <div className="space-y-6 py-4">
      <GalleryClientManager initialPhotos={photos} />
    </div>
  );
}
