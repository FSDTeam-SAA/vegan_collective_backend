const { default: mongoose } = require("mongoose");
const Organizationreview = require("../models/organizationReview.model");
const Organizationinfo = require("../models/organizationInfo.model");
const Storereview = require("../models/storeReview.model");

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
        const { page = 1, limit = 10, sort = "highest" } = req.query;

        if (!organizationID) {
            return res.status(400).json({
                success: false,
                message: "organizationID is required",
            });
        }

        const itemsPerPage = parseInt(limit, 10);
        const currentPage = parseInt(page, 10);
        const sortOrder = sort === "lowest" ? 1 : -1;

        const totalItems = await Organizationreview.countDocuments({ organizationID });
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        const reviews = await Organizationreview.find({ organizationID })
            .populate("userID", "fullName _id")
            .sort({ rating: sortOrder })
            .skip((currentPage - 1) * itemsPerPage)
            .limit(itemsPerPage);

        return res.status(200).json({
            success: true,
            reviews: reviews.map(review => ({
                userID: review.userID?._id,
                userName: review.userID?.fullName,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            })),
            pagination: {
                currentPage,
                totalPages,
                totalItems,
                itemsPerPage
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Function to get the top organization based on the average rating

const getTopOrganizations = async (req, res) => {
    try {
        const { limit = 10 } = req.query; // Default limit is 10

        const topOrganizations = await Organizationreview.aggregate([
            {
                $group: {
                    _id: "$organizationID",
                    avgRating: { $avg: "$rating" },
                    totalReviews: { $sum: 1 }
                }
            },
            {
                $match: {
                    avgRating: { $gt: 0 } // Only include organizations with an average rating greater than 0
                }
            },
            {
                $sort: { avgRating: -1 } // Sort by average rating in descending order
            },
            {
                $limit: parseInt(limit, 10) // Limit the number of results
            },
            {
                $lookup: {
                    from: "organizationinfos", // The collection to join with
                    localField: "_id",
                    foreignField: "userID", // Assuming organizationID in Organizationreview is the same as userID in Organizationinfo
                    as: "organizationInfo"
                }
            },
            {
                $unwind: "$organizationInfo" // Unwind the joined organization info
            },
            {
                $project: {
                    organizationID: "$_id",
                    avgRating: { $round: ["$avgRating", 2] }, // Round the average rating to 2 decimal places
                    totalReviews: 1,
                    organizationName: "$organizationInfo.organizationName",
                    profilePhoto: "$organizationInfo.profilePhoto"
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            topOrganizations: topOrganizations.map(org => ({
                organizationID: org.organizationID,
                avgRating: org.avgRating.toFixed(2), // Format the average rating to 2 decimal places
                totalReviews: org.totalReviews,
                organizationName: org.organizationName,
                profilePhoto: org.profilePhoto
            }))
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


module.exports = {createOrganizationReview, getAverageRating, getAllReviewsForSpecificOrganization, getTopOrganizations};