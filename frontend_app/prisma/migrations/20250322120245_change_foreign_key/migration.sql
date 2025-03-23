/*
  Warnings:

  - The primary key for the `user_voice` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "Voices" DROP CONSTRAINT "Voices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_voice" DROP CONSTRAINT "user_voice_user_id_fkey";

-- AlterTable
ALTER TABLE "Voices" ALTER COLUMN "user_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "user_voice" DROP CONSTRAINT "user_voice_pkey",
ALTER COLUMN "user_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_voice_pkey" PRIMARY KEY ("user_id", "voice_id");

-- AddForeignKey
ALTER TABLE "Voices" ADD CONSTRAINT "Voices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "TwitterUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_voice" ADD CONSTRAINT "user_voice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "TwitterUsers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
