import config from "./config";
import MySql from "mysql";

let connection = MySql.createConnection(config.database);

connection.connect(err => {
  if (err) throw err;
  console.log("Connected to database");
});

export default connection;
