import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import twit from 'twit';
import fs from 'fs';

puppeteer.use(StealthPlugin());

var T = new twit({
    consumer_key: '***REMOVED***',
    consumer_secret: '***REMOVED***',
    access_token: '***REMOVED***',
    access_token_secret: '***REMOVED***'
});
'>Sold Out<'

var Website = {
    Amazon: {
        console: {
            title: "Amazon PS5 Console: ",
            check: "Currently unavailable.",
            notify: true,
            stock: false,
            url: "https://www.amazon.com/PlayStation-5-Console/dp/B08FC5L3RG?ref_=ast_sto_dp"
        },
        digital: {
            title: "Amazon PS5 Digital: ",
            check: "Currently unavailable.",
            notify: true,
            stock: false,
            url: "https://www.amazon.com/PlayStation-5-Digital/dp/B08FC6MR62?ref_=ast_sto_dp"
        },
    },
    BestBuy: {
        console: {
            title: "BestBuy PS5 Console: ",
            check: '>Sold Out<',
            notify: true,
            stock: false,
            url: "https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149"
        },
        digital: {
            title: "BestBuy PS5 Digital: ",
            check: '>Sold Out<',
            notify: true,
            stock: false,
            url: "https://www.bestbuy.com/site/sony-playstation-5-digital-edition-console/6430161.p?skuId=6430161"
        },
    },
    GameStop: {
        console: {
            title: "GameStop PS5 Console: ",
            check: '"Not Available"',
            notify: true,
            stock: false,
            url: "https://www.gamestop.com/video-games/playstation-5/consoles/products/playstation-5/11108140.html?condition=New"
        },
        digital: {
            title: "GameStop PS5 Digital: ",
            check: '"Not Available"',
            notify: true,
            stock: false,
            url: "https://www.gamestop.com/video-games/playstation-5/consoles/products/playstation-5-digital-edition/225171.html",
        },
    },
    Walmart: {
        console: {
            title: "Walmart PS5 Console: ",
            check: "Oops! This item is unavailable or on backorder.",
            notify: true,
            stock: false,
            url: "https://www.walmart.com/ip/PlayStation5-Console/363472942"
        },
        digital: {
            title: "Walmart PS5 Digital: ",
            check: "Oops! This item is unavailable or on backorder.",
            notify: true,
            stock: false,
            url: "https://www.walmart.com/ip/PlayStation5-Console/493824815",
        },
    },
    Adorama: {
        console: {
            title: "Adorama PS5 Console: ",
            check: "Temporarily not available",
            notify: true,
            stock: false,
            url: "https://www.adorama.com/so3005718.html",
        },
        digital: {
            title: "Adorama PS5 Digital: ",
            check: "Temporarily not available",
            notify: true,
            stock: false,
            url: "https://www.adorama.com/so3005719.html",
        },
    }
};

function tweetMessage(message, toID) {
    T.post('direct_messages/events/new', {
        "event": {
            "type": "message_create",
            "message_create": {
                "target": {
                    "recipient_id": toID
                },
                "message_data": {
                    "text": message,
                }
            }
        }
    },
        function (err, data, response) {
            //console.log(data);
        });
}

async function scrape(Website, page) {
    await page.goto(Website.url, { waitUntil: 'networkidle2' });
    const consoleBody = await page.content();
    //fs.writeFile('Output.txt', consoleBody, (err) => { if (err) throw err; });
    const consoleOutOfStock = await consoleBody.includes(Website.check);
    Website.stock = consoleOutOfStock ? false : true;
    if (Website.stock && Website.notify) {
        tweetMessage(Website.title + 'In Stock!' + '\n' + Website.url, '1351684980267601921');
        Website.notify = false;
    } else if (Website.stock == false) {
        Website.notify == true;
    }
    console.log(Website.title, Website.stock ? "In Stock" : "Out of Stock");
}

async function scrapePS5Stock() {
    // Initialization of puppeteer
    const browser = await puppeteer.launch({
        args: ['--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-infobars',
            '--window-position=0,0',
            '--ignore-certificate-errors',
            '--ignore-certificate-errors-spki-list',
        ],
        headless: true,
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();

    // Content/Tracker Blocking
    await page.setRequestInterception(true);
    page.on("request", r => {
        if (["image", "stylesheet", "font", "media", "script"].indexOf(r.resourceType()) !== -1) {
            r.abort();
        } else {
            r.continue();
        }
    });

    // Console
    await scrape(Website.Amazon.console, page);
    await scrape(Website.BestBuy.console, page);
    await scrape(Website.GameStop.console, page);
    await scrape(Website.Walmart.console, page);
    await scrape(Website.Adorama.console, page);

    // Digital
    await scrape(Website.Amazon.digital, page);
    await scrape(Website.BestBuy.console, page);
    await scrape(Website.GameStop.digital, page);
    await scrape(Website.Walmart.digital, page);
    await scrape(Website.Adorama.digital, page);

    await browser.close();
}

//setInterval(scrapePS5Stock(), 1000 * 60 * Math.random() * 3);

scrapePS5Stock();
