#!/usr/bin/env node

/**
 * BINARY IMAGE CHECKER - BOLT.NEW ISSUE PREVENTION
 *
 * This script prevents the Bolt.new binary file issue by:
 * 1. Checking all required images exist and are real (not dummy 20-byte files)
 * 2. Warning about any dummy files that need restoration
 * 3. Failing the build if critical images are missing/dummy
 *
 * Run this BEFORE every build to ensure images are always valid.
 */

import { existsSync, statSync, readdirSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIN_FILE_SIZE = 1024; // 1KB - anything smaller is likely a dummy file

// Critical images that MUST exist for the site to work properly
const CRITICAL_IMAGES = [
  'public/logos/logo.png',
  'public/logos/holidaylogo.png',
  'public/homepagehouse.png',
  'public/housewash.png',
  'public/housewashbeforeandafter.png',
  'public/roofcleaning.png',
  'public/drivewaywash.png',
  'public/commerical.png',
  'public/ConcreteWash.png',
  'public/Deck Restoration.png',
  'public/rihouselightswithlogo.png',
  'public/fleet/ourfleet4trucks.jpg',
  'public/fleet/servicetruck.png',
  'public/packages/tinselpackage.png',
  'public/packages/garlandpackage.PNG',
  'public/packages/gingerbreadpackage.PNG',
  'public/beforeandafter/after.png',
  'public/beforeandafter/before.png',
  'public/beforeandafter/GutterBAA.png',
  'public/beforeandafter/after-Deck.png',
  'public/beforeandafter/before-Deck.png',
];

// All directories that may contain images
const IMAGE_DIRECTORIES = [
  'public',
  'public/logos',
  'public/fleet',
  'public/packages',
  'public/beforeandafter',
  'public/Town Page Hero Images',
];

console.log('\n🔍 VERIFYING IMAGE FILES...\n');

let hasIssues = false;
const dummyFiles = [];
const missingFiles = [];

// Check critical images
for (const imagePath of CRITICAL_IMAGES) {
  const fullPath = join(__dirname, imagePath);

  if (!existsSync(fullPath)) {
    console.log(`❌ MISSING: ${imagePath}`);
    missingFiles.push(imagePath);
    hasIssues = true;
    continue;
  }

  const stats = statSync(fullPath);

  if (stats.size <= MIN_FILE_SIZE) {
    console.log(`⚠️  DUMMY FILE (${stats.size} bytes): ${imagePath}`);
    dummyFiles.push(imagePath);
    hasIssues = true;
  } else {
    console.log(`✅ Valid (${(stats.size / 1024).toFixed(1)} KB): ${imagePath}`);
  }
}

// Check all image directories for additional dummy files (warning only, not blocking)
console.log('\n📁 Scanning image directories for additional dummy files...\n');

const nonCriticalDummies = [];

function scanDirectory(dirPath) {
  try {
    const files = readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      const fullPath = join(dirPath, file.name);
      const relativePath = relative(__dirname, fullPath);

      if (file.isDirectory()) {
        scanDirectory(fullPath);
      } else if (file.isFile() && /\.(png|jpg|jpeg|gif|webp)$/i.test(file.name)) {
        const stats = statSync(fullPath);

        if (stats.size <= MIN_FILE_SIZE && !dummyFiles.includes(relativePath)) {
          console.log(`ℹ️  Non-critical dummy: ${relativePath} (${stats.size} bytes)`);
          nonCriticalDummies.push(relativePath);
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist, skip
  }
}

for (const dir of IMAGE_DIRECTORIES) {
  const fullDir = join(__dirname, dir);
  if (existsSync(fullDir)) {
    scanDirectory(fullDir);
  }
}

// Report results
console.log('\n' + '='.repeat(60));
console.log('IMAGE VERIFICATION RESULTS');
console.log('='.repeat(60) + '\n');

if (hasIssues) {
  console.log('🚨 CRITICAL ISSUE DETECTED!\n');

  if (missingFiles.length > 0) {
    console.log(`❌ Missing files: ${missingFiles.length}`);
    missingFiles.forEach(f => console.log(`   - ${f}`));
    console.log('');
  }

  if (dummyFiles.length > 0) {
    console.log(`⚠️  CRITICAL dummy files detected: ${dummyFiles.length}`);
    console.log('\nThis is the Bolt.new binary file issue!');
    console.log('Binary files have been replaced with 20-byte placeholders.\n');
    console.log('TO FIX THIS ISSUE:\n');
    console.log('1. Run: node restore-binary-images.mjs');
    console.log('   This will automatically restore all binary images\n');
    console.log('2. Then run build again: npm run build\n');
  }

  console.log('⛔ BUILD BLOCKED - Fix critical image issues before deploying!\n');
  process.exit(1);
} else {
  console.log('✅ All critical images verified successfully!');
  console.log(`   Checked ${CRITICAL_IMAGES.length} critical images`);
  console.log('   All critical images are valid\n');

  if (nonCriticalDummies.length > 0) {
    console.log(`ℹ️  Note: ${nonCriticalDummies.length} non-critical dummy files found`);
    console.log('   These are optional images and won\'t block the build.\n');
  }

  console.log('👍 Safe to proceed with build\n');
  process.exit(0);
}
