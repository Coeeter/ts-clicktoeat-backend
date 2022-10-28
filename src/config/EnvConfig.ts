import dotenv from 'dotenv';

dotenv.config();

[
  'DB_HOST',
  'DB_PORT',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'PORT',
  'SECRET_KEY',
  'AWS_S3_ACCESS_KEY_ID',
  'AWS_S3_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_NAME',
  'EMAIL',
  'EMAIL_PASSWORD',
  'HOST',
].forEach(name => {
  if (process.env[name]) return;
  throw new Error(`Environment variable ${name} is missing`);
});

const config = {
  database: {
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
  server: {
    port: parseInt(process.env.PORT!),
    secret: process.env.SECRET_KEY!,
    email: process.env.EMAIL!,
    emailPassword: process.env.EMAIL_PASSWORD!,
    host: process.env.HOST!,
  },
  aws: {
    accessKey: process.env.AWS_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY!,
    bucketName: process.env.AWS_S3_BUCKET_NAME!,
  },
};

export default config;
