const Professionalclientinteraction = require('../models/professionalClientInteraction.model');
const Professionalinfo = require('../models/professionalInfo.model'); // Import the Professionalinfo model

// Create a new interaction
exports.createInteraction = async (req, res) => {
    try {
        const { client, professionalID, service, date, time, status } = req.body;

        // Ensure required fields are present
        if (!client || !professionalID || !service) {
            return res.status(400).json({ 
                status: false,
                message: "Client, professionalID, and service are required." 
            });
        }

        // Validate professionalID exists in the database
        const professionalExists = await Professionalinfo.findById(professionalID);
        if (!professionalExists) {
            return res.status(400).json({ 
                status:false,
                message: "Invalid professionalID. Professional does not exist." 
            });
        }

        // Create the interaction
        const newInteraction = new Professionalclientinteraction({
            client,
            professionalID,
            service,
            date,
            time,
            status: status || "pending", // Default to "pending" if not provided
        });

        // Save to the database
        const savedInteraction = await newInteraction.save();
        return res.status(201).json({
            status: true,
            data: savedInteraction,
        });
    } catch (error) {
        return res.status(500).json({ 
            status: false,
            message: "Error creating interaction.", 
            data: error.message 
        });
    }
};

// Get all interactions
exports.getAllInteractions = async (req, res) => {
    try {
        const interactions = await Professionalclientinteraction.find()
            .populate('client', 'name email') // Populate client details
            .populate('professionalID', 'name specialty'); // Populate professional details

        return res.status(200).json({
            status: true,
            data: interactions
        });
    } catch (error) {
        return res.status(500).json({ 
            status: false,
            message: "Error fetching interactions.", 
            data: error.message 
        });
    }
};

// Update an interaction by ID
exports.updateInteraction = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Fetch the existing interaction
        const existingInteraction = await Professionalclientinteraction.findById(id);
        if (!existingInteraction) {
            return res.status(404).json({ 
                status: false,
                message: "Interaction not found." 
            });
        }

        // Prevent modification of `client` and `professionalID`
        if (req.body.client || req.body.professionalID) {
            return res.status(400).json({ 
                status: false,
                message: "Client and professionalID cannot be modified." 
            });
        }

        // Only allow updating `status`
        const updatedInteraction = await Professionalclientinteraction.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        return res.status(200).json({
            status: true,
            data: updatedInteraction
        });
    } catch (error) {
        return res.status(500).json({ 
            status:false,
            message: "Error updating interaction.", 
            data: error.message 
        });
    }
};

// Delete an interaction by ID
exports.deleteInteraction = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedInteraction = await Professionalclientinteraction.findByIdAndDelete(id);
        if (!deletedInteraction) {
            return res.status(404).json({ 
                status: false,
                message: "Interaction not found." 
            });
        }

        return res.status(200).json({ 
            status:true,
            message: "Interaction deleted successfully." 
        });
    } catch (error) {
        return res.status(500).json({ 
            status:false,
            message: "Error deleting interaction.", 
            data: error.message 
        });
    }
};