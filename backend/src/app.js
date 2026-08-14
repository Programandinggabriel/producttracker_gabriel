const express = require("express");
const routes = require("./routes");
const errorHandler = require("./middleware/error");
const { connectRedis } = require("./redis/redisClient");

require('dotenv').config();
const app = express();

//Redis
async function startRedis() {
  await connectRedis();
}
startRedis()

app.use(express.json());

routes.forEach((route) => {
  app.use(route.path, route.router);
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});