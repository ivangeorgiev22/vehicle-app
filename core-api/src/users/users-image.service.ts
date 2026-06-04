import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { DatabaseService } from "../database/database.service";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//S3Client - connects to S3
//PutObjectCommand - the command we use to upload a file to S3

@Injectable()
export class UsersImageService {
  constructor(private dbService: DatabaseService) {}

  //create a new instance of the s3client listing required info
  private s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });
  //express.multer.file - type of uploaded file after it's proccessed by the middleware
  async uploadImage(userId: number, file: Express.Multer.File): Promise<{image_url:string}> {
    const db = this.dbService.getDB();
    
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
    await db.run(
      `UPDATE users SET image_url = ? WHERE id = ?`, key, userId
    );

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

  async getImage(userId: number): Promise<{image_url: string | null}> {
    const db = this.dbService.getDB();
    const user = await db.get(`SELECT * FROM users WHERE id = ?`, userId);

    if(!user || !user.image_url) return {image_url: null};
    //we generate a fresh url using the stored key for this user
    const signedUrl = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: user.image_url
      }),
      {expiresIn: 3600}
    )

    return {image_url: signedUrl};
  }

}