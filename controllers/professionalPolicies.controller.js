const Professionalpolicies = require("../models/professionalPolicies.model");
const Professionalinfo = require("../models/professionalInfo.model"); // Import the Professionalinfo model

// Create or Update Professional Policies
exports.createOrUpdateProfessionalPolicies = async (req, res) => {
  try {
    const { professionalID, beforeAppointment, afterAppointment, cancellationWindow, noShowPolicy } = req.body;

    // Check if professionalID exists in the request
    if (!professionalID) {
      return res.status(400).json({ status: false, message: "Professional ID is required." });
    }

    // Validate if professionalID exists in the Professionalinfo collection
    const professionalExists = await Professionalinfo.findById(professionalID);
    if (!professionalExists) {
      return res.status(404).json({ status: false, message: "Professional with the given ID does not exist." });
    }

    // Find existing policy for the professional
    let professionalPolicy = await Professionalpolicies.findOne({ professionalID });

    if (professionalPolicy) {
      // Update existing policy
      professionalPolicy.beforeAppointment = beforeAppointment || professionalPolicy.beforeAppointment;
      professionalPolicy.afterAppointment = afterAppointment || professionalPolicy.afterAppointment;
      professionalPolicy.cancellationWindow = cancellationWindow || professionalPolicy.cancellationWindow;
      professionalPolicy.noShowPolicy = noShowPolicy || professionalPolicy.noShowPolicy;

      await professionalPolicy.save();
      return res.status(200).json({ status: true, message: "Professional policies updated successfully.", data: professionalPolicy });
    } else {
      // Create new policy
      const newPolicy = new Professionalpolicies({
        professionalID,
        beforeAppointment,
        afterAppointment,
        cancellationWindow,
        noShowPolicy,
      });

      await newPolicy.save();
      return res.status(201).json({ status: true, message: "Professional policies created successfully.", data: newPolicy });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error.", error: error.message });
  }
};// Get All Professional Policies
exports.getAllProfessionalPolicies = async (req, res) => {
  try {
    const professionalPolicies = await Professionalpolicies.find();

    if (!professionalPolicies) {
      return res.status(404).json({ status: false, message: "No policies found." });
    }

    return res.status(200).json({ status: true, message: "All professional policies retrieved successfully.", data: professionalPolicies });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error.", error: error.message });
  }
};



// Get Professional Policies by Professional ID
exports.getProfessionalPolicies = async (req, res) => {
  try {
    const { professionalID } = req.params;

    // Check if professionalID exists in the request
    if (!professionalID) {
      return res.status(400).json({ status: false, message: "Professional ID is required." });
    }

    // Validate if professionalID exists in the Professionalinfo collection
    const professionalExists = await Professionalinfo.findById(professionalID);
    if (!professionalExists) {
      return res.status(404).json({ status: false, message: "Professional with the given ID does not exist." });
    }

    const professionalPolicy = await Professionalpolicies.findOne({ professionalID });

    if (!professionalPolicy) {
      return res.status(404).json({ status: false, message: "No policies found for this professional." });
    }

    return res.status(200).json({ status: true, message: "Professional policies retrieved successfully.", data: professionalPolicy });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal server error.", error: error.message });
  }
};