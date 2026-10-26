import { z } from "zod";
import { db } from "@/server/db";
import { mailingList } from "@/server/db/schema";
import { builder } from "@/server/graphql/builder";

builder.mutationFields((t) => ({
  // Public. Always true for valid emails, so it can't be used to probe who signed up.
  joinMailingList: t.boolean({
    args: { email: t.arg.string({ required: true }) },
    resolve: async (_, { email }) => {
      const parsed = z.email().safeParse(email.trim().toLowerCase());
      if (!parsed.success) throw new Error("Invalid email");
      await db
        .insert(mailingList)
        .values({ email: parsed.data })
        .onConflictDoNothing();
      return true;
    },
  }),
}));
