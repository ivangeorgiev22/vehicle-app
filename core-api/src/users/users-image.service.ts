import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { DynamoDBService } from "../database/dynamodb.service";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

//S3Client - connects to S3
//PutObjectCommand - the command we use to upload a file to S3

@Injectable()
export class UsersImageService {
  constructor(private dbService: DynamoDBService) {}

  //create a new instance of the s3client listing required info
  private s3 = new S3Client({
    region: process.env.AWS_REGION!,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
  });
  //express.multer.file - type of uploaded file after it's proccessed by the middleware
  async uploadImage(userId: string, file: Express.Multer.File): Promise<{image_url:string}> {
    const db = this.dbService.getDb();
    
    //create a unique filename
    const key = `users/${userId}/${Date.now()}-${file.originalname}`;

    //now we upload to S3
    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    //saving the key to the db users table
    await db.send(new UpdateCommand({
      TableName: this.dbService.getUsersTable(),
      Key: {id: userId},
      UpdateExpression: 'SET image_url = :image_url',
      ExpressionAttributeValues: {
        ':image_url': key
      }
    }));

    //we generate a temp presigned url with an expiration time
    const signedUrl = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      }),
      {expiresIn: 3600}
    )

    return {image_url: signedUrl};
  }

  async getImage(userId: string): Promise<{image_url: string | null}> {
    const db = this.dbService.getDb();
    const res = await db.send(new GetCommand({
      TableName: this.dbService.getUsersTable(),
      Key: {id: userId}
    }));

    if(!res.Item || !res.Item.image_url) return {image_url: null};
    //we generate a fresh url using the stored key for this user
    const signedUrl = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: res.Item.image_url
      }),
      {expiresIn: 3600, unhoistableHeaders: new Set(['x-amz-checksum-mode'])}
    )

    return {image_url: signedUrl};
  }

}