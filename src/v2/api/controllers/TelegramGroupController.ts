import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  ApiCreatedResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import { TelegramGroupService } from '../services/TelegramGroupService';
import { TelegramGroupMapper } from '../../mappers/TelegramGroupMapper';
import { CreateTelegramGroupDTO } from '../dtos/CreateTelegramGroupDTO';
import { UpdateTelegramGroupDTO } from '../dtos/UpdateTelegramGroupDTO';
import { TelegramGroupByIdPipe } from '../pipes/TelegramGroupByIdPipe';
import { GroupByIdPipe } from '../pipes/GroupByIdPipe';
import { TelegramGroupResponse, TelegramGroupsResponse } from '../responses/TelegramGroupResponse';
import { TelegramGroupsByTelegramIdResponse } from '../responses/TelegramGroupByTelegramIdResponse';
import { TelegramGuard } from '../../security/TelegramGuard';
import { ApiEndpoint } from '../../utils/documentation/decorators';

@ApiTags('TelegramGroup')
@Controller({
  version: '2',
  path: '/telegramGroups',
})
export class TelegramGroupController {
  constructor (
    private telegramGroupService: TelegramGroupService,
    private telegramGroupMapper: TelegramGroupMapper,
  ) {}

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiCreatedResponse({
    type: TelegramGroupResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidBodyException:
      TelegramId can not be empty
      TelegramId is not a number
      Source can not be empty
      Source is not an enum
      ThreadId is not a number
      PostInfo can not be empty
      PostInfo is not a boolean
      
    ObjectIsRequiredException:
      Thread ID is required
      
    AlreadyExistException:
      TelegramGroup already exist
      
    InvalidEntityIdException:
      Group with such id is not found`,
  })
  @ApiEndpoint({
    summary: 'Create telegram group',
    guards: TelegramGuard,
  })
  @Post('/:groupId')
  async create (
    @Param('groupId', GroupByIdPipe) groupId: string,
    @Body() body: CreateTelegramGroupDTO,
  ) {
    const telegramGroup = await this.telegramGroupService.create(groupId, body);
    return this.telegramGroupMapper.getTelegramGroup(telegramGroup);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiOkResponse({
    type: TelegramGroupResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidBodyException:
      TelegramId is not a number
      Source is not an enum
      ThreadId is not a number
      PostInfo is not a boolean
    
    InvalidEntityIdException:
      TelegramGroup with such id is not found
      Group with such id is not found
      
      DataNotFoundException:
      Data were not found`,
  })
  @ApiQuery({
    name: 'telegramId',
    type: Number,
  })
  @ApiEndpoint({
    summary: 'Update telegram group',
    guards: TelegramGuard,
  })
  @Patch()
  async update (
    @Query('telegramId', TelegramGroupByIdPipe) telegramId: bigint,
    @Query('groupId', GroupByIdPipe) groupId: string,
    @Body() body: UpdateTelegramGroupDTO,
  ) {
    const telegramGroup = await this.telegramGroupService.update(telegramId, groupId, body);
    return this.telegramGroupMapper.getTelegramGroup(telegramGroup);
  }

  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiOkResponse()
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException:
      TelegramGroup with such id is not found
      Group with such id is not found
      
    DataNotFoundException:
      Data were not found`,
  })
  @ApiQuery({
    name: 'telegramId',
    type: Number,
  })
  @ApiEndpoint({
    summary: 'Delete telegram group',
    guards: TelegramGuard,
  })
  @Delete()
  async delete (
    @Query('telegramId', TelegramGroupByIdPipe) telegramId: bigint,
    @Query('groupId', GroupByIdPipe) groupId: string,
  ) {
    await this.telegramGroupService.delete(telegramId, groupId);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: TelegramGroupsResponse,
  })
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException:
      Group with such id is not found
      
    DataNotFoundException:
      Data were not found`,
  })
  @ApiEndpoint({
    summary: 'Get all telegram groups',
    guards: TelegramGuard,
  })
  @Get('/:groupId')
  async getTelegramGroups (
    @Param('groupId', GroupByIdPipe) groupId: string,
  ) {
    const telegramGroups = await this.telegramGroupService.getAll(groupId);
    return this.telegramGroupMapper.getTelegramGroups(telegramGroups);
  }

  @ApiBearerAuth()
  @ApiOkResponse({
    type: TelegramGroupsByTelegramIdResponse,
  })
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException:
      TelegramGroup with such id is not found`,
  })
  @ApiParam({
    name: 'telegramId',
    type: Number,
  })
  @ApiEndpoint({
    summary: 'Get telegram group',
    guards: TelegramGuard,
  })
  @Get('/telegram/:telegramId')
  async getGroupsByTelegramId (
    @Param('telegramId', TelegramGroupByIdPipe) telegramId: bigint,
  ) {
    const telegramGroups = await this.telegramGroupService.getGroupByTelegramId(telegramId);
    return this.telegramGroupMapper.getGroupsByTelegramId(telegramGroups);
  }
}
