# nvidia-watcher-bot
Nvidia store stock watcher bot

# Running
You can use the prebuilt docker image

```
docker run -e TELEGRAM_BOT_TOKEN=xxxx:1321 r1cebank/nvidia-watcher-bot
```

Make sure replace `TELEGRAM_BOT_TOKEN` to your own bot token

# Developing
Clone the repo and run

```
npm i
```
If you want to add your own site or use a different selector just modify the `index.js` file. Currently its pointing to Nvidia Canada store.

# Requirements

To run the bot yourself, you need your own bot token that you got from botfather and supply them in `TELEGRAM_BOT_TOKEN` as environment variable


To use the bot I am running, add to your telegram: http://t.me/nvidia_stock_watcher_bot


Again, 🖕 you all scalpers.
