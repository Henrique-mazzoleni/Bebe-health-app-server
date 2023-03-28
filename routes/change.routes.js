const express = require("express");
const router = express.Router();

const { isChildOfLoggedParent } = require('../middleware/isChildOfLoggedParent.middleware')

const Child = require("../models/Child.model");
const Change = require("../models/Change.model");

router.get("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;
  // through the id provided in the url paramater the route retrieves the document in the database and returns it to the client
  try {
    const child = await Child.findById(childId).populate("change");

    res.status(200).json(child.change);
  } catch (error) {
    next(error);
  }
});

router.post("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;

  const newChange = { ...req.body };

  // checks if all required fields were provided
  if (!newChange.dateAndTime || !newChange.kind || !newChange.consistency) {
    res.status(400).json({ message: "All fields must be provided" });
    return;
  }

  try {
    // creates new change document
    const change = await Change.create(newChange);

    // links new object to child
    await Child.findByIdAndUpdate(childId, { $push: { change: change._id } });

    // returns the new document
    res.status(200).json(change);
  } catch (error) {
    next(error);
  }
});

router.get("/single/:changeId", async (req, res, next) => {
  const { changeId } = req.params;

  // finds document from provided Id and returns it
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

  // updates document and returns the updated version
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

router.delete("/:childId/:changeId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId, changeId } = req.params;

  try {
    // removes the document from the database
    await Change.findByIdAndRemove(changeId);

    // removes the link from related document
    await Child.findByIdAndUpdate(childId, { $pull: { change: changeId } });

    res.status(200).json({ message: "change removed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
