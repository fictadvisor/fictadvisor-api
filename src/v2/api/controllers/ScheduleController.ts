import {
  Body,
  Controller, Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request, UseGuards,
} from '@nestjs/common';
import { ScheduleService } from '../services/ScheduleService';
import { GroupByIdPipe } from '../pipes/GroupByIdPipe';
import { DateService } from '../../utils/date/DateService';
import { ScheduleMapper } from '../../mappers/ScheduleMapper';
import { Access } from '../../security/Access';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateEventDTO } from '../dtos/CreateEventDTO';
import { EventResponse } from '../responses/EventResponse';
import { EventByIdPipe } from '../pipes/EventByIdPipe';
import { GroupByEventGuard } from '../../security/group-guard/GroupByEventGuard';
import { EventsResponse, GeneralEventsResponse } from '../responses/EventsResponse';
import { TelegramGuard } from '../../security/TelegramGuard';
import { EventFiltrationDTO } from '../dtos/EventFiltrationDTO';
import { GeneralEventFiltrationDTO } from '../dtos/GeneralEventFiltrationDTO';
import { EventFiltrationPipe } from '../pipes/EventFiltrationPipe';

@ApiTags('Schedule')
@Controller({
  version: '2',
  path: '/schedule',
})
export class ScheduleController {
  constructor (
    private scheduleService: ScheduleService,
    private dateService: DateService,
    private scheduleMapper: ScheduleMapper,
  ) {}

  @Access('schedule.parse')
  @ApiBearerAuth()
  @Post('/parse')
  @ApiOkResponse()
  @ApiUnauthorizedResponse({
    description: `\n
    UnauthorizedException:
      Unauthorized`,
  })
  @ApiQuery({
    name: 'parser',
    enum: ['schedule', 'rozkpi'],
  })
  @ApiQuery({
    name: 'semester',
    enum: [1, 2],
  })
  @ApiQuery({
    name: 'page',
    required: false,
  })
  @ApiQuery({
    name: 'groups',
    required: false,
  })
  async parse (
    @Query('parser') parser: string,
    @Query('page') page: string,
    @Query('year', ParseIntPipe) year: number,
    @Query('semester', ParseIntPipe) semester: number,
    @Query('groups') groups: string,
  ) {
    const period = {
      year,
      semester,
    };
    return this.scheduleService.parse(parser, page, period, groups);
  }

  @Get('/groups/:groupId/general')
  @ApiQuery({
    name: 'week',
    required: false,
  })
  @ApiOkResponse({
    type: GeneralEventsResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException: 
      Group with such id is not found
      
    DataNotFoundException: 
      Data were not found`,
  })
  async getGeneralEvents (
    @Param('groupId', GroupByIdPipe) id: string,
    @Query('week') week: number,
    @Query(EventFiltrationPipe) query: GeneralEventFiltrationDTO,
  ) {
    const result = await this.scheduleService.getGeneralGroupEventsWrapper(
      id,
      week,
      query,
    );
    return {
      events: this.scheduleMapper.getEvents(result.events),
      week: result.week,
      startTime: result.startTime,
    };
  }

  @UseGuards(TelegramGuard)
  @Get('/groups/:groupId/general/day')
  @ApiQuery({
    name: 'day',
    required: false,
  })
  @ApiOkResponse({
    type: GeneralEventsResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidGroupIdException: 
      Group with such id is not found
      
    InvalidWeekException:
      Week parameter is invalid
      
    InvalidDayException: 
      Day parameter is invalid`,
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
  async getGeneralGroupEventsByDay (
    @Param('groupId', GroupByIdPipe) id: string,
    @Query('day') day: number,
  ) {
    const result = await this.scheduleService.getGeneralGroupEventsByDay(id, day);
    return {
      events: this.scheduleMapper.getEvents(result.events),
    };
  }

  @Access('groups.$groupId.events.get', GroupByEventGuard)
  @Get('/events/:eventId')
  @ApiOkResponse({
    type: EventResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException: 
      Event with such id is not found
      
    InvalidWeekException:
      Week parameter is invalid`,
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
  async getEvent (
    @Param('eventId', EventByIdPipe) id: string,
    @Query('week') week: number,
  ) {
    const result = await this.scheduleService.getEvent(id, week);
    return this.scheduleMapper.getEvent(result.event, result.discipline);
  }

  @Access('groups.$groupId.events.create')
  @Post('/events')
  @ApiBearerAuth()
  @ApiOkResponse({
    type: EventResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidBodyException:
      Group id cannot be empty
      Name is too short (min: 2)
      Name is too long (max: 100)
      Name cannot be empty
      Discipline type must be an enum
      Teachers must be Array
      Teachers cannot be empty (empty array is required)
      Start time cannot be empty
      Start time must be Date
      End time cannot be empty
      End Time must be Date
      Period cannot be empty
      Period must be an enum
      Url must be a URL address
      Discipline description is too long (max: 2000)
      Event description is too long (max: 2000)
      
    ObjectIsRequiredException:
      DisciplineType is required
      
    InvalidDateException:
      Date is not valid or does not belong to this semester
      
    DataNotFoundException:
      Data was not found`,
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
  async createEvent (
    @Body() body: CreateEventDTO,
  ) {
    const result = await this.scheduleService.createGroupEvent(body);
    return this.scheduleMapper.getEvent(result.event, result.discipline);
  }

  @Access('groups.$groupId.events.get')
  @Get('/groups/:groupId/events')
  @ApiBearerAuth()
  @ApiOkResponse({
    type: EventsResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidGroupIdException:
      Group with such id is not found`,
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
  @ApiQuery({
    type: Number,
    name: 'week',
    required: false,
  })
  async getGroupEvents (
    @Request() req,
    @Param('groupId', GroupByIdPipe) groupId: string,
    @Query('week') week: number,
    @Query(EventFiltrationPipe) query: EventFiltrationDTO,
  ) {
    const result = await this.scheduleService.getGroupEvents(
      req.user.id,
      groupId,
      week,
      query,
    );
    return {
      events: this.scheduleMapper.getEvents(result.events),
      week: result.week,
      startTime: result.startTime,
    };
  }

  @Access('groups.$groupId.events.delete')
  @Delete('/events/:eventId')
  @ApiBearerAuth()
  @ApiOkResponse({
    type: EventResponse,
  })
  @ApiBadRequestResponse({
    description: `\n
    InvalidEntityIdException: 
      Event with such id is not found`,
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
  async deleteEvent (
    @Param('eventId', EventByIdPipe) id: string,
  ) {
    const result = await this.scheduleService.deleteEvent(id);
    return this.scheduleMapper.getEvent(result.event, result.discipline);
  }
}
