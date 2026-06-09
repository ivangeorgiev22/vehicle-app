import { Injectable, OnModuleInit } from "@nestjs/common";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

@Injectable()
export class DynamoDBService implements OnModuleInit {
  private db!: DynamoDBDocumentClient;

  onModuleInit() {
    //db connection
    const dynamoClient = new DynamoDBClient({
      region: process.env.AWS_REGION || 'eu-central-1'
    });
    //DocumentClient automatically converts JS types to dynamoDB types and back
    this.db = DynamoDBDocumentClient.from(dynamoClient);
  }

  getDb(): DynamoDBDocumentClient {
    return this.db;
  }
  //table names helpers - saves hardcoding them everywhere
  getUsersTable(): string {
    return process.env.USERS_TABLE || 'users';
  }

  getMissionsTable(): string {
    return process.env.MISSIONS_TABLE || 'missions';
  }

  getJobsTable(): string {
    return process.env.JOBS_TABLE || 'jobs';
  }
}