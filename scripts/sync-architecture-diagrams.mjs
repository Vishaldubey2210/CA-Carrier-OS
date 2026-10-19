#!/usr/bin/env node

/**
 * sync-architecture-diagrams.mjs
 * 
 * Dependency-free Node.js script to synchronize canonical Mermaid diagram files (.mmd)
 * into marked Markdown documentation files.
 * 
 * Usage:
 *   node scripts/sync-architecture-diagrams.mjs [--check]
 * 
 * Flags:
 *   --check : Verifies if embedded diagrams are in sync without writing changes (exit code 1 if drift detected).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const ARCH_DIR = path.join(REPO_ROOT, 'docs', 'architecture');

const isCheckOnly = process.argv.includes('--check');

// Map of diagram identifiers to their source .mmd files in docs/architecture/
const DIAGRAM_MAP = {
  'system-context': 'system-context.mmd',
  'system-architecture': 'system-architecture.mmd',
  'agent-execution-flow': 'agent-execution-flow.mmd',
  'user-journey': 'user-journey.mmd',
  'job-application-workflow': 'job-application-workflow.mmd',
  'data-architecture': 'data-architecture.mmd',
  'security-boundaries': 'security-boundaries.mmd',
};

// Target markdown files that may contain embedded diagram blocks
const TARGET_FILES = [
  path.join(REPO_ROOT, 'README.md'),
  path.join(ARCH_DIR, 'README.md'),
];

console.log(`[sync-diagrams] Mode: ${isCheckOnly ? 'CHECK ONLY' : 'SYNCHRONIZE'}`);
console.log(`[sync-diagrams] Architecture directory: ${ARCH_DIR}`);

// 1. Verify that all source .mmd files exist
const loadedDiagrams = {};
for (const [id, filename] of Object.entries(DIAGRAM_MAP)) {
  const filePath = path.join(ARCH_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`[sync-diagrams] ERROR: Canonical diagram file missing: ${filePath}`);
    process.exit(1);
  }
  loadedDiagrams[id] = fs.readFileSync(filePath, 'utf8').trim();
}

let driftDetected = false;

// 2. Process each target markdown file
for (const targetPath of TARGET_FILES) {
  if (!fs.existsSync(targetPath)) {
    console.warn(`[sync-diagrams] Skipping missing target: ${targetPath}`);
    continue;
  }

  const originalContent = fs.readFileSync(targetPath, 'utf8');
  let updatedContent = originalContent;
  let matchesFound = 0;

  for (const [id, mmdSource] of Object.entries(loadedDiagrams)) {
    const startTag = `<!-- DIAGRAM:${id}:START -->`;
    const endTag = `<!-- DIAGRAM:${id}:END -->`;

    const regex = new RegExp(`${escapeRegExp(startTag)}[\\s\\S]*?${escapeRegExp(endTag)}`, 'g');

    if (regex.test(originalContent)) {
      matchesFound++;
      const replacementBlock = `${startTag}\n\`\`\`mermaid\n${mmdSource}\n\`\`\`\n${endTag}`;
      updatedContent = updatedContent.replace(regex, replacementBlock);
    }
  }

  if (matchesFound > 0) {
    if (updatedContent !== originalContent) {
      driftDetected = true;
      if (isCheckOnly) {
        console.warn(`[sync-diagrams] DRIFT: ${path.relative(REPO_ROOT, targetPath)} has out-of-sync diagrams.`);
      } else {
        fs.writeFileSync(targetPath, updatedContent, 'utf8');
        console.log(`[sync-diagrams] UPDATED: ${path.relative(REPO_ROOT, targetPath)} (${matchesFound} markers synchronized).`);
      }
    } else {
      console.log(`[sync-diagrams] UP-TO-DATE: ${path.relative(REPO_ROOT, targetPath)} (${matchesFound} markers checked).`);
    }
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

if (isCheckOnly && driftDetected) {
  console.error('\n[sync-diagrams] FAILED: Out-of-sync diagrams detected. Run `node scripts/sync-architecture-diagrams.mjs` to synchronize.');
  process.exit(1);
} else {
  console.log('\n[sync-diagrams] Complete: All verified diagrams in sync.');
}
