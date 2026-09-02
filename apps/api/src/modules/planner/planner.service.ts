import { Optional, Injectable, UnauthorizedException, NotFoundException  } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@yks/database";
import { AuthService } from "../auth/auth.service";
import { CreateStudyTaskDto } from "./dto/create-study-task.dto";
import { UpdateStudyTaskDto } from "./dto/update-study-task.dto";
import { CreateRevisionTaskDto } from "./dto/create-revision-task.dto";
import { UpdateRevisionTaskDto } from "./dto/update-revision-task.dto";

@Injectable()
export class PlannerService {
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

	private combineDateAndTime(dateStr: string, timeStr?: string): Date | null {
		if (!timeStr) return null;
		// dateStr: "2026-07-27", timeStr: "14:00" -> ISO format
		return new Date(`${dateStr.split("T")[0]}T${timeStr}:00`);
	}

	async getPlanner(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const [studyTasks, revisionTasks] = await Promise.all([
			this.database.studyTask.findMany({
				where: { userId: user.id },
				include: { subject: true, topic: true, subtopic: true },
				orderBy: { date: "asc" },
			}),
			this.database.revisionTask.findMany({
				where: { userId: user.id },
				include: { subject: true, topic: true, subtopic: true, wrongQuestion: true },
				orderBy: { date: "asc" },
			}),
		]);

		return { studyTasks, revisionTasks };
	}

	async getTodayTasks(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const start = new Date();
		start.setHours(0, 0, 0, 0);
		const end = new Date();
		end.setHours(23, 59, 59, 999);

		const [studyTasks, revisionTasks] = await Promise.all([
			this.database.studyTask.findMany({
				where: {
					userId: user.id,
					date: { gte: start, lte: end },
				},
				include: { subject: true, topic: true, subtopic: true },
				orderBy: { startTime: "asc" },
			}),
			this.database.revisionTask.findMany({
				where: {
					userId: user.id,
					date: { gte: start, lte: end },
				},
				include: { subject: true, topic: true, subtopic: true, wrongQuestion: true },
				orderBy: { startTime: "asc" },
			}),
		]);

		return { studyTasks, revisionTasks };
	}

	async getWeekTasks(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const start = new Date();
		// Set to start of current week (e.g. Monday)
		const day = start.getDay();
		const diff = start.getDate() - day + (day === 0 ? -6 : 1);
		start.setDate(diff);
		start.setHours(0, 0, 0, 0);

		const end = new Date(start);
		end.setDate(start.getDate() + 6);
		end.setHours(23, 59, 59, 999);

		const [studyTasks, revisionTasks] = await Promise.all([
			this.database.studyTask.findMany({
				where: {
					userId: user.id,
					date: { gte: start, lte: end },
				},
				include: { subject: true, topic: true, subtopic: true },
				orderBy: { date: "asc" },
			}),
			this.database.revisionTask.findMany({
				where: {
					userId: user.id,
					date: { gte: start, lte: end },
				},
				include: { subject: true, topic: true, subtopic: true, wrongQuestion: true },
				orderBy: { date: "asc" },
			}),
		]);

		return { studyTasks, revisionTasks };
	}

	async getMonthTasks(accessToken: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const start = new Date();
		start.setDate(1);
		start.setHours(0, 0, 0, 0);

		const end = new Date(start);
		end.setMonth(start.getMonth() + 1);
		end.setDate(0); // last day of month
		end.setHours(23, 59, 59, 999);

		const [studyTasks, revisionTasks] = await Promise.all([
			this.database.studyTask.findMany({
				where: {
					userId: user.id,
					date: { gte: start, lte: end },
				},
				include: { subject: true, topic: true, subtopic: true },
				orderBy: { date: "asc" },
			}),
			this.database.revisionTask.findMany({
				where: {
					userId: user.id,
					date: { gte: start, lte: end },
				},
				include: { subject: true, topic: true, subtopic: true, wrongQuestion: true },
				orderBy: { date: "asc" },
			}),
		]);

		return { studyTasks, revisionTasks };
	}

	// Study Tasks
	async createStudyTask(accessToken: string, payload: CreateStudyTaskDto) {
		const { user } = await this.getCurrentUser(accessToken);
		const taskDate = new Date(payload.date);
		const startTime = this.combineDateAndTime(payload.date, payload.startTime);
		const endTime = this.combineDateAndTime(payload.date, payload.endTime);

		return this.database.studyTask.create({
			data: {
				userId: user.id,
				title: payload.title,
				description: payload.description ?? null,
				subjectId: payload.subjectId ?? null,
				topicId: payload.topicId ?? null,
				subtopicId: payload.subtopicId ?? null,
				date: taskDate,
				startTime,
				endTime,
				estimatedDuration: payload.estimatedDuration ?? null,
				priority: payload.priority ?? "medium",
				status: "planned",
				recurrence: payload.recurrence ?? "none",
				notes: payload.notes ?? null,
			},
			include: { subject: true, topic: true, subtopic: true },
		});
	}

	async updateStudyTask(accessToken: string, id: string, payload: UpdateStudyTaskDto) {
		const { user } = await this.getCurrentUser(accessToken);
		const task = await this.database.studyTask.findUnique({ where: { id } });

		if (!task) {
			throw new NotFoundException("Study task not found.");
		}
		if (task.userId !== user.id) {
			throw new UnauthorizedException("You do not own this study task.");
		}

		const taskDate = payload.date ? new Date(payload.date) : task.date;
		const dateStrForCombine = payload.date ? payload.date : taskDate.toISOString();
		const startTime = payload.startTime !== undefined 
			? this.combineDateAndTime(dateStrForCombine, payload.startTime) 
			: task.startTime;
		const endTime = payload.endTime !== undefined 
			? this.combineDateAndTime(dateStrForCombine, payload.endTime) 
			: task.endTime;

		return this.database.studyTask.update({
			where: { id },
			data: {
				title: payload.title ?? task.title,
				description: payload.description !== undefined ? payload.description : task.description,
				subjectId: payload.subjectId !== undefined ? payload.subjectId : task.subjectId,
				topicId: payload.topicId !== undefined ? payload.topicId : task.topicId,
				subtopicId: payload.subtopicId !== undefined ? payload.subtopicId : task.subtopicId,
				date: taskDate,
				startTime,
				endTime,
				estimatedDuration: payload.estimatedDuration !== undefined ? payload.estimatedDuration : task.estimatedDuration,
				priority: payload.priority ?? task.priority,
				status: payload.status ?? task.status,
				recurrence: payload.recurrence ?? task.recurrence,
				notes: payload.notes !== undefined ? payload.notes : task.notes,
			},
			include: { subject: true, topic: true, subtopic: true },
		});
	}

	async deleteStudyTask(accessToken: string, id: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const task = await this.database.studyTask.findUnique({ where: { id } });

		if (!task) {
			throw new NotFoundException("Study task not found.");
		}
		if (task.userId !== user.id) {
			throw new UnauthorizedException("You do not own this study task.");
		}

		await this.database.studyTask.delete({ where: { id } });
		return { success: true };
	}

	// Revision Tasks
	async createRevisionTask(accessToken: string, payload: CreateRevisionTaskDto) {
		const { user } = await this.getCurrentUser(accessToken);
		const taskDate = new Date(payload.date);
		const startTime = this.combineDateAndTime(payload.date, payload.startTime);
		const endTime = this.combineDateAndTime(payload.date, payload.endTime);

		return this.database.revisionTask.create({
			data: {
				userId: user.id,
				title: payload.title,
				description: payload.description ?? null,
				subjectId: payload.subjectId ?? null,
				topicId: payload.topicId ?? null,
				subtopicId: payload.subtopicId ?? null,
				wrongQuestionId: payload.wrongQuestionId ?? null,
				date: taskDate,
				startTime,
				endTime,
				estimatedDuration: payload.estimatedDuration ?? null,
				priority: payload.priority ?? "medium",
				status: "planned",
				recurrence: payload.recurrence ?? "none",
				notes: payload.notes ?? null,
			},
			include: { subject: true, topic: true, subtopic: true, wrongQuestion: true },
		});
	}

	async updateRevisionTask(accessToken: string, id: string, payload: UpdateRevisionTaskDto) {
		const { user } = await this.getCurrentUser(accessToken);
		const task = await this.database.revisionTask.findUnique({ where: { id } });

		if (!task) {
			throw new NotFoundException("Revision task not found.");
		}
		if (task.userId !== user.id) {
			throw new UnauthorizedException("You do not own this revision task.");
		}

		const taskDate = payload.date ? new Date(payload.date) : task.date;
		const dateStrForCombine = payload.date ? payload.date : taskDate.toISOString();
		const startTime = payload.startTime !== undefined 
			? this.combineDateAndTime(dateStrForCombine, payload.startTime) 
			: task.startTime;
		const endTime = payload.endTime !== undefined 
			? this.combineDateAndTime(dateStrForCombine, payload.endTime) 
			: task.endTime;

		return this.database.revisionTask.update({
			where: { id },
			data: {
				title: payload.title ?? task.title,
				description: payload.description !== undefined ? payload.description : task.description,
				subjectId: payload.subjectId !== undefined ? payload.subjectId : task.subjectId,
				topicId: payload.topicId !== undefined ? payload.topicId : task.topicId,
				subtopicId: payload.subtopicId !== undefined ? payload.subtopicId : task.subtopicId,
				wrongQuestionId: payload.wrongQuestionId !== undefined ? payload.wrongQuestionId : task.wrongQuestionId,
				date: taskDate,
				startTime,
				endTime,
				estimatedDuration: payload.estimatedDuration !== undefined ? payload.estimatedDuration : task.estimatedDuration,
				priority: payload.priority ?? task.priority,
				status: payload.status ?? task.status,
				recurrence: payload.recurrence ?? task.recurrence,
				notes: payload.notes !== undefined ? payload.notes : task.notes,
			},
			include: { subject: true, topic: true, subtopic: true, wrongQuestion: true },
		});
	}

	async deleteRevisionTask(accessToken: string, id: string) {
		const { user } = await this.getCurrentUser(accessToken);
		const task = await this.database.revisionTask.findUnique({ where: { id } });

		if (!task) {
			throw new NotFoundException("Revision task not found.");
		}
		if (task.userId !== user.id) {
			throw new UnauthorizedException("You do not own this revision task.");
		}

		await this.database.revisionTask.delete({ where: { id } });
		return { success: true };
	}
}
