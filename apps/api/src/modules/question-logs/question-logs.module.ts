import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { QuestionLogsController } from "./question-logs.controller";
import { QuestionLogsService } from "./question-logs.service";

@Module({
	imports: [AuthModule],
	controllers: [QuestionLogsController],
	providers: [QuestionLogsService],
	exports: [QuestionLogsService],
})
export class QuestionLogsModule {}
