const { model, Schema } = require("mongoose");

const parentSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required."],
    },
    name: {
      type: String,
      required: [true, "Name is required."],
    },
    children: [{ type: Schema.Types.ObjectId, ref: "Child" }],
  },
  {
    timestamps: true,
  }
);

const Parent = model("Parent", parentSchema);

module.exports = Parent;
