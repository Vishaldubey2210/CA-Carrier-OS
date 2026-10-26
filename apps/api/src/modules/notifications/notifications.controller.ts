import { Controller, Get, Patch, Post, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { AuthUserPayload } from '@ca-career-os/shared';

@Controller('api/v1/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getNotifications(
    @CurrentUser() user: AuthUserPayload,
    @CurrentWorkspace() workspaceId: string
  ) {
    return await this.notificationsService.getNotifications(user.id, workspaceId);
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markRead(
    @Param('id') id: string,
    @CurrentUser() user: AuthUserPayload
  ) {
    return await this.notificationsService.markAsRead(id, user.id);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllRead(@CurrentUser() user: AuthUserPayload) {
    return await this.notificationsService.markAllAsRead(user.id);
  }
}
