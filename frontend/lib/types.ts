export type Item = {
  emailId: string;
  sender: string;
  subject: string;
  category: string;
  recommendation: "high" | "medium" | "low" | "ignore";
  deal?: string;
  expiresAt?: string;
  reason: string;
};

export type Summary = {
  id: string;
  date: string;
  status: "read" | "unread";
  generatedAt: string;
  processedEmailCount: number;
  items: Item[];
  fullSummary: string;
};
