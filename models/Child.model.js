const {model, Schema} = require('mongoose')

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
        type: Number,
        required: [true, "Weight at Birth is required."],
      },
      sizeAtBirth: {
        type: Number,
        required: [true, "Size at Birth is required."],
      },
      parents: [{type: Schema.Types.ObjectId, ref: "Parent" }],
      feeds: [{type: Schema.Types.ObjectId, ref: "Feeds" }],
      change: [{type: Schema.Types.ObjectId, ref: "Change" }],
      sleep: [{type: Schema.Types.ObjectId, ref: "Sleep" }],
    },
    
    {
      timestamps: true,
    }
  );
  
  const Child = model("Child", childSchema);
  
  module.exports = Child;