const { model, Schema } = require("mongoose");

const feedsSchema = new Schema(
  {
    dateAndTime: {
      type: Date,
      required: [true, "Date and Time are required."],
      lowercase: true,
      trim: true,
    },
    kind: {
      type: String,
      enum: ["breast", "bottle"],
      required: [true, "kind is required."],
    },
    rightBreastDuration: {
      type: Number,
    },
    leftBreastDuration: {
      type: Number,
    },
    bottleVolume: {
      type: Number,
    },
    throwUp: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Feeds = model("Feeds", feedsSchema);

module.exports = Feeds;
