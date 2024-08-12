var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as Express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { chromium } from 'playwright';
import { JSDOM } from 'jsdom';
import websites from "../data/websitedata";
// Load environment variables from .env.local file
dotenv.config({ path: ".env.local" });
// Create a single supabase client for interacting with your database
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
var router = Express.Router();
function resetData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Delete all existing data from the table
            let { error: deleteError } = yield supabase.from('websites').delete().neq('id', 0);
            if (deleteError)
                throw deleteError;
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
function insertData(datasets) {
    return __awaiter(this, void 0, void 0, function* () {
        // Array of datasets to be inserted
        /*   const datasets = [
            { name: 'Dataset 1', value: 'Value 1' },
            { name: 'Dataset 2', value: 'Value 2' },
            // Add more datasets as needed
          ]; */
        try {
            // Insert new datasets into the table
            let { data, error: insertError } = yield supabase.from('websites').insert(datasets);
            if (insertError)
                throw insertError;
            console.log('Data inserted successfully:', data);
        }
        catch (error) {
            console.error('Error:', error);
        }
    });
}
/* GET home page. */
router.get("/", function (req, res, next) {
    // Wrap the async code in an IIFE (Immediately Invoked Function Expression)
    (() => __awaiter(this, void 0, void 0, function* () {
        try {
            const { data, error } = yield supabase.from("websites").select();
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
                    const arrayOfStrings = (data || []).map((obj) => {
                        return Object.values(obj).map((value) => String(value));
                    });
                    data[0] = arrayOfStrings;
                    console.log("Datasrsrs:", data);
                    //res.render('index', { title: 'Express', tableData: data });      
                    yield scrapeWebsites(req, res, next);
                    //res.send('respond with dataau: ' + JSON.stringify(data));
                }
            }
        }
        catch (err) {
            console.error("Error fetching data:", err);
            // Handle the error appropriately, e.g., send an error response
            res.status(500).send("Internal Server Error");
        }
    }))();
});
class ResponseDTO {
    setLocation(location) {
        this.location = location;
    }
    setDate(date) {
        this.date = date;
    }
    setDuration(duration) {
        this.duration = duration;
    }
    setTitle(title) {
        this.title = title;
    }
    setUrl(url) {
        this.url = url;
    }
    getUrl() {
        return this.url;
    }
    constructor(baseUrl) {
        this.title = null;
        this.baseUrl = null;
        this.url = null;
        this.location = null;
        this.date = null;
        this.duration = null;
        this.baseUrl = baseUrl;
    }
}
const extractElementByRule = function (htmlElement, rule) {
    if (!rule.selectorValue) {
        return htmlElement;
    }
    return htmlElement.querySelector(`.${rule.selectorValue}`);
};
const extractElementsByRule = function (htmlElement, rule) {
    if (!rule.selectorValue) {
        return htmlElement;
    }
    return htmlElement === null || htmlElement === void 0 ? void 0 : htmlElement.querySelectorAll(`.${rule.selectorValue}`);
};
const extractContentByRule = function (htmlElement, rule) {
    const element = (rule.selectorValue) ? htmlElement === null || htmlElement === void 0 ? void 0 : htmlElement.querySelector(`.${rule.selectorValue}`) : htmlElement;
    if (element) {
        return element[rule === null || rule === void 0 ? void 0 : rule.attribute];
    }
};
function capitalizeFirstLetter(string) {
    if (!string)
        return string; // Handle empty or null strings
    return string.charAt(0).toUpperCase() + string.slice(1);
}
const extractJobLinks = function (document, rules, baseUrl) {
    const responseDTOS = [];
    const itemListRule = rules["itemList"];
    const itemListElement = extractElementByRule(document, itemListRule);
    const itemListItemsRule = rules["item"];
    const itemElements = extractElementsByRule(itemListElement, itemListItemsRule);
    (itemElements || []).forEach((itemElement) => {
        const responseDTO = new ResponseDTO(baseUrl);
        const attributeRuleKeys = Object.keys(rules).filter((key) => key !== "item" && key !== "itemList");
        attributeRuleKeys.forEach((key) => {
            const rule = rules[key];
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
};
function getBaseUrl(url) {
    try {
        const urlObj = new URL(url);
        return `${urlObj.protocol}//${urlObj.hostname}`;
    }
    catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}
const scrapeWebsite = function (page, url, rules, req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield page.goto(url);
            const baseUrl = getBaseUrl(page.url());
            yield page.waitForTimeout(5000);
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
            const pageContent = yield page.content();
            const dom = new JSDOM(pageContent);
            const htmlDocument = dom.window.document;
            const responseDTOs = extractJobLinks(htmlDocument, rules, baseUrl);
            return responseDTOs;
        }
        catch (err) {
            console.error("Error:", err);
            //res.status(500).json({ error: 'Internal Server Error' });
        }
    });
};
function processWebsites(page, websites, req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const websiteResponseDTOs = {};
        for (const website of websites) {
            const responseDTOs = yield scrapeWebsite(page, website.url, website.rules, req, res, next);
            websiteResponseDTOs[website.url] = responseDTOs || [];
            console.log("ResponseDTOs:", responseDTOs);
        }
        return websiteResponseDTOs;
    });
}
const scrapeWebsites = function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield chromium.launch();
        const context = yield browser.newContext();
        const headers = new Map();
        headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3");
        context.setExtraHTTPHeaders(Object.fromEntries(headers));
        const page = yield context.newPage();
        const websiteResponseDTOs = yield processWebsites(page, websites, req, res, next);
        yield page.close();
        yield browser.close();
    });
};
module.exports = router;
//# sourceMappingURL=index.js.map