/*
  Warnings:

  - You are about to alter the column `employeeId` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `employees` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `employees` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "changedFields" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_audit_logs" ("action", "changedFields", "createdAt", "employeeId", "id", "userId") SELECT "action", "changedFields", "createdAt", "employeeId", "id", "userId" FROM "audit_logs";
DROP TABLE "audit_logs";
ALTER TABLE "new_audit_logs" RENAME TO "audit_logs";
CREATE TABLE "new_employees" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "rg" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "cargo" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "hireDate" DATETIME NOT NULL,
    "salary" REAL NOT NULL,
    "address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "inactivatedAt" DATETIME
);
INSERT INTO "new_employees" ("address", "birthDate", "cargo", "cpf", "createdAt", "department", "email", "hireDate", "id", "inactivatedAt", "name", "phone", "rg", "salary", "status", "updatedAt") SELECT "address", "birthDate", "cargo", "cpf", "createdAt", "department", "email", "hireDate", "id", "inactivatedAt", "name", "phone", "rg", "salary", "status", "updatedAt" FROM "employees";
DROP TABLE "employees";
ALTER TABLE "new_employees" RENAME TO "employees";
CREATE UNIQUE INDEX "employees_cpf_key" ON "employees"("cpf");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
