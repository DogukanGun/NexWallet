-- CreateTable
CREATE TABLE "Voices" (
    "id" SERIAL NOT NULL,
    "voice_id" TEXT NOT NULL,
    "voice_bytes" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ipfs_hash" TEXT NOT NULL DEFAULT '',
    "share_for_training" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_voice" (
    "user_id" INTEGER NOT NULL,
    "voice_id" INTEGER NOT NULL,

    CONSTRAINT "user_voice_pkey" PRIMARY KEY ("user_id","voice_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Voices_voice_id_key" ON "Voices"("voice_id");

-- AddForeignKey
ALTER TABLE "Voices" ADD CONSTRAINT "Voices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "TwitterUsers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_voice" ADD CONSTRAINT "user_voice_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "TwitterUsers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_voice" ADD CONSTRAINT "user_voice_voice_id_fkey" FOREIGN KEY ("voice_id") REFERENCES "Voices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
