-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Shreyas Hathiwala',
    "email" TEXT NOT NULL DEFAULT 'shreyas@hathiwala.com',
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "transactions" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "user_id" TEXT,
    "date" TEXT NOT NULL,
    "merchant" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "upi_ref" TEXT NOT NULL,
    "note" TEXT,
    "raw_message" TEXT,
    "email_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parsed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "transactions_messageId_key" ON "transactions"("email_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_date_idx" ON "transactions"("date");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_category_idx" ON "transactions"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_type_idx" ON "transactions"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "transactions_referenceNo_idx" ON "transactions"("upi_ref");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'transactions_userId_fkey'
    ) THEN
        ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
