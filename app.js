// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// imports authentication middleware
const { isAuthenticated } = require("./middleware/jwt.middleware");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

// 👇 Start handling routes here
const authRoutes = require("./routes/auth.routes");
app.use("/auth", authRoutes);

const parentRoutes = require("./routes/parent.routes");
app.use("/api/parent", isAuthenticated, parentRoutes);

const childRoutes = require("./routes/child.routes");
app.use("/api/child", isAuthenticated, childRoutes);

const feedRoutes = require("./routes/feeds.routes");
app.use("/api/feeds", isAuthenticated, feedRoutes);

const sleepRoutes = require("./routes/sleep.routes");
app.use("/api/sleep", isAuthenticated, sleepRoutes);

const changeRoutes = require("./routes/change.routes");
app.use("/api/change", isAuthenticated, changeRoutes);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
