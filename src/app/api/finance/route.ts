import { getFinanceState } from "@/db/finance-repository";
import { retryDatabaseOperation } from "@/db/retry";
import { apiErrorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/session";

export async function GET(): Promise<Response> {
  try {
    const userId = await requireUserId();
    return Response.json(
      await retryDatabaseOperation("getFinanceState", () =>
        getFinanceState(userId),
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
