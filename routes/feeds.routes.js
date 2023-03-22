const express = require("express");
const router = express.Router();

const Child = require("../models/Child.model");
const Feeds = require("../models/Feeds.model");

router.get("/:childId", async (req, res, next) => {
  const { childId } = req.params;

  try {
    const child = await Child.findById(childId).populate("feeds");

    res.status(200).json(child.feeds);
  } catch (error) {
    next(error);
  }
});

router.post("/:childId", async (req, res, next) => {
  const { childId } = req.params;

  const createObject = { ...req.body };

  if (!createObject.dateAndTime || !createObject.kind) {
    res.status(400).json({ message: "date and kind fields must be provided" });
    return;
  }

  try {
    const feed = await Feeds.create(createObject);

    await Child.findByIdAndUpdate(childId, { $push: { feeds: feed._id } });

    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
});

router.get("/single/:feedId", async (req, res, next) => {
  const { feedId } = req.params;

  try {
    const feed = await Feeds.findById(feedId);

    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
});

router.patch("/single/:feedId", async (req, res, next) => {
  const { feedId } = req.params;
  const feedUpdate = { ...req.body };

  try {
    await Feeds.findByIdAndUpdate(feedId, feedUpdate, {
      new: true,
    });

    if (feedUpdate.kind === "breast")
      await Feeds.findByIdAndUpdate(feedId, { $unset: { bottleVolume: "" } });
    else
      await Feeds.findByIdAndUpdate(feedId, {
        $unset: { rightBreastDuration: "", leftBreastDuration: "" },
      });
    const updatedFeed = await Feeds.findById(feedId);
    res.status(200).json(updatedFeed);
  } catch (error) {
    next(error);
  }
});

router.delete("/:childId/:feedId", async (req, res, next) => {
  const { childId, feedId } = req.params;

  try {
    await Feeds.findByIdAndRemove(feedId);

    await Child.findByIdAndUpdate(childId, { $pull: { feeds: feedId } });

    res.status(200).json({ message: "feed removed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
