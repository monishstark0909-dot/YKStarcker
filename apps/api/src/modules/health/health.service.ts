/** @format */

import { Injectable } from "@nestjs/common";
import { checkDatabaseHealth } from "@yks/database";

@Injectable()
export class HealthService {
	async getHealth() {
		const database = await checkDatabaseHealth();

		return {
			status: database.ok ? "ok" : "degraded",
			timestamp: new Date().toISOString(),
			service: "yks-api",
			database,
		};
	}
}
