const express = require("express");
const router = express.Router();

const Parent = require("../models/Parent.model");

router.get("/", async (req, res, next) => {
  const { email } = req.payload;

  try {
    const loggedUser = await Parent.findOne({ email });

    res.status(200).json(loggedUser);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
