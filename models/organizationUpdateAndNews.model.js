const mongoose = require("mongoose");
const organizationUpdateAndNewsSchema = new mongoose.Schema(
  {
    organizationID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
    },
    image: {
      type: String,
    },
    shortDescription:{
      type: String,
    },
    statement: {
      type: String,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commentmanipulation' }],
    likedBy: [
      {
       
          type: mongoose.Types.ObjectId,
          ref: "User",
        
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Organizationupdateandnews = mongoose.model("Organizationupdateandnews", organizationUpdateAndNewsSchema);
module.exports = Organizationupdateandnews;
