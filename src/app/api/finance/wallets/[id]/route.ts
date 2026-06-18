import { deleteWallet, updateWallet } from "@/db/finance-repository";
import { retryDatabaseOperation } from "@/db/retry";
import { apiErrorResponse } from "@/lib/api-response";
import { walletInputSchema } from "@/lib/finance-validation";
import { requireUserId } from "@/lib/session";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    const input = walletInputSchema.parse(await request.json());
    return Response.json(
      await retryDatabaseOperation("updateWallet", () =>
        updateWallet(userId, id, input),
      ),
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  try {
    const userId = await requireUserId();
    const { id } = await context.params;
    await retryDatabaseOperation("deleteWallet", () =>
      deleteWallet(userId, id),
    );
    return new Response(null, { status: 204 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
