-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'В процесі',
ALTER COLUMN "applied_date" DROP DEFAULT;
