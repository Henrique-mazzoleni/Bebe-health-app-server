const express = require("express");
const router = express.Router();

const Child = require("../models/Child.model");
const Sleeps = require("../models/Sleeps.model");

const { isChildOfLoggedParent } = require('../middleware/isChildOfLoggedParent.middleware')

const getHoursDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return (
    parseInt(
      ((endDate.getTime() - startDate.getTime()) / 1000 / 60 / 60) * 10
    ) / 10
  );
};

router.get("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;

  try {
    const child = await Child.findById(childId).populate("sleeps");

    if (!child) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    res.status(200).json(child.sleeps);
  } catch (error) {
    next(error);
  }
});

router.post("/:childId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId } = req.params;

  const newSleep = { ...req.body };

  if (!newSleep.startTime || !newSleep.endTime) {
    res
      .status(400)
      .json({ message: "date, start and end Time fields must be provided" });
    return;
  }

  newSleep.duration = getHoursDuration(newSleep.startTime, newSleep.endTime);

  try {
    const child = await Child.findById(childId);

    if (!child) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    const sleep = await Sleeps.create(newSleep);

    await Child.findByIdAndUpdate(childId, { $push: { sleeps: sleep._id } });

    res.status(200).json(sleep);
  } catch (error) {
    next(error);
  }
});

router.get(
  "/:childId/:sleepId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId, sleepId } = req.params;

    try {
      const child = await Child.findById(childId);

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }

      const sleep = await Sleeps.findById(sleepId);

      if (!sleep) {
        res.status(404).json({ message: "sleep not found!" });
        return;
      }

      res.status(200).json(sleep);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  "/:childId/:sleepId",
  isChildOfLoggedParent,
  async (req, res, next) => {
    const { childId, sleepId } = req.params;
    const sleepUpdate = { ...req.body };

    try {
      const child = await Child.findById(childId);

      if (!child) {
        res.status(404).json({ message: "child not found!" });
        return;
      }

      const sleep = await Sleeps.findById(sleepId);

      if (!sleep) {
        res.status(404).json({ message: "sleep not found!" });
        return;
      }

      if (sleepUpdate.startTime || sleepUpdate.endTime) {
        const updatedStart = sleepUpdate.startTime
          ? sleepUpdate.startTime
          : sleep.startTime;
        const updatedEnd = sleepUpdate.endTime
          ? sleepUpdate.endTime
          : sleep.endTime;
        sleepUpdate.duration = getHoursDuration(updatedStart, updatedEnd);
      }

      const updatedSleep = await Sleeps.findByIdAndUpdate(
        sleepId,
        sleepUpdate,
        {
          new: true,
        }
      );

      res.status(200).json(updatedSleep);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:childId/:sleepId", isChildOfLoggedParent, async (req, res, next) => {
  const { childId, sleepId } = req.params;

  try {
    const child = await Child.findById(childId);

    if (!child) {
      res.status(404).json({ message: "child not found!" });
      return;
    }

    const sleep = await Sleeps.findById(sleepId);

    if (!sleep) {
      res.status(404).json({ message: "sleep not found!" });
      return;
    }
    
    await Sleeps.findByIdAndRemove(sleepId);

    await Child.findByIdAndUpdate(childId, { $pull: { sleeps: sleepId } });

    res.status(200).json({ message: "sleep removed successfully" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
