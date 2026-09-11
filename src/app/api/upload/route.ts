import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file gambar yang diunggah.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const imageUrl = await uploadImageToCloudinary(buffer, file.name);

    return NextResponse.json({ url: imageUrl, success: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message || 'Gagal mengunggah gambar' },
      { status: 500 }
    );
  }
}
