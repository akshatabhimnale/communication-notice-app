import { Organization } from "../app/auth/register/page";
import { API_URLS } from "@/config/config";

interface ApiResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    address: string;
    phone: string;
    created_at: string;
  }[];
  errors: Record<string, string[]>;
  meta: Record<string, string | number | boolean>;
}

export const fetchOrganizations = async (): Promise<Organization[]> => {
  try {
    const apiUrl = API_URLS.AUTH_SERVICE;
    const response = await fetch(`${apiUrl}/organizations/`, {
      headers: {
        "Content-Type": "application/json",
      },
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();

    return data.data.map((org) => ({
      name: org.name,
      phone: org.phone || "",
      address: org.address || "",
    }));
  } catch (error) {
    console.error("Error fetching organizations:", error);
    throw new Error("Failed to load organizations");
  }
};
