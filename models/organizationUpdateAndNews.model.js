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
    comments:[
      {
        commnetID:{
          type: mongoose.Types.ObjectId,
          ref: "Commentmanipulation",
        },
      }
    ]
  },
  {
    timestamps: true,
  }
);

const Organizationupdateandnews = mongoose.model("Organizationupdateandnews", organizationUpdateAndNewsSchema);
module.exports = Organizationupdateandnews;
