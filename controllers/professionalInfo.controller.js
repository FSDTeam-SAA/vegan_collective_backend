const Professionalinfo = require("../models/professionalInfo.model");

// create professional info
const createProfessionalInfo = async (req, res) => {
  try {
    const {
      user,
      organizationName,
      governmentIssuedID,
      professionalCertification,
      photoWithID,
    } = req.body;

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "user not found",
        data: null,
      });
    }

    const professionalInfo = await Professionalinfo.create({
      user,
      organizationName,
      governmentIssuedID,
      professionalCertification,
      photoWithID,
    });

    return res.status(201).json({
      status: true,
      message: "professional info created",
      data: professionalInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

// get all professional info
const getAllProfessionalInfo = async (req, res) => {
  try {
    const allProfessionalInfo = await Professionalinfo.find({});
    return res.status(200).json({
      status: true,
      message: "fetch all professional info",
      data: allProfessionalInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

// get specific professional info
const getSpecificProfessionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const specificProfessionalInfo = await Professionalinfo.findById({
      _id: id,
    });

    if (!specificProfessionalInfo) {
      return res
        .status(404)
        .json({ status: false, message: "no professional info exist" });
    }

    return res.status(200).json({
      status: true,
      message: "professional info fetch by id",
      data: specificProfessionalInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

// update professional info
const updateProfessionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user,
      organizationName,
      governmentIssuedID,
      professionalCertification,
      photoWithID,
    } = req.body;

    const professionalInfoFound = await Professionalinfo.findById({ _id: id });
    if (!professionalInfoFound) {
      return res
        .status(404)
        .json({ status: false, message: "no professional info exist" });
    }

    const professionalInfo = {
      user: user || professionalInfoFound.user,
      organizationName:
        organizationName || professionalInfoFound.organizationName,
      governmentIssuedID:
        governmentIssuedID || professionalInfoFound.governmentIssuedID,
      professionalCertification:
        professionalCertification ||
        professionalInfoFound.professionalCertification,
      photoWithID: photoWithID || professionalInfoFound.photoWithID,
    };
    const updateProfessionalInfo = await Professionalinfo.findByIdAndUpdate(
      { _id: id },
      professionalInfo,
      { new: true }
    );

    return res.status(200).json({
      status: true,
      message: "professional info updated",
      data: updateProfessionalInfo,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

// delete professional info
// const deleteProfessionalInfo = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const professionalInfoFound = await Professionalinfo.findById(id);
//     if (!professionalInfoFound) {
//       return res
//         .status(404)
//         .json({ status: false, message: "no professional info exists" });
//     }

//     await Professionalinfo.findByIdAndDelete({ _id: id });

//     return res.status(200).json({
//       status: true,
//       message: "professional info deleted successfully",
//       data: null,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: false,
//       message: "internal server error",
//       data: error.message,
//     });
//   }
// };

const deleteProfessionalInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const professionalInfoFound = await Professionalinfo.findById({ _id: id });
    if (!professionalInfoFound) {
      return res
        .status(404)
        .json({ status: false, message: "no professional info exist" });
    }
    await Professionalinfo.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ status: true, message: "professional info deleted" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "internal server error",
      data: error.message,
    });
  }
};

module.exports = {
  createProfessionalInfo,
  getAllProfessionalInfo,
  getSpecificProfessionalInfo,
  updateProfessionalInfo,
  deleteProfessionalInfo,
};
