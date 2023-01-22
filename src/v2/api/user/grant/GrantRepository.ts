import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/PrismaService';
import { CreateGrantData } from '../dto/CreateRoleDTO';
import { UpdateGrantDTO } from './dto/UpdateGrantDTO';

@Injectable()
export class GrantRepository {
  constructor(
    private prisma: PrismaService,
  ) {}

  async create(data: CreateGrantData) {
    return this.prisma.grant.create({
      data,
    });
  }

  async find(where: CreateGrantData) {
    return this.prisma.grant.findFirst({
      where,
    });
  }

  delete(id: string) {
    return this.prisma.grant.delete({
      where: {
        id,
      },
    });
  }

  async update(id: string, data: UpdateGrantDTO) {
    return this.prisma.grant.update({
      where: {
        id,
      },
      data,
    });
  }
}