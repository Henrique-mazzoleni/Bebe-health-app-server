const { model, Schema } = require("mongoose");

const inviteSchema = new Schema(
  {
    invitationFrom: { type: Schema.Types.ObjectId, ref: "Parent" },
    childToAdd: { type: Schema.Types.ObjectId, ref: "Chile" },
  },
  { timestamps: true }
);

const Invite = model("Invite", inviteSchema);

module.exports = Invite;
