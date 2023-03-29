const { model, Schema } = require("mongoose");

const invitesSchema = new Schema(
  {
    invitationFrom: { type: Schema.Types.ObjectId, ref: "Parent" },
    childToAdd: { type: Schema.Types.ObjectId, ref: "Child" },
  },
  { timestamps: true }
);

const Invites = model("Invites", invitesSchema);

module.exports = Invites;
