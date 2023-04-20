import { forwardRef, Module } from '@nestjs/common';
import { TeacherController } from './TeacherController';
import { TeacherService } from './TeacherService';
import { DisciplineTeacherService } from './DisciplineTeacherService';
import { PollModule } from '../poll/PollModule';
import { DisciplineTeacherController } from './DisciplineTeacherController';
import { TelegramAPI } from '../../telegram/TelegramAPI';
import { AccessModule } from '../../security/AccessModule';
import { DateModule } from '../../utils/date/DateModule';
import { ConfigurationModule } from '../../config/ConfigModule';
import { SubjectByIdPipe } from '../subject/SubjectByIdPipe';
import { TeacherMapper } from './TeacherMapper';

@Module({
  controllers: [TeacherController, DisciplineTeacherController],
  providers: [TeacherService, DisciplineTeacherService, TelegramAPI, SubjectByIdPipe, TeacherMapper],
  exports: [TeacherService, DisciplineTeacherService, TeacherMapper],
  imports: [forwardRef(() => PollModule), AccessModule, DateModule, ConfigurationModule],
})
export class TeacherModule {}
