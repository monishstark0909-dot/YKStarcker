/** @format */

const { execSync, spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const EmbeddedPostgres =
	require("embedded-postgres").default || require("embedded-postgres");

const port = 5432;
const dbUrl = `postgresql://postgres:postgres@localhost:${port}/postgres?schema=public`;

function killPort(portNumber) {
	try {
		if (process.platform === "win32") {
			const output = execSync(`netstat -ano | findstr :${portNumber}`, {
				encoding: "utf-8",
			});
			const lines = output.split("\n");
			const pids = new Set();
			for (const line of lines) {
				const parts = line.trim().split(/\s+/);
				if (parts.length >= 5 && parts[1].endsWith(`:${portNumber}`)) {
					const pid = parts[parts.length - 1];
					if (pid && pid !== "0" && pid !== String(process.pid)) {
						pids.add(pid);
					}
				}
			}
			for (const pid of pids) {
				try {
					execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
					console.log(`Freed port ${portNumber} by stopping process PID ${pid}`);
				} catch (e) {}
			}
		}
	} catch (e) {
		// Port was free
	}
}

async function main() {
	// Free ports 3000 and 4000 if occupied by stale Node processes
	killPort(3000);
	killPort(4000);

	const dbDir = path.resolve(
		__dirname,
		"..",
		"packages",
		"database",
		".db_data",
	);
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}

	// Clean up stale postmaster.pid if postgres crashed or was interrupted
	const pidFile = path.resolve(dbDir, "postmaster.pid");
	if (fs.existsSync(pidFile)) {
		try {
			const pidContent = fs.readFileSync(pidFile, "utf-8").trim().split("\n")[0];
			let isRunning = false;
			try {
				process.kill(Number(pidContent), 0);
				isRunning = true;
			} catch (e) {
				isRunning = false;
			}
			if (!isRunning) {
				console.log(`Cleaning up stale postmaster.pid (PID ${pidContent})...`);
				fs.unlinkSync(pidFile);
			}
		} catch (e) {
			try {
				fs.unlinkSync(pidFile);
			} catch (_) {}
		}
	}

	const shouldResetDb =
		process.env.RESET_EMBEDDED_DB === "true" ||
		process.env.RESET_EMBEDDED_DB === "1";
	if (shouldResetDb && fs.existsSync(dbDir)) {
		fs.rmSync(dbDir, { recursive: true, force: true });
		fs.mkdirSync(dbDir, { recursive: true });
		console.log(
			"Resetting embedded PostgreSQL data directory for UTF-8 initialization...",
		);
	}

	const pg = new EmbeddedPostgres({
		port: port,
		databaseDir: dbDir,
		user: "postgres",
		password: "postgres",
		initdbFlags: ["--encoding=UTF8", "--locale-provider=libc"],
	});

	console.log("Starting Embedded PostgreSQL on port 5432...");
	try {
		if (!fs.existsSync(path.resolve(dbDir, "postgresql.conf"))) {
			console.log("Initializing database data directory...");
			await pg.initialise();
		}
		await pg.start();
		console.log("Embedded PostgreSQL started successfully!");
	} catch (err) {
		console.warn(
			"Failed to start Embedded PostgreSQL on port 5432:",
			err && err.message ? err.message : err,
		);
		console.log("Checking if port 5432 is already occupied by a database...");
	}

	// Set environment variables
	process.env.DATABASE_URL = dbUrl;
	process.env.JWT_ACCESS_SECRET = "dev-access-secret";
	process.env.JWT_REFRESH_SECRET = "dev-refresh-secret";
	process.env.OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";

	// Write to .env files
	const envContent = `DATABASE_URL="${dbUrl}"\nJWT_ACCESS_SECRET="dev-access-secret"\nJWT_REFRESH_SECRET="dev-refresh-secret"\nOPENROUTER_API_KEY="${process.env.OPENROUTER_API_KEY}"\n`;
	fs.writeFileSync(path.resolve(__dirname, "..", ".env"), envContent);
	fs.writeFileSync(
		path.resolve(__dirname, "..", "apps", "api", ".env"),
		envContent,
	);
	console.log("Generated .env files.");

	// Run migrations
	console.log("Running database migrations...");
	try {
		execSync(
			"npx prisma migrate deploy --schema packages/database/prisma/schema.prisma",
			{ stdio: "inherit" },
		);
		console.log("Migrations deployed successfully.");
	} catch (err) {
		console.error("Migration deployment failed:", err.message);
	}

	// Run seeds
	console.log("Running database seeds...");
	try {
		execSync("npm run db:seed", { stdio: "inherit" });
		console.log("Database seeded successfully.");
	} catch (err) {
		console.error("Database seeding failed:", err.message);
	}

	// Launch NestJS and Next.js dev servers
	console.log("Launching NestJS and Next.js dev servers...");
	const devProcess = spawn(
		"npx",
		[
			"concurrently",
			"-n",
			"web,api",
			"-c",
			"blue,green",
			'"npm run dev:web"',
			'"npm run dev:api"',
		],
		{
			stdio: "inherit",
			shell: true,
			env: process.env,
		},
	);

	// Handle exit
	const cleanup = async () => {
		console.log("\nShutting down dev servers and Embedded PostgreSQL...");
		devProcess.kill();
		try {
			await pg.stop();
			console.log("PostgreSQL stopped.");
		} catch (err) {
			console.error("Failed to stop PostgreSQL:", err.message);
		}
		process.exit(0);
	};

	process.on("SIGINT", cleanup);
	process.on("SIGTERM", cleanup);
}

main().catch(console.error);
