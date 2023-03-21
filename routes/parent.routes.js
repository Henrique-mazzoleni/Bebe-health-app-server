const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const saltRounds = 10;

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

router.patch("/", async (req, res, next) => {
  const { email } = req.payload;
  const { newEmail, oldPassword, newPassword, newName } = req.body;

  const updatedParent = {};
  try {
    const loggedParent = await Parent.findOne({ email });

    // This regular expression check that the email is of a valid format
    if (newEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(newEmail)) {
        res.status(400).json({ message: "Provide a valid email address." });
        return;
      }

      updatedParent.email = newEmail;
    }

    if (oldPassword) {
      const passwordCorrect = bcrypt.compareSync(
        oldPassword,
        loggedParent.passwordHash
      );
      if (!passwordCorrect) {
        res.status(400).json({ message: "Ivalid password!" });
        return;
      }

      const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
      if (!passwordRegex.test(newPassword)) {
        res.status(400).json({
          message:
            "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
        });
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      updatedParent.passwordHash = hashedPassword;
    }

    if (newName) updatedParent.name = newName;

    const parentToUpdate = await Parent.findOneAndUpdate(
      { email },
      updatedParent,
      {
        new: true,
      }
    );

    res.status(200).json(parentToUpdate);
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  const { email } = req.payload;

  try {
    await Parent.findOneAndRemove({ email });

    res.status(200).json({ message: "parent deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
