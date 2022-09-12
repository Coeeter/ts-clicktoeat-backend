import dotenv from "dotenv";
dotenv.config();

["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME", "PORT"].forEach(
  name => {
    if (process.env[name]) return;
    throw new Error(`Environment variable ${name} is missing`);
  }
);

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
  },
};

export default config;
