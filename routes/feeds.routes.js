const express = require("express");
const router = express.Router();

const Child = require("../models/Child.model");
const Feeds = require("../models/Feeds.model");

const {
  isChildOfLoggedParent,
} = require("../middleware/isChildOfLoggedParent.middleware");

router.get(
  "/average/:childId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId } = req.params;
    try {
      const child = await Child.findById(childId); //.populate("changes");

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }
            
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const lastWeekFeeds = await Feeds.find({
        _id: { $in: child.feeds },
        dateAndTime: { $gt: oneWeekAgo },
      })

      const rightBreastDuration = lastWeekFeeds.reduce((acc, feed) => feed.rightBreastDuration ? feed.rightBreastDuration + acc : acc, 0) / 60
      const leftBreastDuration = lastWeekFeeds.reduce((acc, feed) => feed.leftBreastDuration ? feed.leftBreastDuration + acc : acc, 0) / 60
      const bottleVolume = lastWeekFeeds.reduce((acc, feed) => feed.bottleVolume ? feed.bottleVolume + acc : acc, 0)

      res.status(200).json({rightBreastAverage: rightBreastDuration / 7, leftBreastAverage: leftBreastDuration / 7, bottleAverage: bottleVolume / 7})
    } catch (error) {
      next(error);
    }
  }
);

router.get("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;
  const { page } = req.query;
  // through the id provided in the url paramater the route retrieves the document in the database and returns it to the client

  try {
    const child = await Child.findById(childId);

    if (!child) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    const feedsPage = await Feeds.find({
      _id: { $in: child.feeds },
    })
      .sort({ dateAndTime: -1 })
      .skip((page - 1) * 10)
      .limit(10);

    res.status(200).json({ noOfItems: child.feeds.length, feeds: feedsPage });
  } catch (error) {
    next(error);
  }
});

router.post("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;

  const createObject = { ...req.body };

  if (createObject.kind === "breast") createObject.bottleVolume = null
  else {
    createObject.rightBreastDuration = null;
    createObject.leftBreastAverage = null;
  }

  if (!createObject.dateAndTime || !createObject.kind) {
    res.status(400).json({ message: "date and kind fields must be provided" });
    return;
  }

  try {
    const child = await Child.findById(childId);

    if (!child) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    const feed = await Feeds.create(createObject);

    await Child.findByIdAndUpdate(childId, { $push: { feeds: feed._id } });

    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:childId/:feedId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId, feedId } = req.params;

    try {
      const child = await Child.findById(childId);

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }

      const feed = await Feeds.findById(feedId);

      if (!feed) {
        res.status(404).json({ message: "feed not found!" });
        return;
      }

      res.status(200).json(feed);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:childId/:feedId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId, feedId } = req.params;
    const feedUpdate = { ...req.body };

    if (feedUpdate.kind === "breast") feedUpdate.bottleVolume = null
    else {
      feedUpdate.rightBreastDuration = null;
      feedUpdate.leftBreastAverage = null;
    }

    try {
      const child = await Child.findById(childId);

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }

      const feed = await Feeds.findById(feedId);

      if (!feed) {
        res.status(404).json({ message: "feed not found!" });
        return;
      }

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
  }
);

router.delete(
  "/:childId/:feedId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId, feedId } = req.params;

    try {
      const child = await Child.findById(childId);

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }

      const feed = await Feeds.findById(feedId);

      if (!feed) {
        res.status(404).json({ message: "feed not found!" });
        return;
      }

      await Feeds.findByIdAndRemove(feedId);

      await Child.findByIdAndUpdate(childId, { $pull: { feeds: feedId } });

      res.status(200).json({ message: "feed removed successfully" });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
