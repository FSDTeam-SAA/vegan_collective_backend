const Merchantinfo = require('../models/merchantInfo.model')

const addStripeAccountId = async (req, res) => {
  try {
    const { merchantID, StripeAccountId } = req.body

    if (!merchantID || !StripeAccountId) {
      return res
        .status(400)
        .json({ message: 'Merchant ID and Stripe Account ID are required' })
    }

    // Find the merchant and update the StripeAccountId
    const updatedMerchant = await Merchantinfo.findByIdAndUpdate(
      merchantID,
      { StripeAccountId },
      { new: true, runValidators: true }
    )

    if (!updatedMerchant) {
      return res.status(404).json({ message: 'Merchant not found' })
    }

    res
      .status(200)
      .json({
        message: 'Stripe Account ID added successfully',
        merchant: updatedMerchant,
      })
  } catch (error) {
    console.error('Error adding Stripe Account ID:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

// Remove Stripe Account ID
const removeStripeAccountId = async (req, res) => {
    try {
        const { merchantID } = req.body;

        if (!merchantID) {
            return res.status(400).json({ message: "Merchant ID is required" });
        }

        // Find the merchant and remove the StripeAccountId
        const updatedMerchant = await Merchantinfo.findByIdAndUpdate(
            merchantID,
            { $unset: { StripeAccountId: "" } }, // Removes the field
            { new: true }
        );

        if (!updatedMerchant) {
            return res.status(404).json({ message: "Merchant not found" });
        }

        res.status(200).json({ message: "Stripe Account ID removed successfully", merchant: updatedMerchant });
    } catch (error) {
        console.error("Error removing Stripe Account ID:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { addStripeAccountId, removeStripeAccountId };