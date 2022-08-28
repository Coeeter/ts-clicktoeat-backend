import express, { Express } from "express";
import config from "./config/config";
import restaurantRouter from "./routes/restaurant-routes";
const app: Express = express();

app.use(express.json());

app.use("/api/restaurants", restaurantRouter);

app.listen(config.server.port, () => {
  console.log(`Server is running on port ${config.server.port}`);
});
