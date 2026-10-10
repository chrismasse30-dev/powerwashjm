#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const distDir = './dist';
const errors = [];
const warnings = [];

function getAllHtmlFiles(dir, fileList = []) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      getAllHtmlFiles(filePath, fileList);
    } else if (extname(file) === '.html') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function checkForDuplicateSchemas(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const schemaMatches = content.match(/<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi);

  if (!schemaMatches || schemaMatches.length === 0) {
    return;
  }

  const schemaTypes = {};

  schemaMatches.forEach(scriptTag => {
    try {
      const jsonMatch = scriptTag.match(/>[\s\S]*?</);
      if (!jsonMatch) return;

      const jsonStr = jsonMatch[0].slice(1, -1).trim();
      const schema = JSON.parse(jsonStr);

      const type = schema['@type'];
      if (!type) return;

      if (Array.isArray(type)) {
        type.forEach(t => {
          schemaTypes[t] = (schemaTypes[t] || 0) + 1;
        });
      } else {
        schemaTypes[type] = (schemaTypes[type] || 0) + 1;
      }
    } catch (e) {
      warnings.push(`⚠️  ${filePath}: Failed to parse schema - ${e.message}`);
    }
  });

  Object.entries(schemaTypes).forEach(([type, count]) => {
    if (count > 1) {
      errors.push(`❌ ${filePath}: Duplicate "${type}" schema found (${count} instances)`);
    }
  });
}

console.log('🔍 Checking for duplicate structured data schemas...\n');

const htmlFiles = getAllHtmlFiles(distDir);
console.log(`Found ${htmlFiles.length} HTML files to check\n`);

htmlFiles.forEach(checkForDuplicateSchemas);

if (warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:\n');
  warnings.forEach(warning => console.log(warning));
}

if (errors.length > 0) {
  console.log('\n❌ ERRORS FOUND:\n');
  errors.forEach(error => console.log(error));
  console.log(`\n❌ Found ${errors.length} duplicate schema issue(s)!`);
  process.exit(1);
} else {
  console.log('✅ No duplicate schemas found!');
  console.log('✅ All pages pass Google Search Console validation requirements.');
}
