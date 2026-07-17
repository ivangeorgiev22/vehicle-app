import { Injectable } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { CloudFrontClient, CreateInvalidationCommand } from "@aws-sdk/client-cloudfront";

@Injectable()
export class UsersImageService {
  constructor() {}

  private s3 = new S3Client({
    region: process.env.AWS_REGION!,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED'
  });

  private cloudfrontClient = new CloudFrontClient({});

  async uploadImage(userId: string, file: Express.Multer.File): Promise<{imageUrl:string}> {
    const key = `${userId}-image.png`;

    await this.s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    await this.cloudfrontClient.send(new CreateInvalidationCommand({
      DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
      InvalidationBatch: {
        CallerReference: `${userId}-${Date.now()}`,
        Paths: {
          Quantity: 1,
          Items: [`/${encodeURIComponent(key)}`]
        }
      }
    }));

    return {imageUrl: `${process.env.IMAGES_URL}/${key}`};
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
    
    return {imageUrl: `${process.env.IMAGES_URL}/${key}`};
  };

}