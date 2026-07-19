import * as z from "zod";

export const CategoryKeySchema = z.enum([
  "project_overview",
  "data_quality_pipeline",
  "schema_taxonomy_validation",
  "policy_validation",
  "quality_gate_ci",
  "frontend_quiz_ui",
  "deployment_cloudflare_pages",
  "documentation_workflow",
  "git_workflow"
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

export const SubjectTaxonomyCategoriesSchema = z.array(
  SubjectTaxonomyCategorySchema
);

export type CategoryKey = z.infer<typeof CategoryKeySchema>;
export type SubjectTaxonomySubCategory = z.infer<
  typeof SubjectTaxonomySubCategorySchema
>;
export type SubjectTaxonomyCategory = z.infer<
  typeof SubjectTaxonomyCategorySchema
>;
export type SubjectTaxonomy = z.infer<typeof SubjectTaxonomySchema>;
