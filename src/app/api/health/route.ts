import { sql } from "drizzle-orm";
import { db } from "@/db";
import { retryDatabaseOperation } from "@/db/retry";

export async function GET(): Promise<Response> {
  try {
    await retryDatabaseOperation("healthCheck", async () => {
      await db.execute(sql`select 1`);
    });

    return Response.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check failed", {
      errorName: error instanceof Error ? error.name : typeof error,
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    return Response.json(
      {
        status: "error",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
