/*
  Warnings:

  - Changed the type of `voice_bytes` on the `Voices` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Voices" DROP COLUMN "voice_bytes",
ADD COLUMN     "voice_bytes" BYTEA NOT NULL;
