export interface UploadParams {
  timestamp: number;
  signature: string;
  api_key: string;
  upload_preset: string;
  max_bytes: number;
  public_id: string;
}

export interface UploadSignature {
  cloudName: string;
  uploadParams: UploadParams;
}
