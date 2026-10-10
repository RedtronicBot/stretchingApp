import { z } from "zod"

export const sessionRecordSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  endDate: z.number().int().positive(),
  actualDuration: z.number().int().nonnegative(),
  feeling: z.enum(["mieux", "pareil", "moins bien"]).optional(),
})

export type SessionRecord = z.infer<typeof sessionRecordSchema>
