const Professionalclientinteraction = require('../models/professionalClientInteraction.model');
const Professionalinfo = require('../models/professionalInfo.model'); // Import the Professionalinfo model

// Create a new interaction
exports.createInteraction = async (req, res) => {
    try {
        const { client, professionalID, service, date, time, status } = req.body;

        // Ensure required fields are present
        if (!client || !professionalID || !service) {
            return res.status(400).json({ message: "Client, professionalID, and service are required." });
        }

        // Validate professionalID exists in the database
        const professionalExists = await Professionalinfo.findById(professionalID);
        if (!professionalExists) {
            return res.status(400).json({ message: "Invalid professionalID. Professional does not exist." });
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
        res.status(201).json(savedInteraction);
    } catch (error) {
        res.status(500).json({ message: "Error creating interaction.", error: error.message });
    }
};

// Get all interactions
exports.getAllInteractions = async (req, res) => {
    try {
        const interactions = await Professionalclientinteraction.find()
            .populate('client', 'name email') // Populate client details
            .populate('professionalID', 'name specialty'); // Populate professional details

        res.status(200).json(interactions);
    } catch (error) {
        res.status(500).json({ message: "Error fetching interactions.", error: error.message });
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
            return res.status(404).json({ message: "Interaction not found." });
        }

        // Prevent modification of `client` and `professionalID`
        if (req.body.client || req.body.professionalID) {
            return res.status(400).json({ message: "Client and professionalID cannot be modified." });
        }

        // Only allow updating `status`
        const updatedInteraction = await Professionalclientinteraction.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        res.status(200).json(updatedInteraction);
    } catch (error) {
        res.status(500).json({ message: "Error updating interaction.", error: error.message });
    }
};

// Delete an interaction by ID
exports.deleteInteraction = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedInteraction = await Professionalclientinteraction.findByIdAndDelete(id);
        if (!deletedInteraction) {
            return res.status(404).json({ message: "Interaction not found." });
        }

        res.status(200).json({ message: "Interaction deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting interaction.", error: error.message });
    }
};