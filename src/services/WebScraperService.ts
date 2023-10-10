import axios from 'axios';
import * as cheerio from 'cheerio';

export default class WebScraperService {
  private static _instance: WebScraperService = new WebScraperService();

  constructor() {
    if (WebScraperService._instance) {
      throw new Error('Error: Instantiation failed: Use DatabaseService.getInstance() instead of new.');
    }
    WebScraperService._instance = this;
  }

  public static getInstance(): WebScraperService {
    return WebScraperService._instance;
  }

  async scrapeWebsite(url: string): Promise<string> {
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      var articlesText = '';

      if (url.includes('investorplace')) {
        const articleElements = $('div');
        articleElements.each((index, element) => {
          if (index === 55) {
            articlesText = $(element).text();
          }
        });
      }

      if (url.includes('fool.com')) {
        const articleElements = $('div');
        articleElements.each((index, element) => {
          if (index === 256) {
            articlesText = $(element).text();
          }
        });
      }

      if (url.includes('seekingalpha')) {
        const articleElements = $('article');
        articleElements.each((index, element) => {
          if (index === 0) {
            articlesText = $(element).text();
          }
        });
      }

      if (url.includes('zacks.com')) {
        const articleElements = $('article');
        articleElements.each((index, element) => {
          if (index === 1) {
            articlesText = $(element).text();
          }
        });
      }

      if (url.includes('reuters')) {
        const articleElements = $('article');
        articleElements.each((index, element) => {
          if (index === 0) {
            articlesText = $(element).text();
          }
        });
      }

      if (url.includes('investopedia')) {
        const articleElements = $('article');
        articleElements.each((index, element) => {
          if (index === 0) {
            articlesText = $(element).text();
          }
        });
      }

      return articlesText;
    } catch (error) {
      //console.error(`Error scraping ${url}: ${error.message}`);
      return '';
    }
  }
}
