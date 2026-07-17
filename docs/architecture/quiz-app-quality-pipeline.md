# Quiz App Quality Pipeline

## Overview

このドキュメントは、クイズアプリ編における data quality pipeline と deployment pipeline を整理する。

## Pipeline

```mermaid
flowchart TD
  A[data/raw/quiz-questions.json] --> B[Zod schema validation]
  B --> C[Taxonomy validation]
  C --> D[Quiz policy validation]
  D --> E[Fixture responsibility validation]
  E --> F[Quiz quality report]
  F --> G[Public quiz data generation]
  G --> H[public/study-it/quiz_data.json]
  H --> I[React / Vite quiz UI]
  I --> J[Client build]
  J --> K[Playwright E2E smoke test]
  K --> L[GitHub Actions Quality Gate]
  J --> M[Cloudflare Pages Deployment]
```

## Data Boundary

```text
data/raw/quiz-questions.json:
  internal source of truth

public/study-it/quiz_data.json:
  public runtime data

legal / review metadata:
  kept in raw data
  excluded from public JSON
```

## Validation Layers

```text
Schema validation:
  validates structural correctness

Taxonomy validation:
  validates track / category / difficulty classification

Policy validation:
  validates legal and public safety constraints

Fixture responsibility validation:
  confirms invalid fixtures fail at the expected validation layer
```

## Runtime Boundary

```text
GitHub Actions:
  full quality gate
  includes Playwright E2E

Cloudflare Pages:
  deployment build
  excludes Playwright E2E
  deploys dist/app
```

## Build Outputs

```text
dist/app:
  React / Vite quiz app

dist/site:
  static quality report site

reports/:
  generated and maintained quality reports
```

