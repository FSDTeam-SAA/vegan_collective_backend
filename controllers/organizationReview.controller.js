const { default: mongoose } = require("mongoose");
const Organizationreview = require("../models/organizationReview.model");

const createOrganizationReview = async (req, res) => {
    try {
        const { userID, organizationID, rating, comment } = req.body;

        if (!userID || !organizationID || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "userID, organizationID, and rating are required.",
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 1 and 5.",
            });
        }

        const saveReview = await new Organizationreview({
            userID,
            organizationID,
            rating: Number(rating), 
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
        const { organizationID } = req.params; 

        if (!organizationID) {
            return res.status(400).json({
                success: false,
                message: "organizationID is required",
            });
        }

        const result = await Organizationreview.aggregate([
            { $match: { organizationID: new mongoose.Types.ObjectId(organizationID) } }, 
            { $group: { _id: "$organizationID", avgRating: { $avg: "$rating" } } } 
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

const getAllReviewsForSpecificOrganization = async (req, res) => {
    try {
        const { organizationID } = req.params;

        if (!organizationID) {
            return res.status(400).json({
                success: false,
                message: "organizationID is required",
            });
        }

        const reviews = await Organizationreview.find({ organizationID })
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

module.exports = {createOrganizationReview, getAverageRating, getAllReviewsForSpecificOrganization};