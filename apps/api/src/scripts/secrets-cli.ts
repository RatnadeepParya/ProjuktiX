import { execSync } from 'child_process';
import * as readline from 'readline';

/**
 * ProjuktiX CLI Secrets Manager
 * Strictly manages secrets via CLI into GitHub Secrets, Render, and session variables.
 * Enforces ZERO persistent secret files on disk.
 */

function runCommand(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err: any) {
    return '';
  }
}

function hasCommand(cmd: string): boolean {
  return runCommand(`which ${cmd}`).length > 0;
}

export async function main() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║               ProjuktiX Secrets CLI Manager                      ║');
  console.log('║   Direct CLI Injection into GitHub, Render & Terminal Sessions   ║');
  console.log('║          [Strict Zero Persistent File Policy Active]             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  // Detect CLI environments
  const hasGh = hasCommand('gh');
  const hasGcloud = hasCommand('gcloud');
  const hasFirebase = hasCommand('firebase');
  const hasRender = hasCommand('render');

  console.log('🔍 Detected CLI Environment:');
  console.log(`  • GitHub CLI (gh):       ${hasGh ? '✅ Available' : '❌ Not in PATH'}`);
  console.log(`  • Google Cloud (gcloud): ${hasGcloud ? '✅ Available' : '❌ Not in PATH'}`);
  console.log(`  • Firebase CLI:          ${hasFirebase ? '✅ Available' : '❌ Not in PATH'}`);
  console.log(`  • Render CLI:            ${hasRender ? '✅ Available' : '❌ Not in PATH'}\n`);

  // Try fetching GCP project if available
  let detectedGcpProject = '';
  if (hasGcloud) {
    detectedGcpProject = runCommand('gcloud config get-value project 2>/dev/null');
    if (detectedGcpProject) {
      console.log(`🌐 Detected Active Google Cloud Project: ${detectedGcpProject}`);
    }
  }

  const args = process.argv.slice(2);
  const mode = args[0] || 'interactive';

  if (mode === '--audit' || mode === 'audit') {
    runAudit();
    return;
  }

  if (mode === '--help' || mode === '-h') {
    printHelp();
    return;
  }

  printInstructions(hasGh, hasGcloud, hasRender, detectedGcpProject);
}

function runAudit() {
  console.log('🛡️  Running Zero-Secret File Audit...');
  let violations = 0;

  try {
    const envFiles = runCommand('find . -name "*.env" -o -name ".env.*" -o -name "*.envrc" | grep -v "node_modules"');
    if (envFiles) {
      console.error('❌ Prohibited environment file found:\n' + envFiles);
      violations++;
    }

    const credFiles = runCommand('find . -name "*service-account*.json" -o -name "*credentials*.json" -o -name "firebase-adminsdk*.json" | grep -v "node_modules"');
    if (credFiles) {
      console.error('❌ Prohibited credential JSON file found:\n' + credFiles);
      violations++;
    }

    const keyFiles = runCommand('find . -name "*.pem" -o -name "*.key" -o -name "*.p12" | grep -v "node_modules"');
    if (keyFiles) {
      console.error('❌ Prohibited private key file found:\n' + keyFiles);
      violations++;
    }
  } catch (e) {
    // find returned non-zero (clean)
  }

  if (violations === 0) {
    console.log('✅ Audit Passed: Zero persistent secrets detected. Repository is 100% compliant.');
  } else {
    process.exit(1);
  }
}

function printHelp() {
  console.log(`Usage: pnpm run secrets:cli [option]

Options:
  interactive (default)   Display step-by-step CLI commands to fetch and save secrets
  --audit                 Verify that no secret files or .env files exist in workspace
  --help                  Show this help reference
`);
}

function printInstructions(hasGh: boolean, hasGcloud: boolean, hasRender: boolean, gcpProject: string) {
  console.log('════════════════════════════════════════════════════════════════════');
  console.log(' 1. SAVE SECRETS TO GITHUB VIA CLI (For Render CI/CD Deployment)');
  console.log('════════════════════════════════════════════════════════════════════\n');

  console.log('Run the following commands in your terminal to save secrets directly to GitHub:');
  console.log('```bash');
  if (hasGh) {
    console.log('# Save Render Deploy Hooks directly into GitHub Secrets:');
    console.log('gh secret set RENDER_FRONTEND_DEPLOY_HOOK --repo RatnadeepParya/ProjuktiX');
    console.log('gh secret set RENDER_API_DEPLOY_HOOK --repo RatnadeepParya/ProjuktiX');
    console.log('gh secret set FIREBASE_PROJECT_ID --body "' + (gcpProject || 'your-firebase-project-id') + '" --repo RatnadeepParya/ProjuktiX');
  } else {
    console.log('# If GitHub CLI is installed via brew (brew install gh):');
    console.log('gh secret set RENDER_FRONTEND_DEPLOY_HOOK --repo RatnadeepParya/ProjuktiX');
    console.log('gh secret set RENDER_API_DEPLOY_HOOK --repo RatnadeepParya/ProjuktiX');
    console.log('\n# Alternatively, add them via GitHub Web at:');
    console.log('https://github.com/RatnadeepParya/ProjuktiX/settings/secrets/actions');
  }
  console.log('```\n');

  console.log('════════════════════════════════════════════════════════════════════');
  console.log(' 2. INJECT SECRETS INTO RENDER VIA CLI / DASHBOARD');
  console.log('════════════════════════════════════════════════════════════════════\n');
  console.log('On Render, secrets are injected as Protected Environment Variables (zero-file on disk):');
  console.log('  • FIREBASE_PROJECT_ID:   ' + (gcpProject || '<your-project-id>'));
  console.log('  • FIREBASE_CLIENT_EMAIL: <service-account-email>');
  console.log('  • FIREBASE_PRIVATE_KEY:  <service-account-private-key>');
  console.log('  • CORS_ORIGIN:           https://projuktix.onrender.com (or your frontend domain)\n');

  console.log('════════════════════════════════════════════════════════════════════');
  console.log(' 3. LOCAL SHELL SESSION ENVIRONMENT VARIABLES (Zero-File)');
  console.log('════════════════════════════════════════════════════════════════════\n');
  console.log('To run the backend API locally against Firebase Cloud or Emulator without writing files:');
  console.log('```bash');
  console.log('export PORT=4000');
  console.log('export CORS_ORIGIN="http://localhost:5173"');
  console.log('export FIREBASE_PROJECT_ID="' + (gcpProject || 'your-firebase-project-id') + '"');
  console.log('# For local offline emulator:');
  console.log('export FIRESTORE_EMULATOR_HOST="127.0.0.1:8080"');
  console.log('export FIREBASE_AUTH_EMULATOR_HOST="127.0.0.1:9099"');
  console.log('```\n');
}

main().catch((err) => {
  console.error('Fatal error in secrets CLI:', err);
  process.exit(1);
});
