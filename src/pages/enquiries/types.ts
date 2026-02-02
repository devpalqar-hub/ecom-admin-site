/* ---------------- TYPES ---------------- */
export interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  purpose: "PURCHASE" | "SUPPORT" | "GENERAL";
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface EnquiriesResponse {
  data: Enquiry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
