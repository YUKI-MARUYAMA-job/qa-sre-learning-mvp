import { useEffect, useState } from "react";
import {
  PublicQuizDataSchema,
  type PublicQuizData
} from "../../schemas/public-quiz-data.schema.ts";

type QuizDataState =
  | {
      status: "loading";
      data: null;
      error: null;
    }
  | {
      status: "ready";
      data: PublicQuizData;
      error: null;
    }
  | {
      status: "error";
      data: null;
      error: string;
    };

export function useQuizData(): QuizDataState {
  const [state, setState] = useState<QuizDataState>({
    status: "loading",
    data: null,
    error: null
  });

  useEffect(() => {
    let cancelled = false;

    async function loadQuizData(): Promise<void> {
      try {
        const response = await fetch("/study-it/quiz_data.json", {
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch quiz data: ${response.status}`);
        }

        const json: unknown = await response.json();
        const result = PublicQuizDataSchema.safeParse(json);

        if (!result.success) {
          const issues = result.error.issues
            .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
            .join("; ");

          throw new Error(`Invalid public quiz data: ${issues}`);
        }

        if (!cancelled) {
          setState({
            status: "ready",
            data: result.data,
            error: null
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            data: null,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    void loadQuizData();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
