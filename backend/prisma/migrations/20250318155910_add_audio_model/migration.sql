-- CreateTable
CREATE TABLE "audios" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "shareableId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audios_url_key" ON "audios"("url");

-- CreateIndex
CREATE UNIQUE INDEX "audios_shareableId_key" ON "audios"("shareableId");

-- AddForeignKey
ALTER TABLE "audios" ADD CONSTRAINT "audios_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
