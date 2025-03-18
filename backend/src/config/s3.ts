import AWS from 'aws-sdk';

export const s3 = new AWS.S3({
  endpoint: process.env.MINIO_ENDPOINT || 'http://localhost:9000',
  accessKeyId: process.env.MINIO_ACCESS_KEY || 'admin',
  secretAccessKey: process.env.MINIO_SECRET_KEY || 'admin123',
  s3ForcePathStyle: true,
  region: 'us-east-1',
});
