const { default: mongoose } = require("mongoose");
const Storereview = require("../models/storeReview.model");

const createStoreReview = async (req, res) => {
    try {
        const { userID, merchantID, rating, comment } = req.body;

        if (!userID || !merchantID || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "userID, merchantID, and rating are required.",
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5.",
            });
        }

        const saveReview = await new Storereview({
            userID,
            merchantID,
            rating: Number(rating), // Convert rating to a number
            comment,
        }).save();

        return res.status(201).json({
            success: true,
            message: "Review created successfully",
            data: saveReview,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data: [],
        });
    }
};

const getAverageRating = async (req, res) => {
    try {
        const { merchantID } = req.params; 

        if (!merchantID) {
            return res.status(400).json({
                success: false,
                message: "merchantID is required",
            });
        }

        const result = await Storereview.aggregate([
            { $match: { merchantID: new mongoose.Types.ObjectId(merchantID) } }, 
            { $group: { _id: "$merchantID", avgRating: { $avg: "$rating" } } } 
        ]);

        const avgRating = result.length > 0 ? result[0].avgRating.toFixed(1) : "0.0";

        return res.status(200).json({
            success: true,
            message : "data fetched",
            data : avgRating,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
            data : []
        });
    }
};

const getAllReviewsForSpecificStore = async (req, res) => {
    try {
        const { merchantID } = req.params;

        if (!merchantID) {
            return res.status(400).json({
                success: false,
                message: "merchantID is required",
            });
        }

        const reviews = await Storereview.find({ merchantID })
            .populate("userID", "fullName _id")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            reviews: reviews.map(review => ({
                userID: review.userID?._id,  
                userName: review.userID?.fullName, 
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }))
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {createStoreReview, getAverageRating, getAllReviewsForSpecificStore};