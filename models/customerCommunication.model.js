const mongoose = require('mongoose');

const customerCommunicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Merchantinfo',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

const Customercommunication = mongoose.model("Customercommunication", customerCommunicationSchema);
module.exports = Customercommunication;