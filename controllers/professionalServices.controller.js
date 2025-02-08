const ProfessionalServices = require('../models/professionalServices.model');

const 


getProfessionalServices = async (req, res) => {
    try {
      const professionalServices = await ProfessionalServices.find().populate('user'); // Populate the `user` field
      res.status(200).json(professionalServices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professional services", error });
    }
  };


  const getProfessionalServiceById = async (req, res) => {
    const { id } = req.params;
    try {
      const professionalService = await ProfessionalServices.findById(id).populate('user'); // Populate the `user` field
      if (!professionalService) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      res.status(200).json(professionalService);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch professional service", error });
    }
  };

  const createProfessionalService = async (req, res) => {
    const {
      user,
      serviceName,
      metaDescription,
      serviceDescription,
      keywords,
      paymentType,
      price,
      addImage,
      addVideo,
    } = req.body;
    try {
      const newProfessionalService = new ProfessionalServices({
        user,
        serviceName,
        metaDescription,
        serviceDescription,
        keywords,
        paymentType,
        price,
        addImage,
        addVideo,
      });
      await newProfessionalService.save();
      res.status(201).json(newProfessionalService);
    } catch (error) {
      res.status(500).json({ message: "Failed to create professional service", error });
    }
  };    

  
  const updateProfessionalService = async (req, res) => {
    const { id } = req.params;
    const {
      user,
      serviceName,
      metaDescription,
      serviceDescription,
      keywords,
      paymentType,
      price,
      addImage,
      addVideo,
    } = req.body;
    try {
      const updatedProfessionalService = await ProfessionalServices.findByIdAndUpdate(
        id,
        {
          user,
          serviceName,
          metaDescription,
          serviceDescription,
          keywords,
          paymentType,
          price,
          addImage,
          addVideo,
        },
        { new: true }
      );
      if (!updatedProfessionalService) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      res.status(200).json(updatedProfessionalService);
    } catch (error) {
      res.status(500).json({ message: "Failed to update professional service", error });
    }
  };


  const deleteProfessionalService = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedProfessionalService = await ProfessionalServices.findByIdAndDelete(id);
      if (!deletedProfessionalService) {
        return res.status(404).json({ message: "Professional service not found" });
      }
      res.status(200).json({ message: "Professional service deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete professional service", error });
    }
  };    


  module.exports = {
    getProfessionalServices,
    getProfessionalServiceById,
    createProfessionalService,
    updateProfessionalService,
    deleteProfessionalService,
  };


