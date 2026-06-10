#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { VehicleAppStack } from '../lib/vehicle-app-stack';
import * as dotenv from 'dotenv';

dotenv.config();

const app = new cdk.App();

new VehicleAppStack(app, 'VehicleAppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  stackName: 'vehicle-app-stack'
});
