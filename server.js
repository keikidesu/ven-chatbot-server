const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 使用量制限（1時間あたりのリクエスト数）
const usageTracker = new Map();
const HOURLY_LIMIT = 100; // 1時間あたり100リクエスト

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

// OpenAI API エンドポイント
app.post('/api/chat', async (req, res) => {
    try {
        // 使用量制限チェック
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

        // OpenAI API呼び出し
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages,
                max_tokens: 150,
                temperature: 0.9
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('OpenAI API Error:', errorData);
            return res.status(response.status).json({
                error: 'AI応答の生成に失敗しました'
            });
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        res.json({ 
            response: aiResponse,
            user: currentUser 
        });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ 
            error: 'サーバーエラーが発生しました' 
        });
    }
});

// ヘルスチェック
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString() 
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});