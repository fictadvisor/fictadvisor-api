import { QuestionType } from '@prisma/client';
export class DbQuestions {
  id: string;
  category: string;
  name: string;
  description: string;
  text: string;
  isRequired: boolean;
  criteria: string;
  type: QuestionType;
}