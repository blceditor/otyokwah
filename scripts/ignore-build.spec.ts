import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { createServer } from "node:net";
import type { AddressInfo, Socket } from "node:net";
import { tmpdir } from "node:os";
import path from "node:path";

const SCRIPT = path.resolve(__dirname, "ignore-build.sh");
const VERCEL_JSON = path.resolve(__dirname, "../vercel.json");
const PROJECT_SETTING_IGNORE_STEP = "bash scripts/ignore-build.sh";
const SKIP = 0;
const BUILD = 1;
const UNKNOWN_SHA = "0123456789abcdef0123456789abcdef01234567";

const GIT_ENV = {
  PATH: process.env.PATH ?? "",
  GIT_CONFIG_GLOBAL: "/dev/null",
  GIT_CONFIG_NOSYSTEM: "1",
  GIT_AUTHOR_NAME: "spec",
  GIT_AUTHOR_EMAIL: "spec@example.com",
  GIT_COMMITTER_NAME: "spec",
  GIT_COMMITTER_EMAIL: "spec@example.com",
};

type FileChanges = Record<string, string | null>;
type DeploymentShas = { previous?: string; current?: string };

let root: string;
let origin: string;
let base: string;

function git(cwd: string, ...args: string[]): string {
  return execFileSync("git", args, {
    cwd,
    env: GIT_ENV,
    encoding: "utf8",
  }).trim();
}

function commit(repo: string, changes: FileChanges): string {
  for (const [file, body] of Object.entries(changes)) {
    if (body === null) {
      git(repo, "rm", "-q", file);
    } else {
      mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
      writeFileSync(path.join(repo, file), body);
    }
  }
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", "change");
  return git(repo, "rev-parse", "HEAD");
}

function shallowCloneOfOrigin(): string {
  const clone = path.join(root, "clone");
  git(root, "clone", "-q", "--depth=1", `file://${origin}`, clone);
  return clone;
}

function vercelEnv(
  { previous, current }: DeploymentShas,
  extraEnv: Record<string, string>,
) {
  return {
    ...GIT_ENV,
    ...(previous !== undefined && { VERCEL_GIT_PREVIOUS_SHA: previous }),
    ...(current !== undefined && { VERCEL_GIT_COMMIT_SHA: current }),
    ...extraEnv,
  };
}

function decide(
  cwd: string,
  shas: DeploymentShas,
  extraEnv: Record<string, string> = {},
) {
  const result = spawnSync("bash", [SCRIPT], {
    cwd,
    encoding: "utf8",
    env: vercelEnv(shas, extraEnv),
  });
  return { exitCode: result.status, log: result.stdout + result.stderr };
}

function decideWithin(milliseconds: number, cwd: string, shas: DeploymentShas) {
  return new Promise<{ exitCode: number | null; log: string }>((resolve) => {
    const child = spawn("bash", [SCRIPT], {
      cwd,
      env: vercelEnv(shas, {}),
      detached: true,
    });
    let log = "";
    child.stdout.on("data", (chunk) => (log += chunk));
    child.stderr.on("data", (chunk) => (log += chunk));
    const deadline = setTimeout(
      () => process.kill(-(child.pid as number), "SIGKILL"),
      milliseconds,
    );
    child.on("close", (exitCode) => {
      clearTimeout(deadline);
      resolve({ exitCode, log });
    });
  });
}

function failingToolOnPath(tool: string, exitCode: number): string {
  const stubBin = path.join(root, `stub-bin-${exitCode}`);
  mkdirSync(stubBin);
  writeFileSync(
    path.join(stubBin, tool),
    `#!/bin/sh\necho "${tool}: simulated failure" >&2\nexit ${exitCode}\n`,
    { mode: 0o755 },
  );
  return `${stubBin}:${GIT_ENV.PATH}`;
}

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), "ignore-build-"));
  origin = path.join(root, "origin");
  mkdirSync(origin);
  git(origin, "init", "-q", "-b", "main");
  git(origin, "config", "uploadpack.allowAnySHA1InWant", "true");
  base = commit(origin, {
    "app/page.tsx": "page v1",
    "content/pages/about.mdoc": "about v1",
    "public/images/hero.jpg": "hero v1",
  });
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("REQ-OTY-IGN-1 — decision from the diff previous deployment..current commit", () => {
  it("REQ-OTY-IGN-1 — skips when every changed file is under content/", () => {
    commit(origin, { "content/pages/about.mdoc": "about v2" });
    const current = commit(origin, { "content/pages/new-page.mdoc": "new" });

    const { exitCode, log } = decide(origin, { previous: base, current });

    expect(log).toContain("skipping build");
    expect(exitCode).toBe(SKIP);
  });

  it("REQ-OTY-IGN-1 — compares against the previous deployment, not the parent commit", () => {
    commit(origin, { "app/page.tsx": "page v2" });
    const current = commit(origin, { "content/pages/about.mdoc": "about v2" });

    const { exitCode, log } = decide(origin, { previous: base, current });

    expect(log).toContain("Non-content file changed: app/page.tsx");
    expect(exitCode).toBe(BUILD);
  });

  it("REQ-OTY-IGN-1 — builds on a mixed content and code change", () => {
    const current = commit(origin, {
      "content/pages/about.mdoc": "about v2",
      "app/page.tsx": "page v2",
    });

    const { exitCode, log } = decide(origin, { previous: base, current });

    expect(log).toContain("Non-content file changed: app/page.tsx");
    expect(exitCode).toBe(BUILD);
  });

  it("REQ-OTY-IGN-1 — builds on a public/ media change", () => {
    const current = commit(origin, { "public/images/hero.jpg": "hero v2" });

    const { exitCode, log } = decide(origin, { previous: base, current });

    expect(log).toContain("Non-content file changed: public/images/hero.jpg");
    expect(exitCode).toBe(BUILD);
  });

  it.each([
    "content-archive/old.mdoc",
    "contentful.ts",
    "docs/content/guide.mdoc",
  ])(
    "REQ-OTY-IGN-1 — builds on %s, which is not under the content/ directory",
    (file) => {
      const current = commit(origin, { [file]: "new" });

      const { exitCode, log } = decide(origin, { previous: base, current });

      expect(log).toContain(`Non-content file changed: ${file}`);
      expect(exitCode).toBe(BUILD);
    },
  );

  it("REQ-OTY-IGN-1 — builds when a file is moved from code into content/", () => {
    const current = commit(origin, {
      "app/page.tsx": null,
      "content/page.tsx": "page v1",
    });

    const { exitCode, log } = decide(origin, { previous: base, current });

    expect(log).toContain("Non-content file changed: app/page.tsx");
    expect(exitCode).toBe(BUILD);
  });

  it("REQ-OTY-IGN-1 — builds on an empty diff", () => {
    const { exitCode, log } = decide(origin, { previous: base, current: base });

    expect(log).toContain("No changed files");
    expect(exitCode).toBe(BUILD);
  });
});

describe("REQ-OTY-IGN-1 — builds when the range cannot be determined", () => {
  it.each([undefined, "", "HEAD", "--output=/tmp/x"])(
    "REQ-OTY-IGN-1 — builds when the previous sha is %j",
    (previous) => {
      const current = commit(origin, {
        "content/pages/about.mdoc": "about v2",
      });

      const { exitCode, log } = decide(origin, { previous, current });

      expect(log).toContain("VERCEL_GIT_PREVIOUS_SHA");
      expect(exitCode).toBe(BUILD);
    },
  );

  it.each([undefined, "", "HEAD"])(
    "REQ-OTY-IGN-1 — builds when the current sha is %j",
    (current) => {
      commit(origin, { "content/pages/about.mdoc": "about v2" });

      const { exitCode, log } = decide(origin, { previous: base, current });

      expect(log).toContain("VERCEL_GIT_COMMIT_SHA");
      expect(exitCode).toBe(BUILD);
    },
  );

  it("REQ-OTY-IGN-1 — builds when the current sha is not in the clone", () => {
    const { exitCode, log } = decide(origin, {
      previous: base,
      current: UNKNOWN_SHA,
    });

    expect(log).toContain("Cannot diff");
    expect(exitCode).toBe(BUILD);
  });

  it("REQ-OTY-IGN-1 — builds outside a git work tree", () => {
    const { exitCode, log } = decide(root, { previous: base, current: base });

    expect(log).toContain("Not a git work tree");
    expect(exitCode).toBe(BUILD);
  });
});

describe("REQ-OTY-IGN-1 — fetch fallback when the previous sha is outside the shallow clone", () => {
  it("REQ-OTY-IGN-1 — fetches the previous sha and skips a content-only range", () => {
    commit(origin, { "content/pages/about.mdoc": "about v2" });
    const current = commit(origin, { "content/pages/about.mdoc": "about v3" });
    const clone = shallowCloneOfOrigin();

    const { exitCode, log } = decide(clone, { previous: base, current });

    expect(log).toContain("fetching");
    expect(log).toContain("skipping build");
    expect(exitCode).toBe(SKIP);
  });

  it("REQ-OTY-IGN-1 — fetches the previous sha and builds a code range", () => {
    commit(origin, { "app/page.tsx": "page v2" });
    const current = commit(origin, { "content/pages/about.mdoc": "about v2" });
    const clone = shallowCloneOfOrigin();

    const { exitCode, log } = decide(clone, { previous: base, current });

    expect(log).toContain("fetching");
    expect(log).toContain("Non-content file changed: app/page.tsx");
    expect(exitCode).toBe(BUILD);
  });

  it("REQ-OTY-IGN-1 — builds when the previous sha cannot be fetched", () => {
    commit(origin, { "content/pages/about.mdoc": "about v2" });
    const current = commit(origin, { "content/pages/about.mdoc": "about v3" });
    const clone = shallowCloneOfOrigin();
    git(clone, "remote", "set-url", "origin", `file://${root}/gone`);

    const { exitCode, log } = decide(clone, { previous: base, current });

    expect(log).toContain("could not be fetched");
    expect(exitCode).toBe(BUILD);
  });

  it("REQ-OTY-IGN-1 — builds when the previous sha does not exist on the remote", () => {
    const current = commit(origin, { "content/pages/about.mdoc": "about v2" });
    const clone = shallowCloneOfOrigin();

    const { exitCode, log } = decide(clone, { previous: UNKNOWN_SHA, current });

    expect(log).toContain("could not be fetched");
    expect(exitCode).toBe(BUILD);
  });
});

describe("REQ-OTY-IGN-1 — an error never skips the build", () => {
  it.each([2, 127])(
    "REQ-OTY-IGN-1 — builds a code range when grep fails with exit %i",
    (grepExitCode) => {
      const current = commit(origin, { "app/page.tsx": "page v2" });

      const { exitCode, log } = decide(
        origin,
        { previous: base, current },
        { PATH: failingToolOnPath("grep", grepExitCode) },
      );

      expect(log).toContain("Non-content file changed: app/page.tsx");
      expect(exitCode).toBe(BUILD);
    },
  );

  it("REQ-OTY-IGN-1 — builds when the fetch of the previous sha stalls", async () => {
    commit(origin, { "content/pages/about.mdoc": "about v2" });
    const current = commit(origin, { "content/pages/about.mdoc": "about v3" });
    const clone = shallowCloneOfOrigin();
    const heldSockets: Socket[] = [];
    const silentServer = createServer((socket) => heldSockets.push(socket));
    await new Promise<void>((resolve) =>
      silentServer.listen(0, "127.0.0.1", resolve),
    );
    const { port } = silentServer.address() as AddressInfo;
    git(
      clone,
      "remote",
      "set-url",
      "origin",
      `http://127.0.0.1:${port}/origin.git`,
    );

    const { exitCode, log } = await decideWithin(45_000, clone, {
      previous: base,
      current,
    });

    heldSockets.forEach((socket) => socket.destroy());
    silentServer.close();
    expect(log).toContain("could not be fetched");
    expect(exitCode).toBe(BUILD);
  }, 60_000);
});

describe("REQ-OTY-17-001 — every deployment builds while revalidation cannot publish CMS edits", () => {
  it("REQ-OTY-17-001 — the effective ignore step builds a content-only CMS save", () => {
    const { ignoreCommand } = JSON.parse(readFileSync(VERCEL_JSON, "utf8"));
    const effectiveIgnoreStep = ignoreCommand ?? PROJECT_SETTING_IGNORE_STEP;
    const previous = commit(origin, {
      "scripts/ignore-build.sh": readFileSync(SCRIPT, "utf8"),
    });
    const current = commit(origin, { "content/pages/about.mdoc": "about v2" });

    const result = spawnSync("bash", ["-c", effectiveIgnoreStep], {
      cwd: origin,
      encoding: "utf8",
      env: vercelEnv({ previous, current }, {}),
    });

    expect(result.status).toBe(BUILD);
  });
});

describe("REQ-OTY-IGN-2 — preserves Git metadata until the ignored-build step", () => {
  it("REQ-OTY-IGN-2 — Vercel upload does not strip the repository history", () => {
    const ignorePatterns = readFileSync(
      path.resolve(__dirname, "../.vercelignore"),
      "utf8",
    ).split(/\r?\n/).map((line) => line.trim());

    expect(ignorePatterns).not.toContain(".git");
  });
});
