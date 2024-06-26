const http = require('http');
const TelegramBot = require('node-telegram-bot-api');

const token = '6922022031:AAG68hbf-kElixJRIBHUD60-VykLAp7mlAg';
const bot = new TelegramBot(token, { polling: true });

const BANNED_WORDS = ['scam', 'spam', 'scammers', 'scammer', 'fake'];

bot.on('polling_error', (error) => {
  console.error(`[polling_error]: ${error.code} - ${error.message}`);
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const messageId = msg.message_id;
  const userMessage = msg.text;

  if (userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();
    const isBanned = BANNED_WORDS.some(word => lowerCaseMessage.includes(word.toLowerCase()));

    if (isBanned) {
      bot.deleteMessage(chatId, messageId)
        .then(() => {
          bot.banChatMember(chatId, userId)
            .then(() => {
              bot.sendMessage(chatId, `User ${msg.from.first_name} has been banned for using a banned word or phrase.`);
            })
            .catch((error) => {
              bot.sendMessage(chatId, `Failed to ban user: ${error.message}`);
            });
        })
        .catch((error) => {
          console.error(`Failed to delete message: ${error.message}`);
        });
    }
  }
});

bot.onText(/\/customban/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Hello! I will ban users who use specific words or phrases.');
});

// Create an HTTP server to bind to a port
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Telegram bot is running.');
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
