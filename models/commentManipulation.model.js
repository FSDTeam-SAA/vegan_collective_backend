const mongoose = require("mongoose");

const commentManipulationSchema = new mongoose.Schema(
  {
    updateAndNewsID: {
      type: mongoose.Types.ObjectId,
      ref: "Organizationupdateandnews",
    },
    userID: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    comment: {
      type: String,
    },
    // likedBy:[
    //   {
    //     userIDWhoLiked:{
    //       type: mongoose.Types.ObjectId,           //this will be hard to implement
    //       ref: "User",
    //     }
    //   }
    // ]
  },
  {
    timestamps: true,
  }
);

const Commentmanipulation = mongoose.model(
  "Commentmanipulation",
  commentManipulationSchema
);
module.exports = Commentmanipulation;
