import { randomUUID } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const legacyUsersWithoutCredentialAccount = await prisma.user.findMany({
    where: {
      password: { not: null },
      accounts: {
        none: {
          providerId: "credential",
        },
      },
    },
    select: {
      id: true,
      password: true,
      email: true,
    },
  });

  if (legacyUsersWithoutCredentialAccount.length > 0) {
    await prisma.account.createMany({
      data: legacyUsersWithoutCredentialAccount.map((user) => ({
        id: randomUUID(),
        accountId: user.id,
        providerId: "credential",
        userId: user.id,
        password: user.password,
      })),
      skipDuplicates: true,
    });
  }

  const credentialAccountsMissingPassword = await prisma.account.findMany({
    where: {
      providerId: "credential",
      password: null,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  let patchedPasswords = 0;

  for (const account of credentialAccountsMissingPassword) {
    const user = await prisma.user.findUnique({
      where: { id: account.userId },
      select: { password: true },
    });

    if (!user?.password) {
      continue;
    }

    await prisma.account.update({
      where: { id: account.id },
      data: { password: user.password },
    });

    patchedPasswords += 1;
  }

  console.log(
    `Backfill done: created ${legacyUsersWithoutCredentialAccount.length} credential account(s), patched ${patchedPasswords} credential password(s).`,
  );
}

main()
  .catch((error) => {
    console.error("Credential backfill failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
