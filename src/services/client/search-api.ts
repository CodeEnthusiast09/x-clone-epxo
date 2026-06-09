import type { ApiResponse } from '@/interfaces/api-response.interface';
import type { SearchResults } from '@/interfaces/search.interface';
import { clientRequestGateway } from './client-request-gateway';

const requestGateway = clientRequestGateway();

export const searchClientRequests = {
  search: (q: string, limit = 10) =>
    requestGateway.get<ApiResponse<SearchResults>>({
      url: `api/search?q=${encodeURIComponent(q)}&limit=${limit}`,
    }),
};
