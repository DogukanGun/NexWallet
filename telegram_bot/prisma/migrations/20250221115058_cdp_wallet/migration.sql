-- CreateTable
CREATE TABLE "CDPWallet" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "CDPWallet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CDPWallet_chatId_key" ON "CDPWallet"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "CDPWallet_address_key" ON "CDPWallet"("address");

-- AddForeignKey
ALTER TABLE "CDPWallet" ADD CONSTRAINT "CDPWallet_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "TelegramGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
