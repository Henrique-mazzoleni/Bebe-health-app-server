const { model, Schema } = require("mongoose");

const changesSchema = new Schema(
  {
    dateAndTime: {
      type: Date,
      required: [true, "Date and Time are required."],
      lowercase: true,
      trim: true,
    },
    kind: {
      type: String,
      enum: ["wet", "dirty", "both", "nothing"],
      required: [true, "type is required."],
    },
    consistency: {
      type: String,
      required: [true, "consistency is required."],
    },
  },
  {
    timestamps: true,
  }
);

const Changes = model("Changes", changesSchema);

module.exports = Changes;
