import { z } from "zod";

export const datastreamPayloadSchema = z.object({
  url: z.string().url(),
  timestamp: z.string().datetime(),
  extensionStorage: z.record(z.unknown()),
  documentHtml: z.string().min(1),
});

export type DatastreamPayloadInput = z.infer<typeof datastreamPayloadSchema>;
