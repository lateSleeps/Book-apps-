#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envFiles = [
  'apps/customer/.env.local',
  'apps/owner/.env.local',
  'packages/database/.env.local',
];

console.log('\n📱 Checking environment files...\n');

let allFound = true;
const notFound = [];

for (const file of envFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Found: ${file}`);
  } else {
    console.log(`❌ Missing: ${file}`);
    notFound.push(file);
    allFound = false;
  }
}

console.log('');

if (allFound) {
  console.log('✅ All environment files are configured!\n');
  process.exit(0);
} else {
  console.log('⚠️  Some environment files are missing.\n');
  console.log('To create them, run:\n');
  for (const file of notFound) {
    const exampleFile = file.replace('.env.local', '.env.example');
    console.log(`  cp ${exampleFile} ${file}`);
  }
  console.log('');
  process.exit(1);
}
