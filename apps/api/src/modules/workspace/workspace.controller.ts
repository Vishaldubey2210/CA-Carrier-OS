import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import {
  AuthUserPayload,
  CreateWorkspaceInput,
  InviteMemberInput,
  MemberRole,
} from '@ca-career-os/shared';

@Controller('api/v1/workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  async listUserWorkspaces(@CurrentUser() user: AuthUserPayload) {
    return await this.workspaceService.listUserWorkspaces(user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganizationWorkspace(
    @CurrentUser() user: AuthUserPayload,
    @Body() body: CreateWorkspaceInput
  ) {
    return await this.workspaceService.createOrganizationWorkspace(user.id, body);
  }

  @Post('invitations/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(
    @CurrentUser() user: AuthUserPayload,
    @Body('token') token: string
  ) {
    return await this.workspaceService.acceptInvitation(token, user.id, user.email);
  }

  @Get(':workspaceId')
  @UseGuards(WorkspaceGuard)
  async getWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUserPayload
  ) {
    return await this.workspaceService.getWorkspaceById(workspaceId, user.id);
  }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceGuard)
  async listMembers(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUserPayload
  ) {
    return await this.workspaceService.listMembers(workspaceId, user.id);
  }

  @Post(':workspaceId/members/invite')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async inviteMember(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUserPayload,
    @Body() body: InviteMemberInput
  ) {
    return await this.workspaceService.inviteMember(workspaceId, user.id, body);
  }

  @Delete(':workspaceId/members/:memberUserId')
  @UseGuards(WorkspaceGuard, RolesGuard)
  @Roles(MemberRole.OWNER, MemberRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('workspaceId') workspaceId: string,
    @Param('memberUserId') memberUserId: string,
    @CurrentUser() user: AuthUserPayload
  ) {
    return await this.workspaceService.removeMember(workspaceId, user.id, memberUserId);
  }
}
