export interface LeadLogDTO {
  id: string;
  action: string;
  description: string;
  additionalNotes?: string | null;
  leadId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lead: {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
}
