import { Injectable, PipeTransform } from '@nestjs/common';
import { InvalidGroupIdException } from '../../../utils/exceptions/InvalidGroupIdException';
import { GroupService } from '../GroupService';
import { RoleName } from '@prisma/client';
import { StudentRepository } from '../../user/StudentRepository';
import { AbsenceOfCaptainException } from '../../../utils/exceptions/AbsenceOfCaptainException';

@Injectable()
export class GroupByCaptainPipe implements PipeTransform<string, Promise<string>> {
  constructor (
		private groupRepository: GroupService,
		private studentRepository: StudentRepository
  ) {}

  async transform (groupId: string): Promise<string> {
    const group = await this.groupRepository.get(groupId);
    if (!group) {
      throw new InvalidGroupIdException();
    }

    const captain = await this.studentRepository.find({
      groupId,
      roles: {
        some: {
          role: {
            name: RoleName.CAPTAIN,
          },
        },
      },
    });

    if (!captain?.user) {
      throw new AbsenceOfCaptainException();
    }
    return groupId;
  }
}