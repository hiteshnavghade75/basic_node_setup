const express = require("express");
const authRouter = require("./Auth/Routes/authRoutes");
const bodyParser = require("body-parser");

require('dotenv').config();

const app = express();
const port = process.env.PORT ;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use("/v1/user", authRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    status: "error",
    message: "Something went wrong!",
    error: err.message,
  });
});

app.use((req, res, next) => {
  res.status(404).send({
    status: "error",
    message: "Resource not found",
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
