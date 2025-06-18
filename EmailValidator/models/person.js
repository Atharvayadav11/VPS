// models/person.js - Updated to store LinkedIn information
const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  domain: String,
  
  // LinkedIn-specific fields
  publicIdentifier: {
    type: String,
    trim: true
  },
  profileId: {
    type: String,
    trim: true
  },
  headline: {
    type: String,
    trim: true
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  
  // Position and education info
  currentPosition: String,
  joiningDate: String,
  phone: String,
  educationalInstitute: String,
  previousCompanies: [String],
  qualifications: [String],
  
  // Email verification data
  verifiedEmail: String,
  emailVerifiedAt: Date,
  allTestedEmails: [{
    email: String,
    valid: Boolean,
    reason: String,
    details: String,
    testedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Create indexes for faster lookups
personSchema.index({ firstName: 1, lastName: 1, company: 1 });
personSchema.index({ publicIdentifier: 1 });
personSchema.index({ profileId: 1 });
personSchema.index({ verifiedEmail: 1 });

module.exports = mongoose.model('Person', personSchema);