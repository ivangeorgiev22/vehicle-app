#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { EntryStack } from '../lib/entry-stack';
import { CoreStack } from '../lib/core-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();
const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const coreStack = new CoreStack(app, 'CoreStack', {
  env,
  stackName: 'vehicle-app-core-stack'
});

new EntryStack(app, 'EntryStack', {
  env,
  stackName: 'vehicle-app-entry-stack',
  api: coreStack.api,
  coreApiUrl: coreStack.apiUrl
});
