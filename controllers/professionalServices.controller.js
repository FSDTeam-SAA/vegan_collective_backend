const ProfessionalServices = require('../models/professionalServices.model');

const 


getProfessionalServices = async (req, res) => {
    try {
      const professionalServices = await ProfessionalServices.find().populate('user'); // Populate the `user` field
      return res.status(200).json({
        status: true,
        data: professionalServices
      });
    } catch (error) {
      return res.status(500).json({ 
        status:false,
        message: "Failed to fetch professional services", 
        data:error 
      });
    }
  };


  const getProfessionalServiceById = async (req, res) => {
    const { id } = req.params;
    try {
      const professionalService = await ProfessionalServices.findById(id).populate('user'); // Populate the `user` field
      if (!professionalService) {
        return res.status(404).json({ 
          status:false,
          message: "Professional service not found" 
        });
      }
      return res.status(200).json({
        status: true,
        data: professionalService
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to fetch professional service", 
        data: error 
      });
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
      return res.status(201).json({
        status: true,
        data: newProfessionalService
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false, 
        message: "Failed to create professional service", 
        data: error 
      });
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
        return res.status(404).json({ 
          status:false,
          message: "Professional service not found" 
        });
      }
      return res.status(200).json({
        status:true,
        data: updatedProfessionalService
      });
    } catch (error) {
      return res.status(500).json({ 
        status:false,
        message: "Failed to update professional service", 
        data: error 
      });
    }
  };


  const deleteProfessionalService = async (req, res) => {
    const { id } = req.params;
    try {
      const deletedProfessionalService = await ProfessionalServices.findByIdAndDelete(id);
      if (!deletedProfessionalService) {
        return res.status(404).json({ 
          status:false,
          message: "Professional service not found" 
        });
      }
      return res.status(200).json({ 
        status: true,
        message: "Professional service deleted successfully" 
      });
    } catch (error) {
      return res.status(500).json({ 
        status: false,
        message: "Failed to delete professional service", 
        data: error 
      });
    }
  };    


  module.exports = {
    getProfessionalServices,
    getProfessionalServiceById,
    createProfessionalService,
    updateProfessionalService,
    deleteProfessionalService,
  };


