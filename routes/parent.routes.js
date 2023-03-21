const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const Parent = require("../models/Parent.model");
const Invite = require("../models/Invite.model");
const Child = require("../models/Child.model");

router.get("/", async (req, res, next) => {
  const { tokenEmail } = req.payload;

  try {
    const loggedUser = await Parent.findOne({ tokenEmail });

    res.status(200).json(loggedUser);
  } catch (error) {
    next(error);
  }
});

router.patch("/", async (req, res, next) => {
  const { tokenEmail } = req.payload;
  const { newEmail, oldPassword, newPassword, newName } = req.body;

  const updatedParent = {};
  try {
    const loggedParent = await Parent.findOne({ tokenEmail });

    // This regular expression check that the email is of a valid format
    if (newEmail) {
      const foundParent = await Parent.findOne({ newEmail });
      if (foundParent) {
        res.status(400).json({ message: "Email already in use." });
        return;
      }

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
      { tokenEmail },
      updatedParent,
      {
        new: true,
      }
    );

    const { _id, email, name } = parentToUpdate;
    const payload = { _id, email, name };

    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    res.status(200).json({ updatedParent: parentToUpdate, authToken });
  } catch (error) {
    next(error);
  }
});

router.delete("/", async (req, res, next) => {
  const { email } = req.payload;

  try {
    const parentToRemove = await Parent.findOne({ email });
    parentToRemove.children.forEach(async (childId) => {
      const child = await Child.findByIdAndUpdate(
        childId,
        { $pull: { parents: parentToRemove._id } },
        { new: true }
      );
      if (child.parents.length === 0) await Child.findByIdAndDelete(childId);
    });

    await Parent.findOneAndRemove({ email });

    res.status(200).json({ message: "parent deleted successfully." });
  } catch (error) {
    next(error);
  }
});

router.post("/invite", async (req, res, next) => {
  const { email } = req.payload;
  const { emailToInvite, childId } = req.body;

  try {
    const invitingParent = await Parent.findOne({ email });
    const parentToInvite = await Parent.findOne({ email: emailToInvite });

    const invitation = await Invite.create({
      invitationFrom: invitingParent._id,
      childToAdd: childId,
    });
    parentToInvite.invitations.push(invitation._id);
    await parentToInvite.save();

    res.status(200).json(invitation);
  } catch (error) {
    next(error);
  }
});

router.post("/accept", async (req, res, next) => {
  const { email } = req.payload;
  const { inviteId } = req.body;

  try {
    const invite = await Invite.findById(inviteId);
    const parentToAccept = await Parent.findOne({ email });
    const childToAdd = await Child.findById(invite.childToAdd);

    parentToAccept.children.push(childToAdd._id);
    parentToAccept.save();

    childToAdd.parents.push(parentToAccept._id);
    childToAdd.save();

    await Invite.findByIdAndRemove(inviteId);

    res.status(200).json(childToAdd);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
