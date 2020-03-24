const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const router = require("./routes/routes");
const app = express();

const port = 3002;
const { tokenKey } = require("./key");

// middlewares
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use("/", router);

const server = app.listen(port, error => {
  if (error) return console.log(`Error: ${error}`);

  console.log(`Server listening on port ${server.address().port}`);
});
