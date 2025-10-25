const express = require("express");
require('dotenv').config();
const app = express();
const port = process.env.PORT;
const bodyParser = require("body-parser"); // lấy dữ liệu từ body gửi lên
const cors = require("cors");
const cookieParser = require("cookie-parser");

const passport = require("./config/passport");

app.use(bodyParser.json()); // dùng để patch json lên 

app.use(cors());

app.use(cookieParser());

// Passport middleware
app.use(passport.initialize());

const route = require("./api/v1/routes/admin/index.route");
const routeClient = require("./api/v1/routes/client/index.route");

route(app);
routeClient(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});