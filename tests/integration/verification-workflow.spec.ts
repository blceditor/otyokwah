// REQ-VERIFY-001, REQ-VERIFY-002, REQ-VERIFY-003: QVERIFY Workflow Tests
// TDD: These tests MUST fail initially - implementation comes after

import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const CLAUDE_MD_PATH = path.join(process.cwd(), 'CLAUDE.md');
const AGENTS_DIR = path.join(process.cwd(), '.claude', 'agents');
const TEMPLATES_DIR = path.join(process.cwd(), '.claude', 'templates');
const VERIFICATION_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'verification-checklist.md');

describe('REQ-VERIFY-001 - Verification Gate Definition', () => {
  test('QVERIFY is defined in CLAUDE.md workflow', () => {
    const claudeMd = fs.readFileSync(CLAUDE_MD_PATH, 'utf-8');

    // QVERIFY should be listed in the QShortcuts section
    expect(claudeMd).toContain('QVERIFY');
  });

  test('QVERIFY appears after QCHECK and before QGIT in workflow', () => {
    const claudeMd = fs.readFileSync(CLAUDE_MD_PATH, 'utf-8');

    // Extract workflow section
    const workflowMatch = claudeMd.match(/## 3\) TDD Flow[\s\S]*?(?=\n## \d|$)/);
    expect(workflowMatch).not.toBeNull();

    const workflowSection = workflowMatch![0];

    // QVERIFY should be mentioned in the workflow
    expect(workflowSection).toContain('QVERIFY');

    // Verify order: QCHECK comes before QVERIFY, QVERIFY comes before QGIT
    const qcheckIndex = workflowSection.indexOf('QCHECK');
    const qverifyIndex = workflowSection.indexOf('QVERIFY');
    const qgitIndex = workflowSection.indexOf('QGIT');

    expect(qcheckIndex).toBeLessThan(qverifyIndex);
    expect(qverifyIndex).toBeLessThan(qgitIndex);
  });

  test('QVERIFY blocking rule is documented', () => {
    const claudeMd = fs.readFileSync(CLAUDE_MD_PATH, 'utf-8');

    // Should document that verification is blocking
    expect(claudeMd).toMatch(/QVERIFY.*block|QVERIFY.*must.*pass|verification.*required|must.*verify/i);
  });

  test('validation-specialist agent has QVERIFY capabilities', () => {
    const agentPath = path.join(AGENTS_DIR, 'validation-specialist.md');
    expect(fs.existsSync(agentPath)).toBe(true);

    const agentContent = fs.readFileSync(agentPath, 'utf-8');

    // Should mention production validation
    expect(agentContent).toMatch(/production|smoke.?test|verify.*deploy/i);
  });
});

describe('REQ-VERIFY-002 - Verification Checklist Template', () => {
  test('verification-checklist.md template exists', () => {
    // This will FAIL until we create the template
    expect(fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
  });

  test('template has deployment status field', () => {
    // Skip if file doesn't exist yet
    if (!fs.existsSync(VERIFICATION_TEMPLATE_PATH)) {
      expect(fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
      return;
    }

    const template = fs.readFileSync(VERIFICATION_TEMPLATE_PATH, 'utf-8');
    expect(template).toMatch(/deploy.*status|deployment.*status|vercel.*status/i);
  });

  test('template has smoke test results field', () => {
    if (!fs.existsSync(VERIFICATION_TEMPLATE_PATH)) {
      expect(fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
      return;
    }

    const template = fs.readFileSync(VERIFICATION_TEMPLATE_PATH, 'utf-8');
    expect(template).toMatch(/smoke.*test|test.*results|validation.*results/i);
  });

  test('template has screenshot proof field', () => {
    if (!fs.existsSync(VERIFICATION_TEMPLATE_PATH)) {
      expect(fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
      return;
    }

    const template = fs.readFileSync(VERIFICATION_TEMPLATE_PATH, 'utf-8');
    expect(template).toMatch(/screenshot|visual.*proof|image.*evidence/i);
  });

  test('template has manual verification checklist', () => {
    if (!fs.existsSync(VERIFICATION_TEMPLATE_PATH)) {
      expect(fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
      return;
    }

    const template = fs.readFileSync(VERIFICATION_TEMPLATE_PATH, 'utf-8');
    expect(template).toMatch(/manual.*verification|human.*check|visual.*confirm/i);
  });

  test('template can be filled programmatically', () => {
    if (!fs.existsSync(VERIFICATION_TEMPLATE_PATH)) {
      expect(fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
      return;
    }

    const template = fs.readFileSync(VERIFICATION_TEMPLATE_PATH, 'utf-8');

    // Should have placeholder patterns that can be replaced
    expect(template).toMatch(/\{\{|\$\{|__[A-Z_]+__|<[A-Z_]+>/);
  });
});

describe('REQ-VERIFY-003 - Screenshot Proof Requirement', () => {
  test('checklist requires screenshot path field', () => {
    if (!fs.existsSync(VERIFICATION_TEMPLATE_PATH)) {
      expect(fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
      return;
    }

    const template = fs.readFileSync(VERIFICATION_TEMPLATE_PATH, 'utf-8');
    expect(template).toMatch(/screenshot.*path|image.*path|proof.*path/i);
  });

  test('documentation explains screenshot capture process', () => {
    if (!fs.existsSync(VERIFICATION_TEMPLATE_PATH)) {
      expect(fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
      return;
    }

    const template = fs.readFileSync(VERIFICATION_TEMPLATE_PATH, 'utf-8');

    // Should have instructions for capturing screenshots
    expect(template).toMatch(/capture|how to|instructions|steps/i);
  });

  test('screenshots directory exists or is documented', () => {
    const screenshotsDir = path.join(process.cwd(), 'verification-screenshots');
    const verificationDir = path.join(process.cwd(), '.verification');

    // Either directory exists OR template documents where to store
    const dirExists = fs.existsSync(screenshotsDir) || fs.existsSync(verificationDir);

    if (!dirExists && fs.existsSync(VERIFICATION_TEMPLATE_PATH)) {
      const template = fs.readFileSync(VERIFICATION_TEMPLATE_PATH, 'utf-8');
      expect(template).toMatch(/screenshot.*directory|where.*store|save.*to/i);
    } else {
      expect(dirExists || !fs.existsSync(VERIFICATION_TEMPLATE_PATH)).toBe(true);
    }
  });

  test('validation-specialist blocks without screenshot proof', () => {
    const agentPath = path.join(AGENTS_DIR, 'validation-specialist.md');
    const agentContent = fs.readFileSync(agentPath, 'utf-8');

    // Agent should mention screenshot requirement
    expect(agentContent).toMatch(/screenshot|visual.*proof|image.*evidence/i);
  });
});

describe('REQ-VERIFY Integration - Workflow Enforcement', () => {
  test('QVERIFY is listed in QShortcuts section', () => {
    const claudeMd = fs.readFileSync(CLAUDE_MD_PATH, 'utf-8');

    // Find QShortcuts section (use greedy match until next level-2 heading)
    const shortcutsMatch = claudeMd.match(/## 4\) QShortcuts[\s\S]*?(?=\n## [0-9]|$)/);
    expect(shortcutsMatch).not.toBeNull();

    const shortcutsSection = shortcutsMatch![0];
    // QVERIFY should be in the Core Development Workflow subsection
    expect(shortcutsSection).toContain('QVERIFY');
  });

  test('QVERIFY has description with validation-specialist agent', () => {
    const claudeMd = fs.readFileSync(CLAUDE_MD_PATH, 'utf-8');

    // QVERIFY should reference validation-specialist
    expect(claudeMd).toMatch(/QVERIFY.*validation-specialist|validation-specialist.*QVERIFY/i);
  });
});
