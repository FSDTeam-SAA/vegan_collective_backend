const Review = require('../models/professionalReview.model'); // Assuming you have a Review model
const Professionalinfo = require('../models/professionalInfo.model'); // Assuming you have a Professionalinfo model

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { userID, professionalID, rating, comment } = req.body;

    // Check if the user has already reviewed this professional
    const existingReview = await Review.findOne({ userID, professionalID });
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this professional.' });
    }

    const review = new Review({
      userID,
      professionalID,
      rating,
      comment,
    });

    await review.save();

    // Update the professional's average rating
    await updateProfessionalAverageRating(professionalID);

    res.status(201).json({ success: true, message: 'Review created successfully.', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating review.', error: error.message });
  }
};

// Get all reviews for a professional
exports.getReviewsByProfessional = async (req, res) => {
  try {
    const { professionalID } = req.params;

    const reviews = await Review.find({ professionalID }).populate('userID', 'name'); // Assuming 'name' is a field in the User model

    res.status(200).json({ success: true, message: 'Reviews fetched successfully.', data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching reviews.', error: error.message });
  }
};

// Calculate and update the average rating for a professional
const updateProfessionalAverageRating = async (professionalID) => {
  try {
    const reviews = await Review.find({ professionalID });
    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRatings / reviews.length;

    await Professionalinfo.findByIdAndUpdate(professionalID, { averageRating });
  } catch (error) {
    console.error('Error updating professional average rating:', error);
  }
};

// Get the average rating of a professional
exports.getAverageRating = async (req, res) => {
  try {
    const { professionalID } = req.params;

    const professional = await Professionalinfo.findById(professionalID);
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found.' });
    }

    res.status(200).json({ success: true, message: 'Average rating fetched successfully.', averageRating: professional.averageRating });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching average rating.', error: error.message });
  }
};