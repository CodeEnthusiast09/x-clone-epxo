import type { UploadSignature } from '@/interfaces/upload.interface';

interface CloudinaryUploadResponse {
  secure_url: string;
}

// Uploads a local file URI directly to Cloudinary using a server-signed token.
// Returns the permanent secure_url on success; throws on failure.
export async function uploadToCloudinary(
  localUri: string,
  sig: UploadSignature,
): Promise<string> {
  const { cloudName, uploadParams } = sig;

  const form = new FormData();
  form.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as unknown as Blob);
  form.append('timestamp', String(uploadParams.timestamp));
  form.append('signature', uploadParams.signature);
  form.append('api_key', uploadParams.api_key);
  form.append('upload_preset', uploadParams.upload_preset);
  form.append('public_id', uploadParams.public_id);
  form.append('max_bytes', String(uploadParams.max_bytes));

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: form },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Cloudinary upload failed: ${response.status} ${body}`);
  }

  const json = (await response.json()) as CloudinaryUploadResponse;
  return json.secure_url;
}
