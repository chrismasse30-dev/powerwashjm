#!/usr/bin/env node
/**
 * Navigation Synchronization Validator
 *
 * This script validates that desktop and mobile navigation are in sync.
 * Run automatically before each build to catch navigation discrepancies early.
 *
 * Usage: node scripts/validate-navigation.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function extractServicesArray(content) {
  // Match services array declaration
  const match = content.match(/const services = \[([\s\S]*?)\];/);
  if (!match) return null;

  // Extract individual service objects
  const servicesText = match[1];
  const services = [];

  // Parse each service object
  const serviceRegex = /\{\s*name:\s*['"]([^'"]+)['"]\s*,\s*path:\s*['"]([^'"]+)['"]\s*\}/g;
  let serviceMatch;

  while ((serviceMatch = serviceRegex.exec(servicesText)) !== null) {
    services.push({
      name: serviceMatch[1],
      path: serviceMatch[2],
    });
  }

  return services;
}

function compareServices(desktopServices, mobileServices) {
  const errors = [];
  const warnings = [];

  // Check if arrays exist
  if (!desktopServices) {
    errors.push('Could not find services array in Navigation.tsx');
  }
  if (!mobileServices) {
    errors.push('Could not find services array in MobileServicesMenuPage.tsx');
  }

  if (errors.length > 0) {
    return { errors, warnings };
  }

  // Check length
  if (desktopServices.length !== mobileServices.length) {
    errors.push(
      `Service count mismatch: Desktop has ${desktopServices.length} services, Mobile has ${mobileServices.length} services`
    );
  }

  // Check each service
  desktopServices.forEach((desktopService, index) => {
    const mobileService = mobileServices[index];

    if (!mobileService) {
      errors.push(
        `Desktop service "${desktopService.name}" at position ${index + 1} is missing on mobile`
      );
      return;
    }

    if (desktopService.name !== mobileService.name) {
      errors.push(
        `Service name mismatch at position ${index + 1}: Desktop has "${desktopService.name}", Mobile has "${mobileService.name}"`
      );
    }

    if (desktopService.path !== mobileService.path) {
      errors.push(
        `Service path mismatch for "${desktopService.name}": Desktop has "${desktopService.path}", Mobile has "${mobileService.path}"`
      );
    }
  });

  // Check for extra mobile services
  if (mobileServices.length > desktopServices.length) {
    const extraServices = mobileServices.slice(desktopServices.length);
    extraServices.forEach((service) => {
      warnings.push(`Mobile has extra service: "${service.name}" (${service.path})`);
    });
  }

  return { errors, warnings };
}

function main() {
  log(colors.blue + colors.bold, '\n🔍 Validating Navigation Synchronization...\n');

  // File paths
  const projectRoot = path.join(__dirname, '..');
  const navPath = path.join(projectRoot, 'src/components/Navigation.tsx');
  const mobilePath = path.join(projectRoot, 'src/pages/MobileServicesMenuPage.tsx');

  // Check if files exist
  if (!fs.existsSync(navPath)) {
    log(colors.red, `❌ Navigation.tsx not found at ${navPath}`);
    process.exit(1);
  }

  if (!fs.existsSync(mobilePath)) {
    log(colors.red, `❌ MobileServicesMenuPage.tsx not found at ${mobilePath}`);
    process.exit(1);
  }

  // Read files
  const navContent = fs.readFileSync(navPath, 'utf8');
  const mobileContent = fs.readFileSync(mobilePath, 'utf8');

  // Extract services
  const desktopServices = extractServicesArray(navContent);
  const mobileServices = extractServicesArray(mobileContent);

  // Compare
  const { errors, warnings } = compareServices(desktopServices, mobileServices);

  // Display results
  if (errors.length === 0 && warnings.length === 0) {
    log(colors.green + colors.bold, '✅ Navigation is perfectly synchronized!\n');
    log(colors.green, `   Desktop services: ${desktopServices.length}`);
    log(colors.green, `   Mobile services: ${mobileServices.length}`);
    log(colors.green, '\n   All services match across desktop and mobile navigation.\n');
    process.exit(0);
  }

  // Display errors
  if (errors.length > 0) {
    log(colors.red + colors.bold, '\n❌ Navigation Synchronization Errors:\n');
    errors.forEach((error, index) => {
      log(colors.red, `   ${index + 1}. ${error}`);
    });
  }

  // Display warnings
  if (warnings.length > 0) {
    log(colors.yellow + colors.bold, '\n⚠️  Navigation Warnings:\n');
    warnings.forEach((warning, index) => {
      log(colors.yellow, `   ${index + 1}. ${warning}`);
    });
  }

  // Display fix instructions
  log(
    colors.blue + colors.bold,
    '\n📝 How to Fix:\n'
  );
  log(colors.blue, '   1. Open both files:');
  log(colors.blue, `      - ${navPath}`);
  log(colors.blue, `      - ${mobilePath}`);
  log(colors.blue, '\n   2. Ensure both files have identical service arrays');
  log(colors.blue, '\n   3. Consider using a shared configuration file:');
  log(colors.blue, '      See: src/config/siteNavigation.ts');
  log(
    colors.blue,
    '\n   4. See MOBILE-DESKTOP-SYNC-PROCESS.md for detailed guidance\n'
  );

  process.exit(errors.length > 0 ? 1 : 0);
}

// Run validation
main();
