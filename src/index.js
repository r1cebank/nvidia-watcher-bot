const fs = require('fs');
const low = require('lowdb');
const config = require('config');
const puppeteer = require('puppeteer');
const { Telegraf } = require('telegraf');
const interval = require('interval-promise');
const FileSync = require('lowdb/adapters/FileSync');

const logger = require('./logger');

const stockUrl = 'https://www.nvidia.com/en-ca/shop/geforce/?page=1&limit=9&locale=en-ca';
const waitSelectors = [
    '.product-container > div:nth-child(2) > h2:nth-child(1)',
    'a.featured-buy-link:nth-child(3)'
];
const expectedValues = ['NVIDIA GEFORCE RTX 3080'];

const checkSelectors = ['a.featured-buy-link:nth-child(3)'];
const ignoreValues = ['OUT OF STOCK'];

const adapter = new FileSync(config.get('db'));
const db = low(adapter);

db.defaults({ users: [] })
    .write();

// Create the telegraf bot instance
const bot = new Telegraf(config.get('telegram.token'));

bot.start((ctx) => {
    const currentUser = ctx.from.id;
    const userRecord = db.get('users')
        .find({ id: currentUser })
        .value();
    if (!userRecord) {
        db.get('users')
            .push({ id: currentUser })
            .write();
    }
    ctx.reply('Welcome to Nvidia Store watcher bot, if you are using this for scalping, FUCK YOU');
})
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('scalpers', (ctx) => ctx.reply('Fuck scalpers'))
bot.launch();

interval(async () => {
    logger.info(`refreshing ${stockUrl}`);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    await page.goto(stockUrl);
    await page.waitForSelector(waitSelectors[0]);
    await page.waitForSelector(waitSelectors[1]);
    const expectedValue = await (await page.$(waitSelectors[0])).evaluate((node) => node.innerText);
    logger.info(`Validation selector returns: ${expectedValue}`);

    // Validate we are on the right page
    if (!expectedValue === expectedValues[0]) {
        logger.info(`We are not on the right page, or page has modified, got: ${expectedValue}`);
    }

    // Checking the selectors before we sent stock information
    const checkValue = await (await page.$(checkSelectors[0])).evaluate((node) => node.innerText);

    if (checkValue !== ignoreValues[0]) {
        logger.info(`Something has changed, element went away or changed. Value: ${checkValue}`);
        await page.screenshot({ path: 'capture.png' });

        // Send mass notification & screenshot
        const users = db.get('users').value();
        console.log(users);
        users.forEach(user => {
            const { id } = user;
            try {
                bot.telegram.sendMessage(id, 'Store page changed');
                bot.telegram.sendPhoto(id, { source: fs.createReadStream('capture.png') });
            } catch (error) {
                logger.error(error);
            }
        })
    } else {
        logger.info(`Store has not changed, value : ${checkValue}`);
    }

    await browser.close();
}, parseInt(config.get('refreshPeriod')) * 1000)
