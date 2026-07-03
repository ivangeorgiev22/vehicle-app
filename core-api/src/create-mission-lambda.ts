import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event: any) => {
  const id = randomUUID();
  const mission = {
    id,
    type: event.type,
    missionStatus: 'Created',
    vehicleId: event.vehicleId
  };

  await client.send(new PutCommand({
    TableName: process.env.MISSIONS_TABLE,
    Item: mission
  }));

  return mission;
};