const express = require("express");
const router = express.Router();
const fileUploader = require("../config/cloudinary.config");

const Parent = require("../models/Parent.model");
const Child = require("../models/Child.model");
const Feeds = require("../models/Feeds.model");
const Change = require("../models/Changes.model");
const Sleep = require("../models/Sleeps.model");

const {
  isChildOfLoggedParent,
} = require("../middleware/isChildOfLoggedParent.middleware");

router.get("/all", async (req, res, next) => {
  const { email } = req.payload;

  try {
    const loggedParent = await Parent.findOne({ email }).populate("children");

    res.status(200).json(loggedParent.children);
  } catch (error) {
    next(error);
  }
});

router.get("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;

  try {
    const child = await Child.findById(childId);

    if (!child) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    res.status(200).json(child);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/picture-upload",
  fileUploader.single("pictureURL"),
  (req, res, next) => {
    if (!req.file) {
      res.status(400).json({ message: "No Picture File Uploaded!"})
      return
    }

    res.status(200).json({ pictureURL: req.file.path })
  }
)

router.post(
  "/",
  async (req, res, next) => {
    const { name, dateOfBirth, gender, weightAtBirth, sizeAtBirth, pictureURL } = req.body;

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
        pictureURL,
      });

      newChild.parents.push(loggedParent._id);
      await newChild.save();

      loggedParent.children.push(newChild._id);
      await loggedParent.save();

      res.status(201).json(newChild);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:childId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId } = req.params;

    const { name, dateOfBirth, gender, weightAtBirth, sizeAtBirth } = req.body;
    let { pictureURL } = req.body

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
      const child = await Child.findById(childId);

      
      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }
      
      if (pictureURL === '') pictureURL = child.pictureURL
      
      const childToUpdate = await Child.findByIdAndUpdate(
        childId,
        {
          name,
          dateOfBirth,
          gender,
          weightAtBirth,
          sizeAtBirth,
          pictureURL,
        },
        { new: true }
      );

      res.status(200).json(childToUpdate);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;
  const { email } = req.payload;

  try {
    await Parent.findOneAndUpdate(
      { email },
      { $pull: { children: childId } },
      { new: true }
    );

    const childToDelete = await Child.findById(childId);

    if (!childToDelete) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    childToDelete.feeds.forEach(
      async (feedId) => await Feeds.findByIdAndRemove(feedId)
    );
    childToDelete.changes.forEach(
      async (changeId) => await Change.findByIdAndRemove(changeId)
    );
    childToDelete.sleeps.forEach(
      async (sleepId) => await Sleep.findByIdAndRemove(sleepId)
    );

    await Child.findByIdAndRemove(childId);

    res.status(200).json({ message: "Child removed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
