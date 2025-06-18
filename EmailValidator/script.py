import time
import random
import json
import urllib.parse
import tldextract
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from fake_useragent import UserAgent
import re
import sys

class LinkedInScraper:
    def __init__(self, use_proxy=False):
        self.user_agent = UserAgent()
        self.use_proxy = use_proxy
        self.proxies = self.load_proxies() if use_proxy else []

    def load_proxies(self):
        return []

    def get_random_proxy(self):
        if not self.proxies:
            return None
        return random.choice(self.proxies)

    def setup_driver(self):
        options = uc.ChromeOptions()
        options.add_argument(f"--user-agent={self.user_agent.random}")
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--disable-notifications")
        options.add_argument("--disable-popup-blocking")
        options.add_argument("--disable-extensions")
        options.add_argument(f"--window-size={random.randint(1024, 1280)},{random.randint(768, 900)}")

        # Explicitly set Chrome binary location
        options.binary_location = "/usr/bin/google-chrome"

        if self.use_proxy:
            proxy = self.get_random_proxy()
            if proxy:
                options.add_argument(f"--proxy-server={proxy}")

        driver = uc.Chrome(options=options)
        driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
            'source': 'Object.defineProperty(navigator, "webdriver", { get: () => undefined })'
        })
        return driver

    def extract_website_from_html(self, html):
        """Extract website URL from LinkedIn company page HTML using regex"""
        if not html:
            return None

        try:
            # Method 1: Look for the website section with data-test-id="about-us__website"
            website_pattern = r'data-test-id="about-us__website".*?href="([^"]*)".*?>(https?://[^<]+)<'
            match = re.search(website_pattern, html, re.DOTALL)

            if match:
                href_url = match.group(1)
                display_url = match.group(2)

                # If it's a LinkedIn redirect, extract the actual URL
                if 'linkedin.com/redir/redirect?url=' in href_url:
                    url_match = re.search(r'url=([^&]+)', href_url)
                    if url_match:
                        actual_url = urllib.parse.unquote(url_match.group(1))
                        return self.extract_domain(actual_url)

                # Use the display URL
                return self.extract_domain(display_url)

            # Method 2: Look for JSON-LD structured data with sameAs
            json_pattern = r'"sameAs":"([^"]+)"'
            match = re.search(json_pattern, html)
            if match:
                return self.extract_domain(match.group(1))

            # Method 3: General website link pattern in about sections
            general_pattern = r'Website[^>]*>.*?href="[^"]*".*?>(https?://[^<]+)'
            match = re.search(general_pattern, html, re.DOTALL | re.IGNORECASE)
            if match:
                return self.extract_domain(match.group(1))

        except Exception as e:
            print(f"Error extracting website: {e}", file=sys.stderr)

        return None

    def extract_domain(self, url):
        """Extract root domain from URL using tldextract"""
        if not url:
            return None

        try:
            # Clean up the URL
            url = url.strip()

            # Add protocol if missing for proper parsing
            if not url.startswith(('http://', 'https://')):
                url = 'https://' + url

            # Use tldextract to get the root domain
            extracted = tldextract.extract(url)

            # Combine domain and suffix to get root domain (e.g., microsoft.com)
            if extracted.domain and extracted.suffix:
                root_domain = f"{extracted.domain}.{extracted.suffix}"
                return root_domain

            return None

        except Exception as e:
            print(f"Error parsing domain from {url}: {e}", file=sys.stderr)
            return None

    def scrape_page(self, url, target_specific_div=True):
        driver = None
        page_html = None
        website_domain = None

        try:
            driver = self.setup_driver()
            time.sleep(random.uniform(2, 4))
            driver.get(url)

            if target_specific_div:
                # Try to get just the website info quickly
                try:
                    # Wait for the about section to load
                    wait = WebDriverWait(driver, 8)
                    about_element = wait.until(
                        EC.presence_of_element_located((By.CSS_SELECTOR, '[data-test-id="about-us__website"]'))
                    )

                    # Extract website directly from the element
                    link_element = about_element.find_element(By.TAG_NAME, 'a')
                    if link_element:
                        href = link_element.get_attribute('href')
                        text = link_element.text

                        # Process LinkedIn redirect or direct URL
                        if 'linkedin.com/redir/redirect?url=' in href:
                            url_match = re.search(r'url=([^&]+)', href)
                            if url_match:
                                actual_url = urllib.parse.unquote(url_match.group(1))
                                website_domain = self.extract_domain(actual_url)
                        else:
                            website_domain = self.extract_domain(text)

                    # Get minimal HTML around the about section if needed
                    about_section = driver.find_element(By.CSS_SELECTOR, '.org-about-company-module, [data-test-id*="about"]')
                    page_html = about_section.get_attribute('outerHTML')

                except Exception as e:
                    print(f"Quick extraction failed, falling back to full page: {e}", file=sys.stderr)
                    # Fall back to full page load
                    time.sleep(random.uniform(3, 5))
                    page_html = driver.page_source
                    website_domain = self.extract_website_from_html(page_html)
            else:
                # Original full page scraping
                time.sleep(random.uniform(5, 7))
                page_html = driver.page_source
                website_domain = self.extract_website_from_html(page_html)

        except Exception as e:
            print(f"Error loading {url}: {e}", file=sys.stderr)
        finally:
            if driver:
                driver.quit()

        return page_html, website_domain

    def scrape_company_domain(self, company_slug):
        """Scrape domain for a single company slug"""
        linkedin_url = f"https://www.linkedin.com/company/{company_slug}/"
        
        try:
            html, website_domain = self.scrape_page(linkedin_url, target_specific_div=True)
            
            # If fast mode didn't get the domain, try extracting from HTML
            if not website_domain and html:
                website_domain = self.extract_website_from_html(html)
            
            return website_domain
            
        except Exception as e:
            print(f"Error scraping company {company_slug}: {e}", file=sys.stderr)
            return None

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <company_slug>", file=sys.stderr)
        sys.exit(1)
    
    company_slug = sys.argv[1]
    scraper = LinkedInScraper()
    domain = scraper.scrape_company_domain(company_slug)
    
    if domain:
        print(domain)
    else:
        print("", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()