import { createTransaction } from "@/db/finance-repository";
import { retryDatabaseOperation } from "@/db/retry";
import { apiErrorResponse } from "@/lib/api-response";
import { transactionInputSchema } from "@/lib/finance-validation";
import { requireUserId } from "@/lib/session";

export async function POST(request: Request): Promise<Response> {
  try {
    const userId = await requireUserId();
    const input = transactionInputSchema.parse(await request.json());
    return Response.json(
      await retryDatabaseOperation("createTransaction", () =>
        createTransaction(userId, input),
      ),
      { status: 201 },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
