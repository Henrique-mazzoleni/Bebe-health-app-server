const express = require("express");
const router = express.Router();

const Child = require("../models/Child.model");
const Change = require("../models/Change.model");

router.get("/:childId", async (req, res, next) => {
  const { childId } = req.params;

  try {
    const child = await Child.findById(childId).populate("change");

    res.status(200).json(child.change);
  } catch (error) {
    next(error);
  }
});

router.post("/:childId", async (req, res, next) => {
  const { childId } = req.params;

  const newChange = { ...req.body };

  if (!newChange.dateAndTime || !newChange.kind || !newChange.consistency) {
    res.status(400).json({ message: "All fields must be provided" });
    return;
  }

  try {
    const change = await Change.create(newChange);

    await Child.findByIdAndUpdate(childId, { $push: { change: change._id } });

    res.status(200).json(change);
  } catch (error) {
    next(error);
  }
});

router.get("/single/:changeId", async (req, res, next) => {
  const { changeId } = req.params;

  try {
    const change = await Change.findById(changeId);

    res.status(200).json(change);
  } catch (error) {
    next(error);
  }
});

router.patch("/single/:changeId", async (req, res, next) => {
  const { changeId } = req.params;
  const changeUpdate = { ...req.body };

  try {
    const updatedChange = await Change.findByIdAndUpdate(
      changeId,
      changeUpdate,
      {
        new: true,
      }
    );

    res.status(200).json(updatedChange);
  } catch (error) {
    next(error);
  }
});

router.delete("/:childId/:changeId", async (req, res, next) => {
  const { childId, changeId } = req.params;

  try {
    await Change.findByIdAndRemove(changeId);

    await Child.findByIdAndUpdate(childId, { $pull: { change: changeId } });

    res.status(200).json({ message: "change removed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
