ALTER TABLE "tasks" ALTER COLUMN "created_by_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "assigned_to_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "team_members" ALTER COLUMN "user_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "teams" ALTER COLUMN "owner_id" SET DATA TYPE varchar(255);