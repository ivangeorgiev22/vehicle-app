import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event: any) => {
  
  await client.send(new UpdateCommand({
    TableName: process.env.VEHICLES_TABLE,
    Key: {vehicleId: event.vehicle_id},
    UpdateExpression: 'SET vehicle_status = :status',
    ExpressionAttributeValues: {':status': 'Unavailable'}
  }));

  return event;
}