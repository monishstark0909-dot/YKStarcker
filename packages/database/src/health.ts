/** @format */

import { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

export interface DatabaseHealthResult {
	ok: boolean;
	message: string;
}

export async function checkDatabaseHealth(
	client: PrismaClient = prisma,
): Promise<DatabaseHealthResult> {
	try {
		await client.$queryRawUnsafe("SELECT 1");
		return {
			ok: true,
			message: "Database connection is healthy.",
		};
	} catch (error) {
		return {
			ok: false,
			message: error instanceof Error ? error.message : "Database unavailable.",
		};
	}
}

export async function assertDatabaseConnection(
	client: PrismaClient = prisma,
) {
	const result = await checkDatabaseHealth(client);
	if (!result.ok) {
		throw new Error(result.message);
	}
}
