import { ZodError } from "zod";

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const apiErrorResponse = (error: unknown): Response => {
  if (error instanceof Response) {
    return error;
  }

  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "Data request tidak valid.",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  if (error instanceof SyntaxError) {
    return Response.json(
      { error: "Body request harus berupa JSON yang valid." },
      { status: 400 },
    );
  }

  const databaseCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : null;

  if (databaseCode === "23505") {
    return Response.json(
      { error: "Data dengan nilai yang sama sudah tersedia." },
      { status: 409 },
    );
  }

  console.error("API request failed", {
    errorName: error instanceof Error ? error.name : typeof error,
    errorMessage: error instanceof Error ? error.message : "Unknown error",
    databaseCode,
  });

  return Response.json(
    { error: "Server gagal memproses request." },
    { status: 500 },
  );
};
