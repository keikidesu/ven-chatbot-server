const express = require('express');
  const cors = require('cors');
  const fetch = require('node-fetch');
  require('dotenv').config();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.static('public'));

  const usageTracker = new Map();
  const HOURLY_LIMIT = 100;

  function checkUsageLimit(ip) {
      const now = Date.now();
      const hour = Math.floor(now / (1000 * 60 * 60));
      const key = `${ip}-${hour}`;

      const count = usageTracker.get(key) || 0;
      if (count >= HOURLY_LIMIT) {
          return false;
      }

      usageTracker.set(key, count + 1);
      return true;
  }

  app.post('/api/chat', async (req, res) => {
      try {
          const clientIP = req.ip || req.connection.remoteAddress;
          if (!checkUsageLimit(clientIP)) {
              return res.status(429).json({
                  error: '使用量制限に達しました。1時間後に再度お試しください。'
              });
          }

          const { messages, currentUser } = req.body;

          if (!messages || !Array.isArray(messages)) {
              return res.status(400).json({ error: 'メッセージが無効です' });
          }

          const userMessage = messages[messages.length - 1].content;

          const prompt = `あなたは7歳のキャバリア「ヴェン」です。${currentUser}と話しています。「わんわん！」から始めて
  、犬らしく甘えん坊に返答してください。: ${userMessage}`;

          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest
  :generateContent?key=${process.env.GEMINI_API_KEY}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  contents: [{
                      parts: [{
                          text: prompt
                      }]
                  }]
              })
          });

          if (!response.ok) {
              throw new Error('Gemini API error');
          }

          const data = await response.json();
          const aiResponse = data.candidates[0].content.parts[0].text;

          res.json({
              response: aiResponse,
              user: currentUser
          });

      } catch (error) {
          console.error('Error:', error);
          res.status(500).json({
              error: 'サーバーエラーが発生しました'
          });
      }
  });

  app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: Google Gemini`);
  });
