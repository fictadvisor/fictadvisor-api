import { Body, Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common';
import { RoleService } from '../services/RoleService';
import { UpdateRoleDTO } from '../dtos/UpdateRoleDTO';
import { CreateRoleWithGrantsDTO } from '../dtos/CreateRoleWithGrantsDTO';
import { CreateGrantsDTO } from '../dtos/CreateGrantsDTO';
import { RoleMapper } from '../../mappers/RoleMapper';
import { Access } from '../../security/Access';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import {
  RoleResponse,
  RolesResponse,
  BaseRoleResponse,
} from '../responses/RoleResponse';
import { GrantResponse, MappedGrantsResponse } from '../responses/GrantResponse';
import { PERMISSION } from '../../security/PERMISSION';
import { ApiEndpoint } from '../../utils/documentation/decorators';

@ApiTags('Roles')
@Controller({
  version: '2',
  path: '/roles',
})
export class RoleController {
  constructor (
    private roleService: RoleService,
    private roleMapper: RoleMapper,
  ) {}

  @ApiOkResponse({
    type: RoleResponse,
  })
  @ApiParam({
    name: 'roleId',
    required: true,
    description: 'Id of a user role',
  })
  @ApiEndpoint({
    summary: 'Request role by id',
  })
  @Get('/:roleId')
  async getRole (
    @Param('roleId') roleId: string,
  ) {
    const role = await this.roleService.get(roleId);
    return this.roleMapper.getRole(role);
  }

  @ApiOkResponse({
    type: RolesResponse,
  })
  @ApiEndpoint({
    summary: 'Get all roles',
  })
  @Get()
  async getAll () {
    const roles = await this.roleService.getAll();
    const roleMap = this.roleMapper.getAll(roles);
    return { roles: roleMap };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: RoleResponse,
  })
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiForbiddenResponse({
    description: `\n 
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException: 
      parentId with such id is not found
      
    InvalidBodyException:
      Name is not an enum
      Name cat not be empty
      Weight is not a number 
      Weight can not be empty 
      Permission can not be empty 
      Set is not boolean`,
  })
  @ApiEndpoint({
    summary: 'Create role',
    permissions: PERMISSION.ROLES_CREATE,
  })
  @Post()
  async create (
    @Body() body: CreateRoleWithGrantsDTO,
    @Request() req
  ) {
    const role = await this.roleService.createRole(body, req.user.id);
    return this.roleMapper.create(role);
  }

  @Access(PERMISSION.ROLES_$ROLEID_GRANTS_CREATE)
  @ApiBearerAuth()
  @ApiOkResponse({
    type: GrantResponse,
  })
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiForbiddenResponse({
    description: `\n 
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidBodyException:
      Permission can not be empty
      Set is not a boolean`,
  })
  @Post('/:roleId/grants')
  createGrants (
    @Body() body: CreateGrantsDTO,
    @Param('roleId') roleId: string,
  ) {
    return this.roleService.createGrants(roleId, body.grants);
  }

  @ApiOkResponse({
    type: MappedGrantsResponse,
  })
  @Get('/:roleId/grants')
  async getGrants (
    @Param('roleId') roleId: string,
  ) {
    const grants = await this.roleService.getGrants(roleId);
    const grantsMap = this.roleMapper.getGrants(grants);
    return { grants: grantsMap };
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: BaseRoleResponse,
  })
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiForbiddenResponse({
    description: `\n
    NoPermissionException:
      You do not have permission to perform this action`,
  })
  @ApiParam({
    name: 'roleId',
    required: true,
    description: 'Id of a user role',
  })
  @ApiEndpoint({
    summary: 'Delete role by id',
    permissions: PERMISSION.ROLES_$ROLEID_DELETE,
  })
  @Delete('/:roleId')
  async delete (
    @Param('roleId') roleId: string,
  ) {
    const role = await this.roleService.delete(roleId);
    return this.roleMapper.delete(role);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: BaseRoleResponse,
  })
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiForbiddenResponse({
    description: `\n
     NoPermissionException:
       You do not have permission to perform this action`,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidBodyException:
      Name is not an enum
      Weight is not a number`,
  })
  @ApiParam({
    name: 'roleId',
    required: true,
    description: 'Id of a user role',
  })
  @ApiEndpoint({
    summary: 'Update role by id',
    permissions: PERMISSION.ROLES_$ROLEID_UPDATE,
  })
  @Patch('/:roleId')
  async update (
    @Param('roleId') roleId: string,
    @Body() body: UpdateRoleDTO,
  ) {
    const role = await this.roleService.update(roleId, body);
    return this.roleMapper.update(role);
  }

}
