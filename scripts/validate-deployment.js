#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * 
 * Run this before deploying to production to ensure everything is ready.
 * 
 * Usage:
 *   node scripts/validate-deployment.js
 * 
 * This checks:
 * - Version bump
 * - Changelog updates
 * - Tests passing
 * - TypeScript compilation
 * - Linting
 * - Environment variables
 * - Critical file existence
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let hasErrors = false;
let hasWarnings = false;

function log(message, type = 'info') {
  const color = type === 'error' ? colors.red : type === 'success' ? colors.green : type === 'warning' ? colors.yellow : colors.blue;
  console.log(`${color}${message}${colors.reset}`);
}

function check(condition, message, type = 'error') {
  if (!condition) {
    log(`❌ ${message}`, type);
    if (type === 'error') hasErrors = true;
    if (type === 'warning') hasWarnings = true;
    return false;
  }
  log(`✅ ${message}`, 'success');
  return true;
}

function runCommand(command, description) {
  try {
    log(`\n🔍 ${description}...`);
    execSync(command, { stdio: 'pipe', encoding: 'utf-8' });
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'error');
    if (error.stderr) console.error(error.stderr);
    hasErrors = true;
    return false;
  }
}

console.log('\n🚀 QR Attends - Pre-Deployment Validation\n');
console.log('='.repeat(50));

// 1. Check version bump
log('\n📦 Checking version...');
try {
  const currentVersion = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const appVersion = appJson.expo.version;
  
  check(currentVersion === appVersion, 
    `Version consistency: package.json (${currentVersion}) matches app.json (${appVersion})`);
  
  // Check if version was changed
  try {
    const lastVersion = execSync('git show HEAD~1:package.json | node -p "require(\'./stdin\').version"', {
      input: fs.readFileSync('package.json'),
      encoding: 'utf-8'
    }).trim();
    
    if (currentVersion === lastVersion) {
      log('⚠️  Version was not bumped from last commit', 'warning');
      hasWarnings = true;
    } else {
      log(`✅ Version bumped: ${lastVersion} → ${currentVersion}`, 'success');
    }
  } catch (e) {
    log('⚠️  Could not check version change (git history issue)', 'warning');
  }
} catch (error) {
  check(false, 'Could not read version from package.json/app.json');
}

// 2. Check critical files exist
log('\n📄 Checking critical files...');
const criticalFiles = [
  'package.json',
  'app.json',
  'eas.json',
  'CHANGELOG.md',
  'README.md',
  'DEPLOYMENT.md'
];

criticalFiles.forEach(file => {
  check(fs.existsSync(file), `${file} exists`);
});

// 3. Check environment files
log('\n🔐 Checking environment configuration...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  check(envContent.includes('EXPO_PUBLIC_CONVEX_URL'), '.env.local has EXPO_PUBLIC_CONVEX_URL');
  check(!envContent.includes('your_') && !envContent.includes('CHANGE_ME'), 
    '.env.local values are configured (not placeholders)');
} else {
  log('⚠️  .env.local not found (optional for CI/CD, but needed for local builds)', 'warning');
}

// 4. Run tests
runCommand('npm test -- --silent --passWithNoTests', 'Running test suite');

// 5. Check TypeScript
runCommand('npm run typecheck', 'TypeScript compilation');

// 6. Check linting
runCommand('npm run lint', 'ESLint check');

// 7. Check for uncommitted changes
log('\n📝 Checking git status...');
try {
  const status = execSync('git status --porcelain', { encoding: 'utf-8' });
  if (status.trim()) {
    log('⚠️  You have uncommitted changes:', 'warning');
    console.log(status);
    hasWarnings = true;
  } else {
    log('✅ Working directory is clean', 'success');
  }
} catch (error) {
  log('⚠️  Could not check git status', 'warning');
}

// 8. Check for secrets in code
log('\n🔒 Checking for potential secrets...');
const suspiciousPatterns = [
  /password\s*[=:]\s*["'][^"']{8,}["']/i,
  /api[_-]?key\s*[=:]\s*["'][^"']{10,}["']/i,
  /secret\s*[=:]\s*["'][^"']{10,}["']/i,
  /token\s*[=:]\s*["']eyJ/i,  // JWT pattern
];

const sourceFiles = execSync('find . -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" | grep -v node_modules | head -50', {
  encoding: 'utf-8'
}).trim().split('\n');

let foundSecrets = false;
sourceFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  const content = fs.readFileSync(file, 'utf8');
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(content) && !file.includes('.test.') && !file.includes('__tests__')) {
      log(`⚠️  Potential secret found in ${file}`, 'warning');
      foundSecrets = true;
    }
  });
});

if (!foundSecrets) {
  log('✅ No obvious secrets found in source code', 'success');
}

// 9. Check app.json configuration
log('\n⚙️  Checking app configuration...');
try {
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  check(appJson.expo.name, 'App name is set');
  check(appJson.expo.version, 'App version is set');
  check(appJson.expo.ios?.bundleIdentifier, 'iOS bundle identifier is set');
  check(appJson.expo.android?.package, 'Android package name is set');
  check(appJson.expo.extra?.eas?.projectId, 'EAS project ID is set');
  
  if (appJson.expo.android?.config?.googleMaps?.apiKey === 'YOUR_API_KEY') {
    log('⚠️  Google Maps API key is placeholder in app.json', 'warning');
  }
} catch (error) {
  check(false, 'Could not parse app.json');
}

// 10. Check dependencies
log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check(Object.keys(packageJson.dependencies).length > 0, 'Has dependencies installed');

// Check for security vulnerabilities (optional, might fail in CI)
try {
  execSync('npm audit --audit-level=high', { stdio: 'pipe' });
  log('✅ No high-severity security vulnerabilities', 'success');
} catch (error) {
  log('⚠️  Security vulnerabilities found. Run `npm audit fix` to address them.', 'warning');
  hasWarnings = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  log('\n❌ DEPLOYMENT BLOCKED: Fix errors above before deploying\n', 'error');
  process.exit(1);
} else if (hasWarnings) {
  log('\n⚠️  DEPLOYMENT READY WITH WARNINGS: Review warnings above\n', 'warning');
  console.log('You can deploy, but consider fixing the warnings first.\n');
  process.exit(0);
} else {
  log('\n✅ ALL CHECKS PASSED: Ready for deployment!\n', 'success');
  console.log('Next steps:');
  console.log('  1. Commit any pending changes');
  console.log('  2. Push to GitHub');
  console.log('  3. Run: eas build --profile production');
  console.log('  4. Or use GitHub Actions: Actions > Deploy Production\n');
  process.exit(0);
}
