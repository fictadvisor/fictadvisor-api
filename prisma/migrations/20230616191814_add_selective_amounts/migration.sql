-- CreateTable
CREATE TABLE "selective_amount" (
    "group_id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "selective_amount_pkey" PRIMARY KEY ("group_id")
);

-- AddForeignKey
ALTER TABLE "selective_amount" ADD CONSTRAINT "selective_amount_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
