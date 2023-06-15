import { DisciplineTeacherService } from './DisciplineTeacherService';
import { PrismaModule } from '../../modules/PrismaModule';
import { Test } from '@nestjs/testing';
import { CreateAnswersDTO } from '../dtos/CreateAnswersDTO';
import { DateService } from '../../utils/date/DateService';
import { PollService } from './PollService';
import { TelegramAPI } from '../../telegram/TelegramAPI';
import { MapperModule } from '../../modules/MapperModule';

describe('DisciplineTeacherService', () => {
  let disciplineTeacherService: DisciplineTeacherService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DisciplineTeacherService,
        DateService,
        PollService,
      ],
      imports: [PrismaModule, MapperModule],
    }).useMocker((token) => {
      if (token === TelegramAPI) {
        return {};
      }
    })
      .compile();

    disciplineTeacherService = moduleRef.get(DisciplineTeacherService);

  });


  describe('sendAnswers', () => {
    it('should return nothing', async () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date('2023-05-11T00:00:00'));
      
      const answers: CreateAnswersDTO = {
        answers: [
          { questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', value: '0' },
          { questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', value: '1' },
          { questionId: '7d26fbe8-0aeb-11ee-be56-0242ac120002', value: 'nikogda' },
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

    /*it('');*/
  });
  /*
  describe('getUserDisciplineTeachers');

  describe('getPollTimeBorders');*/

});