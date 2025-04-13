-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "transactionHash" TEXT NOT NULL,
    "userWallet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionHash_key" ON "Transaction"("transactionHash");
