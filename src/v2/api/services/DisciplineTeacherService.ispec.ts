import { DisciplineTeacherService } from './DisciplineTeacherService';
import { PrismaModule } from '../../modules/PrismaModule';
import { Test } from '@nestjs/testing';
import { CreateAnswersDTO } from '../dtos/CreateAnswersDTO';
import { DateService } from '../../utils/date/DateService';
import { PollService } from './PollService';
import { TelegramAPI } from '../../telegram/TelegramAPI';
import { MapperModule } from '../../modules/MapperModule';
import { TelegramConfigService } from '../../config/TelegramConfigService';
import { PrismaClient } from '@prisma/client';
import { ExcessiveAnswerException } from '../../utils/exceptions/ExcessiveAnswerException';
import { NotEnoughAnswersException } from '../../utils/exceptions/NotEnoughAnswersException';
import { AlreadyAnsweredException } from '../../utils/exceptions/AlreadyAnsweredException';
import { WrongTimeException } from '../../utils/exceptions/WrongTimeException';
import { NoPermissionException } from '../../utils/exceptions/NoPermissionException';

describe('DisciplineTeacherService', () => {
  let disciplineTeacherService: DisciplineTeacherService;
  let telegramApi: TelegramAPI;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DisciplineTeacherService,
        DateService,
        PollService,
        TelegramAPI,
      ],
      imports: [PrismaModule, MapperModule],
    }).useMocker((token) => {
      if (token === TelegramConfigService) {
        return {};
      }
    })
      .compile();

    disciplineTeacherService = moduleRef.get(DisciplineTeacherService);
    telegramApi = moduleRef.get(TelegramAPI);

    //region Seeding

    await prisma.disciplineType.create({
      data: {
        id: 'ec7866e2-a426-4e1b-b76c-1ce68fdb46a1',
        disciplineId: '5aa663a0-0ae7-11ee-be56-0242ac120002',
        name: 'LECTURE',
      },
    });

    await prisma.disciplineTeacher.create({
      data: {
        id: 'f79d1af4-0ae8-11ee-be56-0242ac120002',
        teacherId: '3b3812ca-0ae7-11ee-be56-0242ac120002a',
        disciplineId: '5aa663a0-0ae7-11ee-be56-0242ac120002',
      },
    });

    await prisma.disciplineTeacherRole.create({
      data: {
        disciplineTeacherId: 'f79d1af4-0ae8-11ee-be56-0242ac120002',
        disciplineTypeId: 'ec7866e2-a426-4e1b-b76c-1ce68fdb46a1',
        role: 'LECTURER',
      },
    });
    //endregion
  });


  describe('sendAnswers', () => {
    beforeAll(async () => {
      jest.spyOn(telegramApi, 'verifyResponse').mockImplementation();
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2023-05-11T00:00:00'));
    });

    it('should return nothing', async () => {
      const answers: CreateAnswersDTO = {
        answers: [
          { questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', value: '1' },
          { questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', value: '0' },
        ],
      };

      const result = await disciplineTeacherService.sendAnswers(
        'f79d1af4-0ae8-11ee-be56-0242ac120002',
        answers, 
        '64635595-6733-4a8c-b6c3-c5ee93dd197a',
      );

      expect(result).toBeUndefined();
    });

    it('should throw ExcessiveAnswerException when method gets excessive answered questions', async () => {
      const answers: CreateAnswersDTO = {
        answers: [
          { questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', value: '1' },
          { questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '7f9b0c8e-0aeb-11ee-be56-0242ac120002', value: 'nikogda blyaaa' },
          { questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', value: '1' },
        ],
      };

      await disciplineTeacherService.sendAnswers(
        'f79d1af4-0ae8-11ee-be56-0242ac120002',
        answers,
        'b95546bb-daaa-47ff-8a27-1af3b57bf678',
      ).catch((ex) =>
        expect(ex)
          .toBeInstanceOf(ExcessiveAnswerException));
    });

    it('should throw NotEnoughAnswersException when one of more required questions is missing', async () => {
      const answers: CreateAnswersDTO = {
        answers: [
          { questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', value: '0' },
        ],
      };
      await disciplineTeacherService.sendAnswers(
        'f79d1af4-0ae8-11ee-be56-0242ac120002',
        answers,
        '24d96791-cbc8-4380-8662-72ba9fef5da6',
      ).catch((ex) =>
        expect(ex)
          .toBeInstanceOf(NotEnoughAnswersException));
    });

    it('should throw AlreadyAnsweredException when answered question already in database', async () => {
      const answers: CreateAnswersDTO = {
        answers: [
          { questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', value: '1' },
          { questionId: '7d26fbe8-0aeb-11ee-be56-0242ac120002', value: 'nikogda' },
          { questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', value: '0' },
        ],

      };
      await disciplineTeacherService.sendAnswers(
        'f79d1af4-0ae8-11ee-be56-0242ac120002',
        answers,
        '64635595-6733-4a8c-b6c3-c5ee93dd197a',
      ).catch((ex) =>
        expect(ex)
          .toBeInstanceOf(AlreadyAnsweredException));
    });

    it('should throw ExcessiveAnswerException when answered question duplicated', async () => {
      const answers: CreateAnswersDTO = {
        answers: [
          { questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', value: '1' },
          { questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', value: '1' },
          { questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', value: '0' },
        ],
      };
      await disciplineTeacherService.sendAnswers(
        'f79d1af4-0ae8-11ee-be56-0242ac120002',
        answers,
        'aefac287-140c-4a06-a4b3-fbd30f5ccc43',
      ).catch((ex) =>
        expect(ex)
          .toBeInstanceOf(ExcessiveAnswerException));
    });
    
    it('should throw WrongTimeException when answered question send out of poll open time', async () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2023-04-11T00:00:00'));
      const answers: CreateAnswersDTO = {
        answers: [
          { questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', value: '1' },
          { questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', value: '0' },
        ],
      };
      await disciplineTeacherService.sendAnswers(
        'f79d1af4-0ae8-11ee-be56-0242ac120002',
        answers,
        '2d0860dc-d1f0-41cb-ac04-5109833bf562',
      ).catch((ex) =>
        expect(ex)
          .toBeInstanceOf(WrongTimeException));
    });

    it('should throw NoPermissionException when user state isn`t approved', async () => {
      const answers: CreateAnswersDTO = {
        answers: [
          { questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', value: '1' },
          { questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', value: '0' },
        ],
      };

      await disciplineTeacherService.sendAnswers(
        'f79d1af4-0ae8-11ee-be56-0242ac120002',
        answers,
        '8b17aad1-aa37-4d7d-986a-caf178c5fd6b',
      ).catch((ex) =>
        expect(ex)
          .toBeInstanceOf(NoPermissionException));
    });
  });
  /*
  describe('getUserDisciplineTeachers');

  describe('getPollTimeBorders');*/

});