import { S3 } from 'aws-sdk';

import config from './EnvConfig';

const s3 = new S3({
  accessKeyId: config.aws.accessKey,
  secretAccessKey: config.aws.secretAccessKey,
});

export const uploadImageToS3 = async (key: string, blob: Buffer) => {
  const uploadConfig = {
    Bucket: config.aws.bucketName,
    Key: key,
    Body: blob,
  };
  try {
    const uploadedImage = await s3
      .upload({
        ...uploadConfig,
        ContentType: 'image/jpeg',
      })
      .promise();
    return { uploadedUrl: uploadedImage.Location };
  } catch (e) {
    console.log(e);
    return { error: e };
  }
};

export const deleteImageFromS3 = async (key: string) => {
  const deleteConfig = {
    Bucket: config.aws.bucketName,
    Key: key,
  };
  try {
    await s3.deleteObject(deleteConfig).promise();
  } catch (e) {
    return { error: e };
  }
};
