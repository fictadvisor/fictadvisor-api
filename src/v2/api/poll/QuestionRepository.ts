import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionRepository {
  constructor (
    private prisma: PrismaService,
  ) {
  }
  private include = {
    questionRoles: true,
  };

  async findMany (data: Prisma.QuestionFindManyArgs) {
    return this.prisma.question.findMany({
      include: this.include,
      ...data,
      orderBy: {
        order: 'asc',
      },
    });
  }

  async find (data: Prisma.QuestionFindFirstArgs) {
    return this.prisma.question.findFirst({
      include: this.include,
      ...data,
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findById (id: string) {
    return this.prisma.question.findUnique({
      where: {
        id,
      },
      include: this.include,
    });
  }

  async create (data: Prisma.QuestionUncheckedCreateInput) {
    return this.prisma.question.create({
      data,
      include: this.include,
    });
  }

  async deleteById (id: string) {
    return this.prisma.question.delete({
      where: {
        id,
      },
      include: this.include,
    });
  }

  async updateById (id: string, data: Prisma.QuestionUncheckedUpdateInput) {
    return this.prisma.question.update({
      where: {
        id,
      },
      data,
      include: this.include,
    });
  }
}


