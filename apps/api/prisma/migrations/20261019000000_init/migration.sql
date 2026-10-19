-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('M', 'F');

-- CreateEnum
CREATE TYPE "LifeStatus" AS ENUM ('living', 'deceased', 'unknown');

-- CreateEnum
CREATE TYPE "DatePrecision" AS ENUM ('year', 'month', 'day');

-- CreateEnum
CREATE TYPE "UnionStatus" AS ENUM ('married', 'partnered', 'separated', 'divorced', 'widowed');

-- CreateEnum
CREATE TYPE "ParentLinkKind" AS ENUM ('biological', 'adoptive');

-- CreateEnum
CREATE TYPE "ClosurePathType" AS ENUM ('all', 'biological', 'paternal');

-- CreateEnum
CREATE TYPE "VisibilityCategory" AS ENUM ('general', 'details', 'media');

-- CreateEnum
CREATE TYPE "VisibilityLevel" AS ENUM ('public', 'members_only', 'approved', 'private');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('invited', 'pending_approval', 'approved', 'suspended');

-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('global', 'branch', 'house');

-- CreateEnum
CREATE TYPE "PendingChangeStatus" AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');

-- CreateEnum
CREATE TYPE "ChangeOperation" AS ENUM ('create', 'update', 'delete');

-- CreateEnum
CREATE TYPE "HistorySource" AS ENUM ('direct', 'moderated');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('birth_certificate', 'marriage_certificate', 'death_certificate', 'other');

-- CreateTable
CREATE TABLE "person" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "first_names" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "life_status" "LifeStatus" NOT NULL,
    "birth_date" DATE,
    "birth_date_precision" "DatePrecision",
    "birth_place" TEXT,
    "death_date" DATE,
    "death_date_precision" "DatePrecision",
    "death_place" TEXT,
    "photo_file_id" UUID,
    "row_version" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL,
    "person_id" UUID,
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_union" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "person_a_id" UUID NOT NULL,
    "person_b_id" UUID NOT NULL,
    "status" "UnionStatus" NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "place" TEXT,
    "row_version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "person_union_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parent_link" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "parent_id" UUID NOT NULL,
    "child_id" UUID NOT NULL,
    "kind" "ParentLinkKind" NOT NULL,
    "adoption_date" DATE,
    "row_version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "parent_link_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_visibility" (
    "person_id" UUID NOT NULL,
    "category" "VisibilityCategory" NOT NULL,
    "level" "VisibilityLevel" NOT NULL,

    CONSTRAINT "person_visibility_pkey" PRIMARY KEY ("person_id","category")
);

-- CreateTable
CREATE TABLE "person_closure" (
    "ancestor_id" UUID NOT NULL,
    "descendant_id" UUID NOT NULL,
    "path_type" "ClosurePathType" NOT NULL,
    "depth" INTEGER NOT NULL,

    CONSTRAINT "person_closure_pkey" PRIMARY KEY ("ancestor_id","descendant_id","path_type")
);

-- CreateTable
CREATE TABLE "stored_file" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "storage_key" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,

    CONSTRAINT "stored_file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "person_id" UUID,
    "union_id" UUID,
    "doc_type" "DocType" NOT NULL,
    "file_id" UUID NOT NULL,
    "visibility_level" "VisibilityLevel" NOT NULL,

    CONSTRAINT "document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "founder_person_id" UUID NOT NULL,
    "parent_branch_id" UUID,

    CONSTRAINT "branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "house" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "branch_id" UUID NOT NULL,
    "union_id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "house_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission" (
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "role_id" UUID NOT NULL,
    "permission_code" TEXT NOT NULL,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("role_id","permission_code")
);

-- CreateTable
CREATE TABLE "role_assignment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "account_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "scope_type" "ScopeType" NOT NULL,
    "scope_id" UUID,
    "is_provisional" BOOLEAN NOT NULL DEFAULT false,
    "assigned_by" UUID,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "role_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_policy" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "role_id" UUID NOT NULL,
    "policy_key" TEXT NOT NULL,
    "params" JSONB NOT NULL,

    CONSTRAINT "role_policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_change" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "author_account_id" UUID NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" UUID,
    "operation" "ChangeOperation" NOT NULL,
    "payload" JSONB NOT NULL,
    "base_row_version" INTEGER,
    "status" "PendingChangeStatus" NOT NULL,
    "decided_by" UUID,
    "decided_at" TIMESTAMP(3),
    "decision_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_change_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "field_name" TEXT NOT NULL,
    "old_value" JSONB,
    "new_value" JSONB,
    "data_category" TEXT NOT NULL,
    "source" "HistorySource" NOT NULL,
    "changed_by" UUID NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pending_change_id" UUID,

    CONSTRAINT "field_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "details" JSONB NOT NULL,
    "source" "HistorySource" NOT NULL,
    "actor_account_id" UUID NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pending_change_id" UUID,

    CONSTRAINT "change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invitation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "token_hash" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "invited_by" UUID NOT NULL,
    "target_person_id" UUID,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "recipient_account_id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "pending_change_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "person_photo_file_id_key" ON "person"("photo_file_id");

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_person_id_key" ON "account"("person_id");

-- CreateIndex
CREATE INDEX "person_union_person_a_id_idx" ON "person_union"("person_a_id");

-- CreateIndex
CREATE INDEX "person_union_person_b_id_idx" ON "person_union"("person_b_id");

-- CreateIndex
CREATE INDEX "parent_link_child_id_idx" ON "parent_link"("child_id");

-- CreateIndex
CREATE UNIQUE INDEX "parent_link_parent_id_child_id_key" ON "parent_link"("parent_id", "child_id");

-- CreateIndex
CREATE INDEX "person_closure_descendant_id_path_type_depth_idx" ON "person_closure"("descendant_id", "path_type", "depth");

-- CreateIndex
CREATE INDEX "person_closure_ancestor_id_path_type_depth_idx" ON "person_closure"("ancestor_id", "path_type", "depth");

-- CreateIndex
CREATE UNIQUE INDEX "stored_file_storage_key_key" ON "stored_file"("storage_key");

-- CreateIndex
CREATE INDEX "document_person_id_idx" ON "document"("person_id");

-- CreateIndex
CREATE INDEX "document_union_id_idx" ON "document"("union_id");

-- CreateIndex
CREATE INDEX "branch_founder_person_id_idx" ON "branch"("founder_person_id");

-- CreateIndex
CREATE UNIQUE INDEX "house_branch_id_union_id_key" ON "house"("branch_id", "union_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "role"("code");

-- CreateIndex
CREATE INDEX "role_assignment_account_id_revoked_at_idx" ON "role_assignment"("account_id", "revoked_at");

-- CreateIndex
CREATE INDEX "role_assignment_role_id_idx" ON "role_assignment"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_policy_role_id_policy_key_key" ON "role_policy"("role_id", "policy_key");

-- CreateIndex
CREATE INDEX "pending_change_status_idx" ON "pending_change"("status");

-- CreateIndex
CREATE INDEX "pending_change_target_type_target_id_idx" ON "pending_change"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "field_history_entity_type_entity_id_idx" ON "field_history"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "change_log_entity_type_entity_id_idx" ON "change_log"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "change_log_occurred_at_idx" ON "change_log"("occurred_at");

-- CreateIndex
CREATE UNIQUE INDEX "invitation_token_hash_key" ON "invitation"("token_hash");

-- CreateIndex
CREATE INDEX "invitation_email_idx" ON "invitation"("email");

-- CreateIndex
CREATE INDEX "notification_recipient_account_id_read_at_idx" ON "notification"("recipient_account_id", "read_at");

-- AddForeignKey
ALTER TABLE "person" ADD CONSTRAINT "person_photo_file_id_fkey" FOREIGN KEY ("photo_file_id") REFERENCES "stored_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_union" ADD CONSTRAINT "person_union_person_a_id_fkey" FOREIGN KEY ("person_a_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_union" ADD CONSTRAINT "person_union_person_b_id_fkey" FOREIGN KEY ("person_b_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_link" ADD CONSTRAINT "parent_link_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parent_link" ADD CONSTRAINT "parent_link_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_visibility" ADD CONSTRAINT "person_visibility_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_closure" ADD CONSTRAINT "person_closure_ancestor_id_fkey" FOREIGN KEY ("ancestor_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "person_closure" ADD CONSTRAINT "person_closure_descendant_id_fkey" FOREIGN KEY ("descendant_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "person_union"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "stored_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_founder_person_id_fkey" FOREIGN KEY ("founder_person_id") REFERENCES "person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch" ADD CONSTRAINT "branch_parent_branch_id_fkey" FOREIGN KEY ("parent_branch_id") REFERENCES "branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house" ADD CONSTRAINT "house_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "house" ADD CONSTRAINT "house_union_id_fkey" FOREIGN KEY ("union_id") REFERENCES "person_union"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permission_code_fkey" FOREIGN KEY ("permission_code") REFERENCES "permission"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignment" ADD CONSTRAINT "role_assignment_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_policy" ADD CONSTRAINT "role_policy_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_change" ADD CONSTRAINT "pending_change_author_account_id_fkey" FOREIGN KEY ("author_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_change" ADD CONSTRAINT "pending_change_decided_by_fkey" FOREIGN KEY ("decided_by") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_history" ADD CONSTRAINT "field_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_history" ADD CONSTRAINT "field_history_pending_change_id_fkey" FOREIGN KEY ("pending_change_id") REFERENCES "pending_change"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_log" ADD CONSTRAINT "change_log_actor_account_id_fkey" FOREIGN KEY ("actor_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_log" ADD CONSTRAINT "change_log_pending_change_id_fkey" FOREIGN KEY ("pending_change_id") REFERENCES "pending_change"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_target_person_id_fkey" FOREIGN KEY ("target_person_id") REFERENCES "person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipient_account_id_fkey" FOREIGN KEY ("recipient_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_pending_change_id_fkey" FOREIGN KEY ("pending_change_id") REFERENCES "pending_change"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add domain constraints that Prisma schema syntax cannot currently express.
ALTER TABLE "person_union"
ADD CONSTRAINT "person_union_distinct_people_check"
CHECK ("person_a_id" <> "person_b_id");

ALTER TABLE "parent_link"
ADD CONSTRAINT "parent_link_adoption_date_kind_check"
CHECK ("kind" = 'adoptive' OR "adoption_date" IS NULL);

ALTER TABLE "document"
ADD CONSTRAINT "document_single_owner_check"
CHECK (("person_id" IS NOT NULL AND "union_id" IS NULL)
    OR ("person_id" IS NULL AND "union_id" IS NOT NULL));
