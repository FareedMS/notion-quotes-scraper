import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { title } from 'process';

async function scrapeAllQuotes(startUrl) {
  let url = startUrl;
  let allQuotes = [];

  while (url) {
    console.log(`🔎 Scraping ${url}`);

    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Scrape all quotes on this page
    $('.quote').each((index, element) => {
      const text = $(element).find('.text').text();
      const author = $(element).find('.author').text();
      allQuotes.push({ text, author });
    });

    // Check if there is a NEXT page
    const nextLink = $('.pager .next a').attr('href');
    if (nextLink) {
      url = `https://quotes.toscrape.com${nextLink}`; // Go to next page
    } else {
      url = null; // No more pages
    }
  }

  console.log(`✅ Scraped ${allQuotes.length} quotes`);
  return allQuotes;
}
let a = 1;
const NOTION_TOKEN = process.env.NOTION_TOKEN2;
const DATABASE_ID = process.env.NOTION_DB_scrap;
const BOT_TOKEN = process.env.BOT_TOKEN;
const YOUR_CHAT_ID = process.env.YOUR_CHAT_ID;
const quotes = await scrapeAllQuotes('https://quotes.toscrape.com/');
for (const quote of quotes) {
  const text = quote.text;
  const author = quote.author;

  const url = 'https://api.notion.com/v1/pages';
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${NOTION_TOKEN}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      parent: { database_id: DATABASE_ID },
      properties: {
        SL_NO: { number: a },
        AUTHOR: { title: [{ text: { content: author } }] },
        QUOTE: { rich_text: [{ text: { content: text } }] }
      }
    })
  }

  const res = await fetch(url, options);
  const data = await res.json();
  a++;
}
 
const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
const message = `✅ Scraped ${quotes.length} quotes`;

await fetch(telegramUrl, {
   method: 'POST',
   headers: { 'Content-Type': 'application/json' },
   body: JSON.stringify({
      chat_id: YOUR_CHAT_ID,
      text: message
    })
});
