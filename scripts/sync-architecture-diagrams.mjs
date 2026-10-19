#!/usr/bin/env node

/**
 * sync-architecture-diagrams.mjs
 * 
 * Dependency-free Node.js script to synchronize canonical Mermaid diagram files (.mmd)
 * into marked Markdown documentation files in CA Career OS.
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
// Exactly 18 canonical architecture diagrams defined across the system
const DIAGRAM_MAP = {
  'system-context': 'system-context.mmd',
  'system-architecture': 'system-architecture.mmd',
  'backend-component-architecture': 'backend-component-architecture.mmd',
  'domain-module-dependencies': 'domain-module-dependencies.mmd',
  'ai-agent-system': 'ai-agent-system.mmd',
  'agent-execution-flow': 'agent-execution-flow.mmd',
  'human-approval-sequence': 'human-approval-sequence.mmd',
  'user-journey': 'user-journey.mmd',
  'job-ingestion-pipeline': 'job-ingestion-pipeline.mmd',
  'job-application-workflow': 'job-application-workflow.mmd',
  'data-architecture': 'data-architecture.mmd',
  'security-boundaries': 'security-boundaries.mmd',
  'background-processing': 'background-processing.mmd',
  'independent-practice-workflow': 'independent-practice-workflow.mmd',
  'deployment-architecture': 'deployment-architecture.mmd',
  'identity-and-access': 'identity-and-access.mmd',
  'billing-lifecycle': 'billing-lifecycle.mmd',
  'observability-architecture': 'observability-architecture.mmd',
};

// Target markdown files containing embedded diagram markers
const TARGET_FILES = [
  path.join(REPO_ROOT, 'README.md'),
  path.join(ARCH_DIR, 'README.md'),
];

console.log('='.repeat(70));
console.log(`[sync-diagrams] Mode: ${isCheckOnly ? 'CHECK ONLY' : 'SYNCHRONIZE'}`);
console.log(`[sync-diagrams] Architecture directory: ${ARCH_DIR}`);
console.log(`[sync-diagrams] Registered diagrams in catalog: ${Object.keys(DIAGRAM_MAP).length}`);
console.log('='.repeat(70));

// 1. Verify that all source .mmd files exist
const loadedDiagrams = {};
let missingSourceCount = 0;
for (const [id, filename] of Object.entries(DIAGRAM_MAP)) {
  const filePath = path.join(ARCH_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ Canonical diagram file missing: ${filename} at ${filePath}`);
    missingSourceCount++;
  } else {
    loadedDiagrams[id] = fs.readFileSync(filePath, 'utf8').trim();
  }
}

if (missingSourceCount > 0) {
  console.error(`\n[sync-diagrams] ABORT: ${missingSourceCount} canonical diagram files are missing.`);
  process.exit(1);
}

let driftDetected = false;
let totalMarkersSynchronized = 0;

// 2. Process each target markdown file
for (const targetPath of TARGET_FILES) {
  if (!fs.existsSync(targetPath)) {
    console.warn(`[sync-diagrams] Skipping missing target: ${targetPath}`);
    continue;
  }

  const relTarget = path.relative(REPO_ROOT, targetPath);
  const originalContent = fs.readFileSync(targetPath, 'utf8');
  let updatedContent = originalContent;
  let matchesInFile = 0;

  for (const [id, mmdSource] of Object.entries(loadedDiagrams)) {
    const startTag = `<!-- DIAGRAM:${id}:START -->`;
    const endTag = `<!-- DIAGRAM:${id}:END -->`;

    const regex = new RegExp(`${escapeRegExp(startTag)}[\\s\\S]*?${escapeRegExp(endTag)}`, 'g');

    if (regex.test(originalContent)) {
      matchesInFile++;
      totalMarkersSynchronized++;
      const replacementBlock = `${startTag}\n\`\`\`mermaid\n${mmdSource}\n\`\`\`\n${endTag}`;
      updatedContent = updatedContent.replace(regex, replacementBlock);
    }
  }

  if (matchesInFile > 0) {
    if (updatedContent !== originalContent) {
      driftDetected = true;
      if (isCheckOnly) {
        console.warn(`  ⚠️  DRIFT: ${relTarget} (${matchesInFile} markers need update).`);
      } else {
        fs.writeFileSync(targetPath, updatedContent, 'utf8');
        console.log(`  ✅ UPDATED: ${relTarget} (${matchesInFile} markers synchronized).`);
      }
    } else {
      console.log(`  ✅ UP-TO-DATE: ${relTarget} (${matchesInFile} markers checked and verified).`);
    }
  } else {
    console.log(`  ℹ️  NO MARKERS FOUND: ${relTarget}`);
  }
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

console.log('='.repeat(70));
if (isCheckOnly && driftDetected) {
  console.error('[sync-diagrams] FAILED: Out-of-sync diagrams detected. Run `node scripts/sync-architecture-diagrams.mjs` to synchronize.');
  process.exit(1);
} else {
  console.log(`[sync-diagrams] SUCCESS: Processed ${totalMarkersSynchronized} markers across documentation files.`);
  process.exit(0);
}
