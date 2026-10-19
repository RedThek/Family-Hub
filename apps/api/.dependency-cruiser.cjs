/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "genealogy-must-not-import-moderation",
      comment:
        "doc 04 §3 : moderation dépend de genealogy ; jamais l'inverse.",
      severity: "error",
      from: { path: "^src/modules/genealogy" },
      to: { path: "^src/modules/moderation" },
    },
    {
      name: "history-must-not-import-moderation",
      comment:
        "doc 04 §3 : moderation dépend de history ; jamais l'inverse.",
      severity: "error",
      from: { path: "^src/modules/history" },
      to: { path: "^src/modules/moderation" },
    },
    {
      name: "identity-access-must-not-import-moderation",
      comment:
        "doc 04 §3 : moderation dépend de identity-access ; jamais l'inverse.",
      severity: "error",
      from: { path: "^src/modules/identity-access" },
      to: { path: "^src/modules/moderation" },
    },
    {
      name: "no-cross-module-infrastructure",
      comment:
        "Aucun module n'accède aux tables d'un autre : pas d'import infrastructure croisé (doc 04 §3).",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/" },
      to: {
        path: "^src/modules/([^/]+)/infrastructure",
        pathNot: "^src/modules/$1/",
      },
    },
    {
      name: "domain-independent-of-nest-and-prisma",
      comment:
        "Les règles métier (domain/) ne dépendent ni de Nest ni de Prisma (EA-08).",
      severity: "error",
      from: { path: "^src/modules/[^/]+/domain" },
      to: { path: "(^|/)node_modules/(@nestjs|@prisma/client|prisma)" },
    },
  ],
  options: {
    doNotFollow: {
      path: "(^|/)node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["require", "node", "import"],
    },
    reporterOptions: {
      text: {
        highlightFocused: true,
      },
    },
  },
};
