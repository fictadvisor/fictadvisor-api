import { PrismaClient, QuestionType, State } from '@prisma/client';
import * as process from 'process';

const prisma = new PrismaClient();
async function main () {
  console.log('Start seeding');
  await prisma.subject.create({
    data: {
      id: '87e204ea-4243-4633-b69d-014613bac59e',
      name: 'subject',
    },
  });

  await prisma.startDate.createMany({
    data: [
      { year: 2022, semester: 1, startDate: new Date('2023-09-10T00:00:00')},
      { year: 2023, semester: 2, startDate: new Date('2023-02-10T00:00:00')},
    ],
  });

  //poll borders
  await prisma.dateVar.createMany({
    data: [
      { name: 'START_POLL_2023_2', date: new Date('2023-05-10T00:00:00') },
      { name: 'END_POLL_2023_2', date: new Date('2023-05-30T00:00:00') },
    ],
  });

  await prisma.teacher.create({
    data: {
      id: '3b3812ca-0ae7-11ee-be56-0242ac120002a',
      firstName: 'Blyadota',
      lastName: 'Bladotavna',
    },
  });

  await prisma.group.create({
    data: {
      id: '30809400-0ae8-11ee-be56-0242ac120002',
      code: 'GG-22',
    },
  });

  await prisma.discipline.create({
    data: {
      id: '5aa663a0-0ae7-11ee-be56-0242ac120002',
      subjectId: '87e204ea-4243-4633-b69d-014613bac59e',
      groupId: '30809400-0ae8-11ee-be56-0242ac120002',
      semester: 1,
      year: 1,
    },
  });

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

  await prisma.question.createMany({
    data: [
      {
        id: '77c5add4-0aeb-11ee-be56-0242ac120002',
        category: 'Intim',
        name: 'S`ela li jopa slona?',
        order: 0,
        text: 'Lorem ipsum...',
        isRequired: true,
        criteria: 'nevedomo',
        type: QuestionType.TOGGLE,
      },
      {
        id: '7ae61256-0aeb-11ee-be56-0242ac120002',
        category: 'Intim',
        name: 'S`el li slon jopu?',
        order: 1,
        text: 'Lorem ipsum...',
        isRequired: true,
        criteria: 'nevedomo',
        type: QuestionType.TOGGLE,
      },
      {
        id: '7d26fbe8-0aeb-11ee-be56-0242ac120002',
        category: 'Posednevno',
        name: 'Kogda reliz FA 4.0?',
        order: 2,
        text: 'Lorem ipsum...',
        isRequired: false,
        criteria: 'vedomo',
        type: QuestionType.TEXT,
      },
      {
        id: '7f9b0c8e-0aeb-11ee-be56-0242ac120002',
        category: 'Posednevno',
        name: 'Kogda palichuk perestanet poflit`?',
        order: 3,
        text: 'Lorem ipsum...',
        isRequired: false,
        criteria: 'uznali',
        type: QuestionType.TEXT,
      },
      {
        id: '844a1d7e-0aeb-11ee-be56-0242ac120002',
        category: 'Posednevno',
        name: 'Tak chervoniu chu biryozoviy?',
        order: 4,
        text: 'Lorem ipsum...',
        isRequired: true,
        criteria: 'sosaaaali',
        type: QuestionType.SCALE,
      },
    ],
  });

  await prisma.questionRole.createMany({
    data: [
      { role: 'LECTURER', questionId: '77c5add4-0aeb-11ee-be56-0242ac120002', isShown: true, isRequired: true },
      { role: 'LECTURER', questionId: '7ae61256-0aeb-11ee-be56-0242ac120002', isShown: true, isRequired: true },
      { role: 'LECTURER', questionId: '7d26fbe8-0aeb-11ee-be56-0242ac120002', isShown: true, isRequired: false },
      { role: 'PRACTICIAN', questionId: '7f9b0c8e-0aeb-11ee-be56-0242ac120002', isShown: false, isRequired: false },
      { role: 'LECTURER', questionId: '844a1d7e-0aeb-11ee-be56-0242ac120002', isShown: true, isRequired: true },
    ],
  });

  await prisma.user.createMany({
    data: [
      {
        id: '8b17aad1-aa37-4d7d-986a-caf178c5fd6b',
        email: 'polnoegovno@gmail.com',
      },
      {
        id: '64635595-6733-4a8c-b6c3-c5ee93dd197a',
        email: 'ipsa@gmail.com',
        state: State.APPROVED,
      },
    ],
  });



  console.log('Finished seeding');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
