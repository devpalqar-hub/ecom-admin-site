export interface LeadDTO {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "NEW"|"COMPLETED";
  additionalNotes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  status: "NEW"|"COMPLETED";
  additionalNotes: string;
}
