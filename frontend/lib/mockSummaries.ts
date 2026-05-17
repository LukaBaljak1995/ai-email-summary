import type { Summary } from "./types";

export const mockSummaries: Summary[] = [
  {
    id: "summary-2026-05-17",
    date: "2026-05-17",
    status: "unread",
    generatedAt: "2026-05-17T07:30:00.000Z",
    processedEmailCount: 18,
    items: [
      {
        emailId: "email-1",
        sender: "Nike",
        subject: "48-hour flash sale on running gear",
        category: "Promotions",
        recommendation: "high",
        deal: "Up to 45% off",
        expiresAt: "Tonight 11:59 PM",
        reason: "Time-sensitive discount on items you are likely to act on soon."
      },
      {
        emailId: "email-2",
        sender: "Notion",
        subject: "Workspace templates for summer planning",
        category: "Social",
        recommendation: "low",
        reason: "Interesting, but not urgent and no strong offer attached."
      },
      {
        emailId: "email-3",
        sender: "Air Serbia",
        subject: "Belgrade to Rome fares this week",
        category: "Promotions",
        recommendation: "medium",
        deal: "Return fares from EUR 129",
        expiresAt: "2026-05-19",
        reason: "Moderate-value travel offer with a short booking window."
      }
    ],
    fullSummary:
      "Nike has the strongest immediate offer with a short window. Air Serbia is worth a look if travel is relevant this week. The Notion message can safely wait."
  },
  {
    id: "summary-2026-05-16",
    date: "2026-05-16",
    status: "read",
    generatedAt: "2026-05-16T07:30:00.000Z",
    processedEmailCount: 22,
    items: [
      {
        emailId: "email-4",
        sender: "Amazon",
        subject: "Weekend electronics deals",
        category: "Promotions",
        recommendation: "medium",
        deal: "Selected devices 20% off",
        expiresAt: "2026-05-18",
        reason: "Worth reviewing if you were already planning a purchase."
      }
    ],
    fullSummary: "Only one moderately relevant shopping email stood out yesterday."
  }
];
