// middleware/validator.js - Updated with new validation for LinkedIn data
/**
 * Validate request parameters for email verification with LinkedIn data
 */
function validateEmailLookupRequest(req, res, next) {
  const { firstName, lastName, positions } = req.body;
  
  if (!firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'First name and last name are required'
    });
  }
  
  if (!positions || !Array.isArray(positions) || positions.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'At least one position is required'
    });
  }
  
  // Check if the first position has required fields
  const currentPosition = positions[0];
  if (!currentPosition.companyName || !currentPosition.companySlug) {
    return res.status(400).json({
      success: false,
      message: 'Company name and company slug are required in positions'
    });
  }
  
  // Basic validation
  if (firstName.length < 2 || lastName.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'First name and last name must each be at least 2 characters'
    });
  }
  
  if (currentPosition.companyName.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Company name must be at least 2 characters'
    });
  }
  
  next();
}

module.exports = {
  validateEmailLookupRequest
};