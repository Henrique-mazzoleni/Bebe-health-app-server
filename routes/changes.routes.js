const express = require("express");
const router = express.Router();

const Child = require("../models/Child.model");
const Changes = require("../models/Changes.model");

const { isChildOfLoggedParent } = require('../middleware/isChildOfLoggedParent.middleware')

router.get("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;
  // through the id provided in the url paramater the route retrieves the document in the database and returns it to the client
  try {
    const child = await Child.findById(childId).populate("changes");

    if (!child) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    res.status(200).json(child.changes);
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
    const child = await Child.findById(childId);

    if (!child) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    // creates new change document
    const change = await Changes.create(newChange);

    // links new object to child
    await Child.findByIdAndUpdate(childId, { $push: { changes: change._id } });

    // returns the new document
    res.status(200).json(change);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:childId/:changeId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId, changeId } = req.params;

    // finds document from provided Id and returns it
    try {
      const child = await Child.findById(childId);

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }

      const change = await Changes.findById(changeId);

      if (!change) {
        res.status(404).json({ message: "change not found!" });
        return;
      }

      res.status(200).json(change);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:childId/:changeId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId, changeId } = req.params;
    const changeUpdate = { ...req.body };

    // updates document and returns the updated version
    try {
      const child = await Child.findById(childId);

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }

      const change = await Changes.findById(changeId);

      if (!change) {
        res.status(404).json({ message: "change not found!" });
        return;
      }

      const updatedChange = await Changes.findByIdAndUpdate(
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
  }
);

router.delete(
  "/:childId/:changeId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId, changeId } = req.params;

    try {
      const child = await Child.findById(childId);

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }

      const change = await Changes.findById(changeId);

      if (!change) {
        res.status(404).json({ message: "change not found!" });
        return;
      }

      // removes the document from the database
      await Changes.findByIdAndRemove(changeId);

      // removes the link from related document
      await Child.findByIdAndUpdate(childId, { $pull: { changes: changeId } });

      res.status(200).json({ message: "change removed successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
