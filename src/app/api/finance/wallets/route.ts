import { createWallet } from "@/db/finance-repository";
import { retryDatabaseOperation } from "@/db/retry";
import { apiErrorResponse } from "@/lib/api-response";
import { walletInputSchema } from "@/lib/finance-validation";
import { requireUserId } from "@/lib/session";

export async function POST(request: Request): Promise<Response> {
  try {
    const userId = await requireUserId();
    const input = walletInputSchema.parse(await request.json());
    return Response.json(
      await retryDatabaseOperation("createWallet", () =>
        createWallet(userId, input),
      ),
      { status: 201 },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
