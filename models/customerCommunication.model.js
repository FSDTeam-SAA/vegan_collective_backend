const mongoose = require('mongoose');

const customerCommunicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'Merchantinfo',
      required: true,
    },
    emailAddress: {
      type: String,
    },
    whatsappLink: {
      type: String,
    },
    messangerLink: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Customercommunication = mongoose.model("Customercommunication", customerCommunicationSchema);
module.exports = Customercommunication;