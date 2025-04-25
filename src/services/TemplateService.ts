import axios from "axios";
import templateApiClient from '@/services/apiClients/templateApiClient'

export interface PaginatedTemplateResponse {
    // count,previous,next,results
    count: number;
    next: string | null;
    previous: string | null;
    results: template[];
  }
export interface template {
}
  
// fetch paginated templates from api
export const fetchTemplates = async (url?: string): Promise<PaginatedTemplateResponse> => {
    try {
      const endpoint = url || '/templates/';
      const response = await templateApiClient.get<PaginatedTemplateResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  };
