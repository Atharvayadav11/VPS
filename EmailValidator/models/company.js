// models/company.js - Updated to store LinkedIn information
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  // LinkedIn-specific fields
  linkedinSlug: {
    type: String,
    trim: true
  },
  linkedinUrn: {
    type: String,
    trim: true
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  isCatchAll: {
    type: Boolean,
    default: false
  },
  verifiedPatterns: [{
    pattern: {
      type: String,
      required: true
    },
    usageCount: {
      type: Number,
      default: 1
    },
    lastVerified: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Create compound index for better lookups
companySchema.index({ name: 1, linkedinSlug: 1 });
companySchema.index({ domain: 1 });
companySchema.index({ linkedinSlug: 1 });

module.exports = mongoose.model('Company', companySchema);
