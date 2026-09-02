const path = require('path');
const express = require("express");
const cors = require('cors');
const routes = require("./routes");
const errorHandler = require("./middleware/error");
const { connectRedis } = require("./redis/redisClient");

require('dotenv').config();

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('../swagger.json');

app.use(cors())
app.use(express.json());

//Redis
async function startRedis() {
  await connectRedis();
}
startRedis()


//Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

//Public static images
app.use('/images', express.static(path.join(__dirname, 'public')));

routes.forEach((route) => {
  app.use(route.path, route.router);
});

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});