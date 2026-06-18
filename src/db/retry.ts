const transientDatabaseCodes = new Set([
  "08001",
  "08006",
  "40001",
  "40P01",
  "53300",
  "57P01",
]);

const getDatabaseCode = (error: unknown): string | null =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  typeof error.code === "string"
    ? error.code
    : null;

const wait = async (milliseconds: number): Promise<void> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, milliseconds);
  });
};

export const retryDatabaseOperation = async <Result,>(
  operationName: string,
  operation: () => Promise<Result>,
): Promise<Result> => {
  const maximumAttempts = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const databaseCode = getDatabaseCode(error);
      const shouldRetry =
        databaseCode !== null &&
        transientDatabaseCodes.has(databaseCode) &&
        attempt < maximumAttempts;

      if (!shouldRetry) {
        throw error;
      }

      console.warn("Transient database operation failed; retrying", {
        operationName,
        attempt,
        maximumAttempts,
        databaseCode,
      });
      await wait(attempt * 100);
    }
  }

  throw lastError;
};
