/** @format */

import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { assertDatabaseConnection } from "@yks/database";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
	app.enableCors({
		origin: (_origin, callback) => {
			callback(null, true);
		},
		credentials: true,
	});
	app.setGlobalPrefix("api");

	try {
		await assertDatabaseConnection();
		await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
	} catch (error) {
		const message = error instanceof Error ? error.message : "Unknown error";
		console.error("API startup failed during database validation");
		console.error(message);
		await app.close();
		process.exit(1);
	}
}

void bootstrap();
