/*
  Warnings:

  - You are about to drop the column `background_image` on the `greetings` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_greetings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "background_video" TEXT,
    "profile_image" TEXT,
    "text_color" TEXT NOT NULL DEFAULT '#ffffff',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_greetings" ("content", "created_at", "id", "is_active", "text_color", "title", "updated_at") SELECT "content", "created_at", "id", "is_active", "text_color", "title", "updated_at" FROM "greetings";
DROP TABLE "greetings";
ALTER TABLE "new_greetings" RENAME TO "greetings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
