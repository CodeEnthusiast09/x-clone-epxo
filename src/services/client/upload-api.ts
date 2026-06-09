import type { ApiResponse } from '@/interfaces/api-response.interface';
import type { UploadSignature } from '@/interfaces/upload.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const uploadClientRequests = {
  getPostSignature: () =>
    requestGateway.post<ApiResponse<UploadSignature>>({ url: 'api/upload-signatures/posts' }),
};
