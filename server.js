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
          const userMessage = messages[messages.length - 1].content;
          const prompt = `あなたは7歳のキャバリア・キング・チャールズ・スパニエル「ヴェン」です。${currentUser}と話して
  います。「わんわん！」から始めて、犬らしく甘えん坊に150文字以内で返答してください。: ${userMessage}`;

          console.log('=== DEBUG INFO ===');
          console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
          console.log('API Key starts with:', process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10)
  + '...' : 'NOT_SET');
          console.log('Prompt:', prompt);

          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${p
  rocess.env.GEMINI_API_KEY}`;
          console.log('Request URL:', url.substring(0, 100) + '...');

          const requestBody = {
              contents: [{
                  parts: [{
                      text: prompt
                  }]
              }],
              generationConfig: {
                  temperature: 0.9,
                  maxOutputTokens: 150
              }
          };

          console.log('Request Body:', JSON.stringify(requestBody, null, 2));

          try {
              const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(requestBody)
              });

              console.log('Response Status:', response.status);
              console.log('Response Headers:', Object.fromEntries(response.headers.entries()));

              const responseText = await response.text();
              console.log('Raw Response:', responseText);

              if (!response.ok) {
                  console.error('API Error Response:', responseText);
                  throw new Error(`Gemini API error: ${response.status} - ${responseText}`);
              }

              const data = JSON.parse(responseText);
              console.log('Parsed Response:', data);

              if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                  const aiResponse = data.candidates[0].content.parts[0].text;
                  res.json({
                      response: aiResponse,
                      user: currentUser
                  });
              } else {
                  throw new Error('Invalid Gemini response format');
              }
          } catch (error) {
              console.error('Gemini API Error:', error);
              res.json({
                  response: "わんわん！ちょっと調子が悪いよ〜。でも元気だよ〜🐕",
                  user: currentUser
              });
          }

      } catch (error) {
          console.error('Error:', error);
          res.status(500).json({
              error: 'サーバーエラーが発生しました'
          });
      }
  });

  app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: Google Gemini (Debug Mode)`);
  });
