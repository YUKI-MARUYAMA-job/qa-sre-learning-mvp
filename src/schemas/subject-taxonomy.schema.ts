import * as z from "zod";

export const CategoryKeySchema = z.enum([
  "frontend_languages",
  "edge_infra_security",
  "qa_test_automation",
  "dev_env_devops"
]);

export const SubjectTaxonomySubCategorySchema = z.object({
  name: z.string().min(1),
  sub_sub_categories: z.array(z.string().min(1)).min(1)
});

export const SubjectTaxonomyCategorySchema = z.object({
  key: CategoryKeySchema,
  label: z.string().min(1),
  sub_categories: z.array(SubjectTaxonomySubCategorySchema).min(1)
});

export const SubjectTaxonomySchema = z.object({
  version: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  categories: z.array(SubjectTaxonomyCategorySchema).min(1)
});

export type CategoryKey = z.infer<typeof CategoryKeySchema>;
export type SubjectTaxonomy = z.infer<typeof SubjectTaxonomySchema>;
