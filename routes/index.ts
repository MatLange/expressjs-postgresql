import * as Express from "express"; 
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { chromium } from 'playwright';
import { Page } from 'playwright';
import  * as parse5 from 'parse5';
import { JSDOM } from 'jsdom'; 
import websites from "../data/websitedata";
import { Database } from "../data/supabase";

// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });

const table_websites = 'websites';
const table_websitedata = 'websitedata';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

var router = Express.Router();

async function resetData() {
  try {
    // Delete all existing data from the table
    let { error: deleteError } = await supabase.from(`${table_websitedata}`).delete().neq('id', 0);
    if (deleteError) throw deleteError;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function insertData(datasets: { [key: string]: ResponseDTO[] }) {
  try {
    // Filter and map data to match the schema
    const flattenedData = Object.values(datasets).flat() || [];
    const mappedData: Database['public']['Tables']['websitedata']['Insert'][] = flattenedData.map((item: any) => ({
      baseurl: item.baseUrl,
      //created_at: item.created_at,
      duration: item.duration,
      //id: item.id,
      location: item.location,
      title: item.title,
      websiteid: parseInt(item.websiteid),
    }));

    // Insert new datasets into the table
    const { data, error: insertError } = await supabase
      .from(`${table_websitedata}`)
      .insert(mappedData);    
    // Insert new datasets into the table
    const dataToInsert = Object.values(datasets).flat();
    if (insertError) throw insertError;

    console.log('Data inserted successfully:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

/* GET home page. */
router.get(
  "/",
  function (
    req: Express.Request,
    res: Express.Response,
    next: Express.NextFunction
  ) {
    // Wrap the async code in an IIFE (Immediately Invoked Function Expression)
    (async () => {
      try {
        const { data, error } = await supabase.from(`${table_websites}`).select();

        if (error) {
          console.error("Error fetching data:", error);
          throw error;
        }

        if (data) {
          // Safely read from the data array
          //console.log("Data:", data);
          // Example: Access the first element
          if ((data || []).length > 0) {
            //const valuesArray = Object.values(data[0] || {}).map(value => String(value));
            const arrayOfStrings = (data || []).map((obj: any) => {
              return Object.values(obj).map((value) => String(value));
            });
            data[0] = arrayOfStrings;
            console.log("Datasrsrs:", data);
            //res.render('index', { title: 'Express', tableData: data });      
            await scrapeWebsites(req, res, next);      
            //res.send('respond with dataau: ' + JSON.stringify(data));

        }
        }
        //res.send('respond with dataau: ' + JSON.stringify(data));
      } catch (err) {
        console.error("Error fetching data:", err);
        // Handle the error appropriately, e.g., send an error response
        res.status(500).send("Internal Server Error");
      }
      
    })();
  }
);

class ResponseDTO {
  websiteid: string | null = null;
  title: string | null = null;
  baseUrl: string | null = null;
  url: string | null = null;
  location: string | null = null;
  date: string | null = null;
  duration: string | null = null;
  [key: string]: string | null | ((value: string) => void); // Update index signature

  setLocation(location: string) {
    this.location = location;
  }

  setDate(date: string) {
    this.date = date;
  }
  setDuration(duration: string) {
    this.duration = duration;
  }

  setTitle(title: string) {
    this.title = title;
  }

  setUrl(url: string) {
    this.url = url;
  }

  getUrl() {
    return this.url;
  }

  constructor (baseUrl: string, websiteid: string) {
    this.baseUrl = baseUrl;
    this.websiteid = websiteid;
  }
}

const extractElementByRule = function(htmlElement: any, rule: any) {
  if (!rule.selectorValue) {
    return htmlElement;
  }  
  return htmlElement.querySelector(`.${rule.selectorValue}`) as HTMLElement;
}

const extractElementsByRule = function(htmlElement: any, rule: any) {
  if (!rule.selectorValue) {
    return htmlElement;
  }  
  return htmlElement?.querySelectorAll(`.${rule.selectorValue}`);
}

const extractContentByRule = function(htmlElement: any,  rule: any) {
  const element = (rule.selectorValue) ? htmlElement?.querySelector(`.${rule.selectorValue}`) : htmlElement as HTMLElement;
  if (element) {
    return element[rule?.attribute as keyof HTMLElement];
  }
}

function capitalizeFirstLetter(string:string) {
  if (!string) return string; // Handle empty or null strings
  return string.charAt(0).toUpperCase() + string.slice(1);
}


const extractJobLinks = function(document: any, rules: any, baseUrl:any, websiteid:string) {
  const responseDTOS: ResponseDTO[] = [];
  const itemListRule = rules["itemList"];
  const itemListElement = extractElementByRule(document, itemListRule);

  const itemListItemsRule = rules["item"];
  const itemElements = extractElementsByRule(itemListElement, itemListItemsRule);

  
  (itemElements || []).forEach((itemElement:any) => {
    const responseDTO = new ResponseDTO(baseUrl, websiteid);
    const attributeRuleKeys = Object.keys(rules).filter((key) => key !== "item" && key !== "itemList");
    attributeRuleKeys.forEach((key) => {
      const rule = rules[key as keyof typeof rules];
      const content = extractContentByRule(itemElement, rule);
      if (content) {
        const functionName = "set" + capitalizeFirstLetter(key) || "";
        if (typeof responseDTO[functionName] === 'function') {
          responseDTO[functionName](String(content));
        }
      }
    });
    
  
    if (responseDTO.getUrl()) {
      responseDTOS.push(responseDTO);
    }
  });

  return responseDTOS;
}

function getBaseUrl(url:string) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}

const scrapeWebsite = async function (
  page: Page,
  website: any,
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,

) {
  try {
    const websiteid = website.websiteid;
    const url = website.url;	
    const rules = website.rules;

    await page.goto(url); 

    const baseUrl = getBaseUrl(page.url());
    await page.waitForTimeout(5000);
 
/// Confirm cookies
/*   const cookieButton = await page.getByRole('button', { name: 'Cookie-Einstellungen' })
  if (cookieButton) {
    cookieButton.click();
    await page.getByText('Funktionell').click();
    await page.getByRole('button', { name: 'Einstellungen speichern' }).click();
  }
  
  // search term 
  await page.getByLabel('Suchbegriff').click();
  await page.getByLabel('Suchbegriff').fill('Javascript');
  await page.getByRole('button', { name: ' Suchen' }).click();

 await page.waitForSelector('.search-result'); // Replace with the actual selector for the search results

 await page.waitForTimeout(5000); */
    const pageContent = await page.content();

    const dom = new JSDOM(pageContent);
    const htmlDocument = dom.window.document; 
    const responseDTOs = extractJobLinks(htmlDocument, rules, baseUrl, websiteid);
  
    return responseDTOs;
  } catch (err) {
    console.error("Error:", err);
    //res.status(500).json({ error: 'Internal Server Error' });
  } 
} 

async function processWebsites(page: Page, websites: any[], req: any, res: any, next: any) {
  const websiteResponseDTOs: { [key: string]: ResponseDTO[] } = {};
  for (const website of websites) {
    const responseDTOs = await scrapeWebsite(page, website, req, res, next);
    websiteResponseDTOs[website.url] = responseDTOs || [];
    console.log("ResponseDTOs:", responseDTOs);
  }
  return websiteResponseDTOs;
}

const scrapeWebsites = async function (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const headers: Map<string, string> = new Map<string, string>();
  headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");
  context.setExtraHTTPHeaders(Object.fromEntries(headers));
  const page: Page = await context.newPage();

  const websiteResponseDTOs = await processWebsites(page, websites, req, res, next);
  await resetData()
  await insertData(websiteResponseDTOs);

  await page.close();
  await browser.close();     
}

//module.exports = router;
export { router as indexRouter };