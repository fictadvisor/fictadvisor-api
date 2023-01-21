import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './UserService';
import { UserController } from './UserController';
import { ConfigurationModule } from '../../config/ConfigModule';
import { GroupModule } from '../group/GroupModule';
import { DisciplineModule } from '../discipline/DisciplineModule';
import { RoleService } from './role/RoleService';
import { RoleController } from './role/RoleController';
import { PrismaModule } from '../../database/PrismaModule';
import { GrantService } from './grant/GrantService';

@Module({
  controllers: [UserController, RoleController],
  providers: [UserService, RoleService, GrantService],
  exports: [UserService, RoleService, GrantService],
  imports: [ConfigurationModule, forwardRef(() => GroupModule), DisciplineModule, PrismaModule],
})
export class UserModule {}
