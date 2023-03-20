const express = require("express");
const router = express.Router();

const Parent = require("../models/Parent.model");
const Child = require("../models/Child.model");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.post("/child", async (req, res, next) => {
  const { name, dateOfBirth, gender, weightAtBirth, sizeAtBirth } = req.body;

  // Check if any of the fields are provided as empty strings
  if (
    name === "" ||
    dateOfBirth === "" ||
    gender === "" ||
    weightAtBirth === "" ||
    sizeAtBirth === ""
  ) {
    res.status(400).json({ message: "All fields must be provided" });
    return;
  }

  const { email } = req.payload;

  try {
    const loggedParent = await Parent.findOne({ email });

    const newChild = await Child.create({
      name,
      dateOfBirth,
      gender,
      weightAtBirth,
      sizeAtBirth,
      parents: [loggedParent],
    });

    res.status(200).json({ message: newChild });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
