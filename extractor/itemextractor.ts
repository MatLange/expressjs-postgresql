import { JobItem } from "../dto/jobitem";

const extractElementByRule = function (htmlElement: any, rule: any) {
  if (!rule.selectorValue) {
    return htmlElement;
  }
  return htmlElement.querySelector(`.${rule.selectorValue}`) as HTMLElement;
};

const extractElementsByRule = function (htmlElement: any, rule: any) {
  if (!rule.selectorValue) {
    return htmlElement;
  }
  return htmlElement?.querySelectorAll(`.${rule.selectorValue}`);
};

const extractContentByRule = function (htmlElement: any, rule: any) {
  const element = rule.selectorValue
    ? htmlElement?.querySelector(`.${rule.selectorValue}`)
    : (htmlElement as HTMLElement);
  if (element) {
    return element[rule?.attribute as keyof HTMLElement];
  }
};

function capitalizeFirstLetter(string: string) {
  if (!string) return string; // Handle empty or null strings
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const extractJobItems = function (
  document: any,
  rules: any,
  baseUrl: any,
  websiteid: string
) {
  const jobItems: JobItem[] = [];
  const itemListRule = rules["itemList"];
  const itemListElement = extractElementByRule(document, itemListRule);

  const itemListItemsRule = rules["item"];
  const itemElements = extractElementsByRule(
    itemListElement,
    itemListItemsRule
  );

  (itemElements || []).forEach((itemElement: any) => {
    const jobItem = new JobItem(baseUrl, websiteid);
    const attributeRuleKeys = Object.keys(rules).filter(
      (key) => key !== "item" && key !== "itemList"
    );
    attributeRuleKeys.forEach((key) => {
      const rule = rules[key as keyof typeof rules];
      const content = extractContentByRule(itemElement, rule);
      if (content) {
        const functionName = "set" + capitalizeFirstLetter(key) || "";
        if (typeof jobItem[functionName] === "function") {
          jobItem[functionName](String(content));
        }
      }
    });

    if (jobItem) {
      const tt = jobItem.getUrl() || "";

      //const url = jobItem.geturl();
      jobItems.push(jobItem);
    }
  });

  return jobItems;
};
