import { ForbiddenException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { DisciplineService } from '../discipline/DisciplineService';
import { GiveRoleDTO } from './dto/GiveRoleDTO';
import { StudentRepository } from './StudentRepository';
import { RoleService } from './role/RoleService';
import { UpdateSuperheroData } from './dto/UpdateSuperheroData';
import { SuperheroRepository } from './SuperheroRepository';
import { UserRepository } from './UserRepository';
import { ContactRepository } from './ContactRepository';
import { UpdateUserDTO } from './dto/UpdateUserDTO';
import { CreateContactDTO } from './dto/CreateContactDTO';
import { EntityType, Role, RoleName, State } from '@prisma/client';
import { UpdateContactDTO } from './dto/UpdateContactDTO';
import { UpdateStudentDTO } from './dto/UpdateStudentDTO';
import { CreateSuperheroDTO } from './dto/CreateSuperheroDTO';
import { StudentWithUser } from './dto/StudentDTOs';
import { AuthService } from '../auth/AuthService';
import { GroupRequestDTO } from './dto/GroupRequestDTO';
import { GroupService } from '../group/GroupService';

@Injectable()
export class UserService {
  constructor (
    @Inject(forwardRef(() => DisciplineService))
    private disciplineService: DisciplineService,
    private studentRepository: StudentRepository,
    private userRepository: UserRepository,
    @Inject(forwardRef(() => RoleService))
    private roleService: RoleService,
    private superheroRepository: SuperheroRepository,
    private contactRepository: ContactRepository,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    @Inject(forwardRef(() => GroupService))
    private groupService: GroupService,
  ) {
  }

  async createSuperhero (id: string, body: CreateSuperheroDTO) {
    return this.superheroRepository.createSuperhero(id, body);
  }

  async getSelective (studentId: string) {
    return this.studentRepository.getSelective(studentId);
  }


  async hasPermission (userId: string, permission: string) {
    const roles = await this.studentRepository.getRoles(userId);
    for (const role of roles) {
      const hasRight = this.roleService.hasPermission(role.grants, permission);
      if (hasRight) return true;
    }

    return false;
  }

  async giveRole (id: string, { roleId }: GiveRoleDTO) {
    await this.studentRepository.addRole(id, roleId);
  }
  async getGroupByRole (id: string) {
    return await this.studentRepository.getGroupByRole(id);
  }

  async getGroupRoleDB (userId: string) {
    const roles = await this.studentRepository.getRoles(userId);
    const role = roles.find((r) => r.name === 'CAPTAIN' || r.name === 'MODERATOR' || r.name === 'STUDENT');
    const group = await this.getGroupByRole(role.id);
    return {
      ...role,
      groupId: group.id,
    };
  }

  getGroupRole (roles: { role: Role }[]) {
    const groupRole = roles.find((r) => r.role.name === 'CAPTAIN' || r.role.name === 'MODERATOR' || r.role.name === 'STUDENT');
    return groupRole.role;
  }

  async removeRole (id: string, roleId: string) {
    await this.studentRepository.removeRole(id, roleId);
  }

  async updateStudent (userId: string, data: UpdateStudentDTO) {
    return this.studentRepository.update(userId, data);
  }

  async updateSuperhero (userId: string, data: UpdateSuperheroData) {
    return this.superheroRepository.updateSuperhero(userId, data);
  }

  async requestNewGroup (id: string, { groupId, isCaptain }: GroupRequestDTO) {
    const student = await this.studentRepository.get(id);
    if (student.state === State.APPROVED)
      throw new ForbiddenException();
    
    await this.studentRepository.update(id, { state: State.PENDING });
    const name = {
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
    };
    await this.authService.verify(student.user, { groupId, isCaptain, ...name });
  }

  async deleteUser (userId: string) {
    await this.userRepository.delete(userId);
  }

  async updateUser (userId: string, data: UpdateUserDTO) {
    return this.userRepository.update(userId, data);
  }

  async getContacts (userId: string) {
    return this.contactRepository.getAllContacts(userId);
  }

  async createContact (userId: string, data: CreateContactDTO) {
    return this.contactRepository.createContact({
      entityId: userId,
      entityType: EntityType.STUDENT,
      ...data,
    });
  }

  async updateContact (userId: string, name: string, data: UpdateContactDTO) {
    await this.contactRepository.updateContact(userId, name, data);
    return this.contactRepository.getContact(userId, name);
  }

  async deleteContact (userId: string, name: string) {
    await this.contactRepository.deleteContact(userId, name);
  }

  async deleteStudent (userId: string) {
    await this.studentRepository.delete(userId);
  }

  getStudent (student: StudentWithUser) {
    return {
      id: student.user.id,
      username: student.user.username,
      email: student.user.email,
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName,
      avatar: student.user.avatar,
      telegramId: student.user.telegramId,
      group: student.group,
    };
  }

  async addGroupRole (userId: string, isCaptain: boolean) {
    const roleName = isCaptain ? RoleName.CAPTAIN : RoleName.STUDENT;
    const { group } = await this.studentRepository.get(userId);
    await this.groupService.addGroupRole(group.id, userId, roleName);
  }

  async getUser (userId: string) {
    const student = await this.studentRepository.get(userId);

    return this.getStudent(student);
  }
}