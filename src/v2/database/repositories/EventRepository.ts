import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import { Prisma } from '@prisma/client';

@Injectable()
export class EventRepository {

  private include = {
    group: true,
    eventInfo: true,
    lessons: true,
  };

  constructor (private prisma: PrismaService) {}

  create (data: Prisma.EventUncheckedCreateInput) {
    return this.prisma.event.create({
      data,
      include: this.include,
    });
  }

  find (where: Prisma.EventWhereInput) {
    return this.prisma.event.findFirst({
      where,
      include: this.include,
    });
  }

  findById (id: string) {
    return this.find({
      id,
    });
  }

  findMany (args: Prisma.EventFindManyArgs) {
    return this.prisma.event.findFirst({
      ...args,
      include: this.include,
    });
  }

  update (args: Prisma.EventUpdateArgs) {
    return this.prisma.event.update({
      ...args,
      include: this.include,
    });
  }

  updateById (id: string, data: Prisma.EventUncheckedUpdateInput) {
    return this.update({
      where: {
        id,
      },
      data,
    });
  }

  updateMany (where: Prisma.EventWhereInput, data: Prisma.EventUncheckedUpdateManyInput) {
    return this.prisma.event.updateMany({
      where,
      data,
    });
  }

  delete (args: Prisma.EventDeleteArgs) {
    return this.prisma.event.delete({
      ...args,
      include: this.include,
    });
  }
  
  deleteById (id: string) {
    return this.delete({
      where: {
        id,
      },
    });
  }

  deleteMany (where: Prisma.EventWhereInput) {
    return this.prisma.event.deleteMany({
      where,
    });
  }
}