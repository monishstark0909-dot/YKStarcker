import { PrismaClient } from "@prisma/client";
import { runSeeder } from "./seed/index";

const prisma = new PrismaClient();

async function main() {
	// Seed official YKS curriculum, subjects, topics, and subtopics
	await runSeeder(prisma);
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (error: unknown) => {
		console.error("Database seed failed");
		console.error(error);
		await prisma.$disconnect();
		process.exit(1);
	});
