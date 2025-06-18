// utils/patternGenerator.js
const { exec } = require('child_process');
const path = require('path');

/**
 * Generate potential email patterns based on first name and last name
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} domain - Company domain
 * @returns {Array} - List of potential email addresses
 */
function generateEmailPatterns(firstName, lastName, domain) {
  // Normalize inputs
  firstName = firstName.toLowerCase().trim();
  lastName = lastName.toLowerCase().trim();
  domain = domain.toLowerCase().trim();
  
  // First initial
  const firstInitial = firstName.charAt(0);
  // Last initial
  const lastInitial = lastName.charAt(0);
  
  // Define common patterns
  const patterns = [
    // Most common patterns
    `${firstName}.${lastName}@${domain}`,
    `${firstName}${lastName}@${domain}`,
    `${firstInitial}.${lastName}@${domain}`,
    `${firstInitial}${lastName}@${domain}`,
    `${firstName}_${lastName}@${domain}`,
    `${firstName}@${domain}`,
    `${lastName}.${firstName}@${domain}`,
    `${lastName}${firstName}@${domain}`,
    `${lastName}${firstInitial}@${domain}`,
    `${firstInitial}${lastInitial}@${domain}`,
    // Less common but still used
    `${lastName}_${firstName}@${domain}`,
    `${firstName}-${lastName}@${domain}`,
    `${firstName}.${lastInitial}@${domain}`,
    `${firstName}${lastInitial}@${domain}`,
    `${firstName}_${lastInitial}@${domain}`,
    `${firstName}${lastName[0]}${lastName[1]}@${domain}`,
    `${firstInitial}${lastName[0]}${lastName[1]}@${domain}`
  ];
  
  return patterns;
}

/**
 * Generate domain from company name (fallback)
 * @param {string} companyName - Name of the company
 * @returns {string} - Potential domain
 */
function guessDomainFromCompanyName(companyName) {
  // Remove special characters and spaces
  const normalizedName = companyName.toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '');
  
  return [
    `${normalizedName}.com`,
    `${normalizedName}.co`,
    `${normalizedName}.io`,
    `${normalizedName}.net`
  ];
}

/**
 * Scrape domain from LinkedIn using Python script
 * @param {string} companySlug - LinkedIn company slug
 * @returns {Promise<string|null>} - Company domain or null if failed
 */
function scrapeDomainFromLinkedIn(companySlug) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', 'script.py');
    const command = `python3 ${scriptPath} ${companySlug}`;
    
    console.log(`Scraping domain for company slug: ${companySlug}`);
    
    exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        resolve(null);
        return;
      }
      
      if (stderr && stderr.trim()) {
        console.error(`Python script stderr: ${stderr.trim()}`);
      }
      
      const domain = stdout.trim();
      if (domain) {
        console.log(`Successfully scraped domain: ${domain}`);
        resolve(domain);
      } else {
        console.log(`No domain found for company slug: ${companySlug}`);
        resolve(null);
      }
    });
  });
}

module.exports = {
  generateEmailPatterns,
  guessDomainFromCompanyName,
  scrapeDomainFromLinkedIn
};
