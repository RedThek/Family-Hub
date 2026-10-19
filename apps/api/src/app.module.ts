import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { IdentityAccessModule } from "./modules/identity-access/identity-access.module";
import { GenealogyModule } from "./modules/genealogy/genealogy.module";
import { VisibilityModule } from "./modules/visibility/visibility.module";
import { ModerationModule } from "./modules/moderation/moderation.module";
import { HistoryModule } from "./modules/history/history.module";
import { DocumentsModule } from "./modules/documents/documents.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    IdentityAccessModule,
    GenealogyModule,
    VisibilityModule,
    ModerationModule,
    HistoryModule,
    DocumentsModule,
    NotificationsModule,
  ],
})
export class AppModule {}
