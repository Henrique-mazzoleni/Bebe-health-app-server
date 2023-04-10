const { model, Schema } = require("mongoose");

const childSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      lowercase: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "Date of Birth is required."],
    },
    gender: {
      type: String,
      required: [true, "Gender is required."],
    },
    weightAtBirth: {
      type: String,
      required: [true, "Weight at Birth is required."],
    },
    sizeAtBirth: {
      type: String,
      required: [true, "Size at Birth is required."],
    },
    pictureURL: String,
    parents: [{ type: Schema.Types.ObjectId, ref: "Parent" }],
    feeds: [{ type: Schema.Types.ObjectId, ref: "Feeds" }],
    changes: [{ type: Schema.Types.ObjectId, ref: "Changes" }],
    sleeps: [{ type: Schema.Types.ObjectId, ref: "Sleeps" }],
  },

  {
    timestamps: true,
  }
);

const Child = model("Child", childSchema);

module.exports = Child;
