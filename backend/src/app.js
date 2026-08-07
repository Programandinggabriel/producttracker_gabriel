const express = require("express");
const routes = require("./routes");

require('dotenv').config();
const app = express();

app.use(express.json());

routes.forEach((route) => {
  app.use(route.path, route.router);
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});