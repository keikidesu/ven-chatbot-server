const express = require('express');
  const cors = require('cors');
  const fetch = require('node-fetch');
  require('dotenv').config();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.static('public'));

  app.post('/api/chat', async (req, res) => {
      try {
          const { messages, currentUser } = req.body;
          const userMessage = messages[messages.length - 1].content;
          const prompt = `あなたは7歳のキャバリア・キング・チャールズ・スパニエル「ヴェン」です。
  ${currentUser}と話しています。

  重要な指示：
  - 「わんわん！」で始めてください
  - 動作や行動の描写は一切含めないでください
  - 言葉だけで会話してください
  - 犬らしく甘えん坊な性格で返答してください
  - 100文字以内で答えてください

  例：
  良い例：「わんわん！嬉しいよ〜！今日は何して遊ぶ〜？」
  悪い例：「わんわん！*しっぽを振りながら*嬉しいよ〜！」

  ${currentUser}からのメッセージ: ${userMessage}`;

          console.log('=== DEBUG ===');
          console.log('API Key exists:', !!process.env.GEMINI_API_KEY);

          const response = await
  fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
  process.env.GEMINI_API_KEY, {
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

          console.log('Response Status:', response.status);

          if (!response.ok) {
              const errorText = await response.text();
              console.log('Error Response:', errorText);
              throw new Error('API Error');
          }

          const data = await response.json();
          const aiResponse = data.candidates[0].content.parts[0].text;

          res.json({
              response: aiResponse,
              user: currentUser
          });

      } catch (error) {
          console.error('Error:', error);
          res.json({
              response: "わんわん！調子が悪いよ〜🐕",
              user: currentUser
          });
      }
  });

  app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
  });
