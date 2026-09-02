import { Optional, Injectable, UnauthorizedException  } from "@nestjs/common";
import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { CreateMockExamDto } from "./dto/create-mock-exam.dto";

@Injectable()
export class MockExamsService {
	constructor(
		private readonly authService: AuthService,
		@Optional() private readonly database: PrismaClient = prisma,
	) {}

	private async getCurrentUser(accessToken: string) {
		if (!accessToken) {
			throw new UnauthorizedException("Access token cookie not found.");
		}
		return this.authService.me(accessToken);
	}

	async getMockExams(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		return this.database.mockExam.findMany({
			where: { userId: user.id },
			include: {
				results: {
					include: {
						subject: true,
					},
				},
			},
			orderBy: { takenAt: "desc" },
		});
	}

	async createMockExam(accessToken: string, payload: CreateMockExamDto) {
		const { user } = await this.getCurrentUser(accessToken);

		let overallCorrect = 0;
		let overallWrong = 0;
		let overallBlank = 0;
		let overallNet = 0;

		const subjectResultsData = payload.results.map((res) => {
			const net = Number(res.correct) - Number(res.wrong) * 0.25;
			overallCorrect += res.correct;
			overallWrong += res.wrong;
			overallBlank += res.blank;
			overallNet += net;

			return {
				subjectId: res.subjectId,
				correct: res.correct,
				wrong: res.wrong,
				blank: res.blank,
				net: new Prisma.Decimal(String(net)),
			};
		});

		return this.database.mockExam.create({
			data: {
				userId: user.id,
				examType: payload.examType,
				name: payload.name,
				takenAt: new Date(payload.takenAt),
				overallCorrect,
				overallWrong,
				overallBlank,
				overallNet: new Prisma.Decimal(String(overallNet)),
				results: {
					createMany: {
						data: subjectResultsData,
					},
				},
			},
			include: {
				results: {
					include: {
						subject: true,
					},
				},
			},
		});
	}

	async getMockStats(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);

		const mocks = await this.database.mockExam.findMany({
			where: { userId: user.id },
			include: {
				results: {
					include: {
						subject: true,
					},
				},
			},
			orderBy: { takenAt: "asc" },
		});

		// TYT vs AYT mocks
		const tytMocks = mocks.filter((m) => m.examType === "tyt");
		const aytMocks = mocks.filter((m) => m.examType === "ayt");

		const tytAverageNet = tytMocks.length > 0 
			? Number((tytMocks.reduce((sum, m) => sum + Number(m.overallNet), 0) / tytMocks.length).toFixed(2)) 
			: 0;

		const aytAverageNet = aytMocks.length > 0 
			? Number((aytMocks.reduce((sum, m) => sum + Number(m.overallNet), 0) / aytMocks.length).toFixed(2)) 
			: 0;

		// Average accuracy rate
		const totalCorrect = mocks.reduce((sum, m) => sum + m.overallCorrect, 0);
		const totalWrong = mocks.reduce((sum, m) => sum + m.overallWrong, 0);
		const averageAccuracy = (totalCorrect + totalWrong) > 0 
			? Math.round((totalCorrect / (totalCorrect + totalWrong)) * 100) 
			: 0;

		// Subject rankings (average net per subject)
		const subjectNetSumMap = new Map<string, { name: string; sumNets: number; count: number }>();
		for (const mock of mocks) {
			for (const res of mock.results) {
				const current = subjectNetSumMap.get(res.subjectId) ?? { name: res.subject.name, sumNets: 0, count: 0 };
				subjectNetSumMap.set(res.subjectId, {
					name: res.subject.name,
					sumNets: current.sumNets + Number(res.net),
					count: current.count + 1,
				});
			}
		}

		const subjectRankings = Array.from(subjectNetSumMap.entries()).map(([subjectId, val]) => ({
			subjectId,
			name: val.name,
			averageNet: Number((val.sumNets / val.count).toFixed(2)),
		})).sort((a, b) => b.averageNet - a.averageNet);

		// History format for graphs
		const history = mocks.map((m) => ({
			id: m.id,
			name: m.name,
			examType: m.examType,
			takenAt: m.takenAt,
			overallNet: Number(m.overallNet),
		}));

		return {
			tytAverageNet,
			aytAverageNet,
			averageAccuracy,
			subjectRankings,
			history,
		};
	}
}
