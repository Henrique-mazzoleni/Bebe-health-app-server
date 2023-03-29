const { model, Schema } = require("mongoose");

const sleepsSchema = new Schema(
  {
    startTime: {
      type: Date,
      required: [true, "Start Time is required."],
    },
    endTime: {
      type: Date,
      required: [true, "End Time is required."],
    },
    duration: {
      type: Number,
    },
    location: {
      type: String,
      enum: ["Parents Bed", "Crib", "Stroller", "Car"],
    },
  },
  {
    timestamps: true,
  }
);

const Sleeps = model("Sleeps", sleepsSchema);

module.exports = Sleeps;
