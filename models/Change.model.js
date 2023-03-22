const { model, Schema } = require("mongoose");

const changeSchema = new Schema(
  {
    dateAndTime: {
      type: Date,
      required: [true, "Date and Time are required."],
      lowercase: true,
      trim: true,
    },
    kind: {
      type: String,
      enum: ["wet", "dirty", "both"],
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

const Change = model("Change", changeSchema);

module.exports = Change;
