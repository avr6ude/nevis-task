import { z } from "zod";

export const MONTHS = [
  "Feb 2024",
  "Mar 2024",
  "Apr 2024",
  "May 2024",
  "Jun 2024",
  "Jul 2024",
  "Aug 2024",
  "Sep 2024",
  "Oct 2024",
  "Nov 2024",
  "Dec 2024",
  "Jan 2025",
] as const;

export const clientNodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  values: z.array(z.number()).length(MONTHS.length),
  image: z.string().optional(),
  get branches() {
    return z.array(clientNodeSchema).optional();
  },
  get employees() {
    return z.array(clientNodeSchema).optional();
  },
  get channels() {
    return z.array(clientNodeSchema).optional();
  },
});

export type ClientNode = z.infer<typeof clientNodeSchema>;
