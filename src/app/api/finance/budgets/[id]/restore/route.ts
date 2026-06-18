import { restoreBudget } from "@/db/finance-repository";
import { retryDatabaseOperation } from "@/db/retry";
import { apiErrorResponse } from "@/lib/api-response";
import { requireUserId } from "@/lib/session";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    await retryDatabaseOperation("restoreBudget", () =>
      restoreBudget(userId, id),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
