import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

//S3Client - connects to S3
//PutObjectCommand - the command we use to upload a file to S3

@Injectable()
export class UsersImageService {
  constructor() {}

  //create a new instance of the s3client listing required info
  private s3 = new S3Client({
    region: process.env.AWS_REGION!,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
  });
  //express.multer.file - type of uploaded file after it's proccessed by the middleware
  async uploadImage(userId: string, file: Express.Multer.File): Promise<{imageUrl:string}> {
    const key = `${userId}-image.png`;

    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
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

    return {imageUrl: signedUrl};
  };

  async getImage(userId: string): Promise<{imageUrl: string | null}> {
    const key = `${userId}-image.png`;
    try {
      await this.s3.send(new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      }));
    } catch (error) {
      return {imageUrl: null};
    }
    
    const signedUrl = await getSignedUrl(
      this.s3,
      new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
      }),
      {expiresIn: 3600, unhoistableHeaders: new Set(['x-amz-checksum-mode'])}
    )
    return {imageUrl: signedUrl};
  };

}