import noticeApiClient from '@/services/apiClients/noticeApiClient'

export interface PaginatedTemplateResponse {
    // count,previous,next,results
    count: number;
    next: string | null;
    previous: string | null;
    results: template[];
  }
  
  export interface template {
    id: string;
    channel: string;
    template_content: string;
    created_at: string;
    updated_at: string;
    notice_type: string;
  }
    
  
// fetch paginated templates from api
export const fetchTemplates = async (url?: string): Promise<PaginatedTemplateResponse> => {
    try {
      const endpoint = url || '/templates/';
      const response = await noticeApiClient.get<PaginatedTemplateResponse>(endpoint);
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  };
