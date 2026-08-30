import { z } from "zod";

export const clientNodeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  values: z.array(z.number()),
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

export const clientsDataSchema = z
  .object({
    months: z.array(z.string().min(1)).min(1),
    root: clientNodeSchema,
  })
  .superRefine((data, ctx) => {
    const expected = data.months.length;

    const walk = (node: ClientNode, path: (string | number)[]) => {
      if (node.values.length !== expected) {
        ctx.addIssue({
          code: "custom",
          path: [...path, "values"],
          message: `expected ${expected} values to match months, got ${node.values.length}`,
        });
      }
      for (const key of ["branches", "employees", "channels"] as const) {
        const children = node[key] ?? [];
        for (const [i, child] of children.entries()) {
          walk(child, [...path, key, i]);
        }
      }
    };

    walk(data.root, ["root"]);
  });

export type ClientsData = z.infer<typeof clientsDataSchema>;
