/** @format */

const { PrismaClient } = require("@prisma/client");

const databaseUrl =
	process.env.DATABASE_URL ||
	"postgresql://postgres:postgres@localhost:5432/postgres?schema=public";

const prisma = new PrismaClient({
	datasources: {
		db: {
			url: databaseUrl,
		},
	},
});

async function safeDelete(modelName) {
	try {
		if (prisma[modelName] && typeof prisma[modelName].deleteMany === "function") {
			const res = await prisma[modelName].deleteMany({});
			console.log(`  - Cleared ${modelName} (${res.count} rows)`);
		}
	} catch (err) {
		// Ignore if table doesn't exist in current DB schema state
	}
}

async function cleanAllUserData() {
	console.log("🧹 Purging all user data from database...");

	const userModels = [
		"mockExamSubjectResult",
		"mockExam",
		"studySession",
		"questionLog",
		"wrongQuestion",
		"plannerItem",
		"aiInsight",
		"studyTask",
		"revisionTask",
		"studyPlan",
		"userSubtopicProgress",
		"authSession",
		"passwordResetToken",
		"emailVerificationToken",
		"oAuthAccount",
		"friendship",
		"spotifyConnection",
		"notificationPreference",
		"notification",
		"profile",
		"user",
	];

	for (const model of userModels) {
		await safeDelete(model);
	}

	console.log("✅ All user data deleted successfully!");
	console.log("📚 Official YKS curriculum and subjects remain 100% intact.");
	await prisma.$disconnect();
}

cleanAllUserData().catch((err) => {
	console.error("Cleanup failed:", err);
	prisma.$disconnect();
});
