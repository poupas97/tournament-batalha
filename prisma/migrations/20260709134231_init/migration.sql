-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MANAGER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MANAGER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Default admin user
-- Email: admin@example.com
-- Password: Admin123!
-- node -e "require('bcryptjs').hash('Admin123!',12).then(console.log)"
INSERT INTO "User" (
    "name",
    "email",
    "password",
    "role"
)
VALUES (
    'Administrador',
    'admin@example.com',
    '$2b$12$C6UzMDM.H6dfI/f/IKxGhuQqg0J8Qm6vV6n5u2mD3fM0h9tXw9V6W',
    'ADMIN'
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "teamId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- Foreign Keys
ALTER TABLE "Player"
ADD CONSTRAINT "Player_teamId_fkey"
FOREIGN KEY ("teamId")
REFERENCES "Team"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "Staff"
ADD CONSTRAINT "Staff_teamId_fkey"
FOREIGN KEY ("teamId")
REFERENCES "Team"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;