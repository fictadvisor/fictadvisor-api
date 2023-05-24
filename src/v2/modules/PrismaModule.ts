import { Global, Module } from '@nestjs/common';
import { PrismaService } from '../database/PrismaService';
import { DisciplineTypeRepository } from '../database/repositories/DisciplineTypeRepository';
import { DisciplineRepository } from '../database/repositories/DisciplineRepository';
import { DisciplineTeacherRepository } from '../database/repositories/DisciplineTeacherRepository';
import { TeacherRepository } from '../database/repositories/TeacherRepository';
import { GroupRepository } from '../database/repositories/GroupRepository';
import { DisciplineTeacherRoleRepository } from '../database/repositories/DisciplineTeacherRoleRepository';
import { SubjectRepository } from '../database/repositories/SubjectRepository';
import { RoleRepository } from '../database/repositories/RoleRepository';
import { GrantRepository } from '../database/repositories/GrantRepository';
import { StudentRepository } from '../database/repositories/StudentRepository';
import { UserRepository } from '../database/repositories/UserRepository';
import { SuperheroRepository } from '../database/repositories/SuperheroRepository';
import { QuestionRepository } from '../database/repositories/QuestionRepository';
import { ContactRepository } from '../database/repositories/ContactRepository';
import { QuestionAnswerRepository } from '../database/repositories/QuestionAnswerRepository';
import { ResourceRepository } from '../database/repositories/ResourceRepository';
import { EventRepository } from '../database/repositories/EventRepository';

@Global()
@Module({
  providers: [
    PrismaService,
    DisciplineTypeRepository,
    DisciplineRepository,
    DisciplineTeacherRepository,
    DisciplineTeacherRoleRepository,
    TeacherRepository,
    GroupRepository,
    SubjectRepository,
    RoleRepository,
    GrantRepository,
    StudentRepository,
    UserRepository,
    SuperheroRepository,
    ContactRepository,
    QuestionRepository,
    QuestionAnswerRepository,
    ResourceRepository,
    EventRepository,
  ],
  exports: [
    PrismaService,
    DisciplineTypeRepository,
    DisciplineRepository,
    DisciplineTeacherRepository,
    DisciplineTeacherRoleRepository,
    TeacherRepository,
    GroupRepository,
    SubjectRepository,
    RoleRepository,
    GrantRepository,
    StudentRepository,
    UserRepository,
    SuperheroRepository,
    ContactRepository,
    QuestionRepository,
    QuestionAnswerRepository,
    ResourceRepository,
    EventRepository,
  ],
})
export class PrismaModule {}
