const websites = [
    {
        "title": "Ferchau",
        "url": "https://freelance.ferchau.com",
        "actionSteps": {
          1: {
            "type": "getByRole",
            "selector": ".cookie-banner__button",
            "selectorObject": { name: 'Cookie-Einstellungen' },            
            "action": "click"
          },
          2: {
            "type": "getByText",
            "selector": "Funktionell",
            "action": "click"
          },
          3: {
            "type": "getByRole",
            "selector": "button",
            "selectorObject": { name: 'Einstellungen speichern' },
            "action": "click"
          },
          4: {
            "type": "getByLabel",
            "selector": "Suchbegriff",
            "action": "click"
          },
          5: {
            "type": "getByLabel",
            "selector": "Suchbegriff",
            "action": "fill",
            "value": "Javascript"
          },
          6: {
            "type": "getByRole",
            "selector": "button",
            "selectorObject": { name: ' Suchen' },            
            "action": "click"
          }
        },
        "rules" : {
            "itemList": {
              "type": "classSelector",
              "selectorValue": "search-result__projects-list",
              "attribute": null,
              "parent": null
            },  
            "item": {
              "type": "classSelector",
              "selectorValue": "search-result__projects-item",
              "attribute": null,
              "parent": "itemList"
            },
            "url": {
              "type": "classSelector",
              "selectorValue":null,
              "attribute": "href",
              "parent": "item"
            },  
            "title": {
              "type": "classSelector",
              "selectorValue": "search-result__projects-item-title",
              "attribute": "textContent",
              "parent": "item"
            },
            "location": {
              "type": "classSelector",
              "selectorValue": "search-result__projects-item-location",
              "attribute": "textContent",
              "parent": "item"
            },
            "duration": {
              "type": "classSelector",
              "selectorValue": "search-result__projects-item-duration",
              "attribute": "textContent",
              "parent": "item"
            },
            "date": {
              "type": "classSelector",
              "selectorValue": "search-result__projects-item-date",
              "attribute": "textContent",
              "parent": "item"
            }
            }
        },
        {
            "title": "Freeelancermap",
            "url": "https://www.freelancermap.de/projektboerse.html?query=Javascript&countries%5B%5D=1&sort=1&pagenr=1",
            "rules" : {
                "itemList": {
                  "type": "classSelector",
                  "selectorValue": "project-list",
                  "attribute": null,
                  "parent": null
                },  
                "item": {
                  "type": "classSelector",
                  "selectorValue": "project-container",
                  "attribute": null,
                  "parent": "itemList"
                },
                "url": {
                  "type": "classSelector",
                  "selectorValue": "project-title",
                  "attribute": "href",
                  "parent": "item"
                },  
                "title": {
                  "type": "classSelector",
                  "selectorValue": "project-title",
                  "attribute": "textContent",
                  "parent": "item"
                },
                "location": {
                  "type": "classSelector",
                  "selectorValue": "project-location",
                  "attribute": "textContent",
                  "parent": "item"
                },
                "duration": {
                  "type": "classSelector",
                  "selectorValue": "project-title",
                  "attribute": "textContent",
                  "parent": "item"
                },
                "date": {
                  "type": "classSelector",
                  "selectorValue": "project-title",
                  "attribute": "textContent",
                  "parent": "item"
                }
            }
        }
];

export default websites;