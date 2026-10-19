import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const apiRoot = join(__dirname, "..");
type CruiseOutput = {
  summary: {
    error: number;
    violations: { rule: { name: string } }[];
  };
};

function runCruise(path: string): { status: number | null; output: CruiseOutput } {
  const command =
    "depcruise --config .dependency-cruiser.cjs --output-type json " + path;
  const result =
    process.platform === "win32"
      ? spawnSync("cmd.exe", ["/d", "/s", "/c", command], {
          cwd: apiRoot,
          encoding: "utf8",
        })
      : spawnSync("depcruise", [
          "--config",
          ".dependency-cruiser.cjs",
          "--output-type",
          "json",
          path,
        ], {
          cwd: apiRoot,
          encoding: "utf8",
        });

  if (result.error) {
    throw result.error;
  }

  return {
    status: result.status,
    output: JSON.parse(result.stdout) as CruiseOutput,
  };
}

describe("linter d'architecture (doc 04 §3)", () => {
  it("autorise le graphe actuel des modules", async () => {
    const { status, output } = runCruise("src");
    expect(status).toBe(0);
    expect(output.summary.error).toBe(0);
  });

  it("échoue si genealogy importe moderation", async () => {
    const fixtureDir = join(
      apiRoot,
      "src/modules/genealogy/__architecture__",
    );
    const fixture = join(fixtureDir, "forbidden.architecture-fixture.ts");
    mkdirSync(fixtureDir, { recursive: true });
    writeFileSync(
      fixture,
      `import { ModerationModule } from "../../moderation/moderation.module";\nexport const leak = ModerationModule;\n`,
    );

    try {
      const { output } = runCruise("src/modules/genealogy");
      expect(output.summary.error).toBeGreaterThan(0);
      const names = output.summary.violations.map((v) => v.rule.name);
      expect(names).toContain("genealogy-must-not-import-moderation");
    } finally {
      rmSync(fixtureDir, { recursive: true, force: true });
    }
  });
});
