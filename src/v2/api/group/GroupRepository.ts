import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/PrismaService';
import { QueryAllDTO } from "../../utils/QueryAllDTO";
import { DatabaseUtils } from "../utils/DatabaseUtils";
import { UpdateGroupDTO } from "./dto/UpdateGroupDTO";

@Injectable()
export class GroupRepository {
  constructor(
    private prisma: PrismaService,
  ) {}

  async get(id: string) {
    return this.prisma.group.findUnique({
      where: {
        id,
      },
      include: {
        disciplines: true,
        students: true,
        groupRoles: true,
      },
    });
  }

  async getAll(body: QueryAllDTO) {
    const search = DatabaseUtils.getSearch(body, 'code');
    const page = DatabaseUtils.getPage(body);
    const sort = DatabaseUtils.getSort(body);

    return this.prisma.group.findMany({
      ...page,
      ...sort,
      where: {
        ...search,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.group.delete({
      where: {
        id,
      },
    });
  }

  async getGroup(id: string) {
    const group = await this.get(id);
    delete group.disciplines;
    delete group.students;
    delete group.groupRoles;
    return group;
  }

  async getDisciplines(id: string) {
    const group = await this.get(id);
    return group.disciplines;
  }

  async getStudents(id: string) {
    const group = await this.get(id);
    return group.students;
  }

  async getRoles(groupId: string) {
    const groupRoles = await this.prisma.groupRole.findMany({
      where:{
        groupId,
      },
      include:{
        role: true,
      },
    });
    return groupRoles.map((gr) => (gr.role));
  }

  async find(code: string) {
    return this.prisma.group.findFirst({
      where: {
        code,
      },
    });
  }

  async create(code: string) {
    return this.prisma.group.create({
      data: {
        code,
      },
    });
  }

  async getOrCreate(code: string) {
    let group = await this.find(code);
    if (!group) {
      group = await this.create(code);
    }
    return group;
  }

  async updateGroup(id: string, data: UpdateGroupDTO){
    return this.prisma.group.update({
      where: {
        id,
      },
      data,
    });
  }
}