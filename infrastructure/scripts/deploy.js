const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OUTPUTS_FILE = path.join(__dirname, '../cdk-outputs.json');
const ENV_FILE = path.join(__dirname, '../../vehiclemobile/.env');
const PROFILE = process.env.AWS_PROFILE;

if (!PROFILE) {
  console.error('AWS_PROFILE is not set in your .env file.');
  process.exit(1);
}

execSync(
  `cdk deploy --profile ${PROFILE} --outputs-file cdk-outputs.json`,
  { stdio: 'inherit', cwd: path.join(__dirname, '..') }
);

const outputs = JSON.parse(fs.readFileSync(OUTPUTS_FILE, 'utf8'));
const stackOutputs = Object.values(outputs)[0];
const apiUrl = stackOutputs?.ApiUrl;
const webSocketUrl = stackOutputs.WebSocketUrl;

if (!apiUrl) {
  console.error('Could not find ApiUrl in cdk-outputs.json.');
  process.exit(1);
}

if (!webSocketUrl) {
  console.error('Could not find WebSocketUrl in cdk-outputs.json.');
  process.exit(1);
}

let envContent = fs.readFileSync(ENV_FILE, 'utf8');
envContent = envContent.replace(/^API_URL\s*=.*/m, `API_URL=${apiUrl}`);
envContent = envContent.replace(/^WEBSOCKET_URL\s*=.*/m, `WEBSOCKET_URL=${webSocketUrl}`);
fs.writeFileSync(ENV_FILE, envContent);

console.log(`Updated API_URL in vehiclemobile/.env to: ${apiUrl}`);
console.log(`Updated WEBSOCKET_URL in vehiclemobile/.env to: ${webSocketUrl}`);
