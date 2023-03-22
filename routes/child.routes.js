const express = require("express");
const router = express.Router();

const Parent = require("../models/Parent.model");
const Child = require("../models/Child.model");
const Feeds = require("../models/Feeds.model");
const Change = require("../models/Change.model");
const Sleep = require("../models/Sleep.model");

router.get("/all", async (req, res, next) => {
  const { email } = req.payload;

  try {
    const loggedParent = await Parent.findOne({ email }).populate("children");

    res.status(200).json(loggedParent.children);
  } catch (error) {
    next(error);
  }
});

router.get("/:childId", async (req, res, next) => {
  const { childId } = req.params;

  try {
    const currentChild = await Child.findById(childId);

    res.status(200).json(currentChild);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
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
    });

    newChild.parents.push(loggedParent._id);
    await newChild.save();

    loggedParent.children.push(newChild._id);
    await loggedParent.save();

    res.status(201).json(newChild);
  } catch (error) {
    next(error);
  }
});

router.patch("/:childId", async (req, res, next) => {
  const { childId } = req.params;

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

  try {
    const childToUpdate = await Child.findByIdAndUpdate(
      childId,
      {
        name,
        dateOfBirth,
        gender,
        weightAtBirth,
        sizeAtBirth,
      },
      { new: true }
    );

    res.status(200).json(childToUpdate);
  } catch (error) {
    next(error);
  }
});

router.delete("/:childId", async (req, res, next) => {
  const { childId } = req.params;
  const { email } = req.payload;

  try {
    await Parent.findOneAndUpdate(
      { email },
      { $pull: { children: childId } },
      { new: true }
    );

    const childToDelete = await Child.findById(childId);

    childToDelete.feeds.forEach(
      async (feedId) => await Feeds.findByIdAndRemove(feedId)
    );
    childToDelete.change.forEach(
      async (changeId) => await Change.findByIdAndRemove(changeId)
    );
    childToDelete.sleep.forEach(
      async (sleepId) => await Sleep.findByIdAndRemove(sleepId)
    );

    await Child.findByIdAndRemove(childId);

    res.status(200).json({ message: "Child removed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
