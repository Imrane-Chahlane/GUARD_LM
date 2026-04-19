import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrate() {
  console.log("Starting legacy migration to Nova framework...");

  const users = await prisma.user.findMany({
    include: {
      blacklistRules: true,
      regexRules: true,
      semanticExamples: true,
      apiKeys: true,
      config: true,
    },
  });

  for (const user of users) {
    const hasLegacyShield = await prisma.novaRule.findFirst({
      where: {
        userId: user.id,
        name: "Legacy Shield",
      },
    });

    if (hasLegacyShield) {
      console.log(`User ${user.email} already has a 'Legacy Shield' rule. Skipping.`);
      continue;
    }

    if (
      user.blacklistRules.length === 0 &&
      user.regexRules.length === 0 &&
      user.semanticExamples.length === 0
    ) {
      console.log(`User ${user.email} has no legacy rules to migrate. Skipping.`);
      continue;
    }

    console.log(`Migrating rules for user: ${user.email}`);

    const definition: any = {
      name: "Legacy Shield",
      meta: {
        description: "Auto-migrated from legacy blacklist and regex settings",
        tags: ["migrated", "legacy"],
      },
      keywords: {},
      semantics: {},
      condition: "",
    };

    const conditions: string[] = [];

    // Migrate Blacklist
    user.blacklistRules.forEach((rule, index) => {
      const key = `$kw_legacy_${index}`;
      definition.keywords[key] = {
        pattern: rule.phrase,
        isRegex: false,
        caseSensitive: false,
      };
      conditions.push(key);
    });

    // Migrate Regex
    user.regexRules.forEach((rule, index) => {
      const key = `$re_legacy_${index}`;
      definition.keywords[key] = {
        pattern: rule.pattern,
        isRegex: true,
        caseSensitive: false,
      };
      conditions.push(key);
    });

    // Migrate Semantics
    user.semanticExamples.forEach((rule, index) => {
      const key = `$sm_legacy_${index}`;
      definition.semantics[key] = {
        pattern: rule.text,
        threshold: user.config?.semanticThreshold ?? 0.78,
      };
      conditions.push(key);
    });

    // Combine with OR logic
    definition.condition = conditions.join(" or ");

    // If no conditions (shouldn't happen here due to checks above), skip
    if (!definition.condition) continue;

    const newRule = await prisma.novaRule.create({
      data: {
        userId: user.id,
        name: "Legacy Shield",
        definition: definition,
        decision: user.config?.maliciousAction === "SANITIZE" ? "SANITIZE" : "REJECT",
      },
    });

    // Link to all active API keys
    const activeKeys = user.apiKeys.filter((k) => k.isActive);
    for (const key of activeKeys) {
      await prisma.apiKey.update({
        where: { id: key.id },
        data: {
          rules: {
            connect: { id: newRule.id },
          },
        },
      });
    }

    console.log(`Successfully created 'Legacy Shield' for ${user.email} and linked to ${activeKeys.length} API keys.`);
  }

  console.log("Migration complete.");
}

migrate()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
