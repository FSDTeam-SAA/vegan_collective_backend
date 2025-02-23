const GlobalFind = require('../models/GlobalFind');

const globalFind = async (req, res) => {
  const { type, page = 1, limit = 10, search = '' } = req.query;

  try {
    // Build the query
    const query = {};
    if (type) query.type = type;

    // Add search functionality
    if (search) {
      query.$or = [
        { merchant_id: { $regex: search, $options: 'i' } },
        { organization_id: { $regex: search, $options: 'i' } },
        { professional_id: { $regex: search, $options: 'i' } },
        { 'details.name': { $regex: search, $options: 'i' } },
        { 'details.address': { $regex: search, $options: 'i' } },
        // Add more fields to search if needed
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Fetch data
    const results = await GlobalFind.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    // Count total documents for pagination
    const total = await GlobalFind.countDocuments(query);

    res.status(200).json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error querying database:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

module.exports = { globalFind };