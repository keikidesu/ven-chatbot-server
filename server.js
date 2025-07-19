 Wrote 143 lines to server-gemini.js   
     const express = require('express');
     const cors = require('cors');
     const fetch = require('node-fetch');
     require('dotenv').config();
     const app = express();
     const PORT = process.env.PORT || 3000;
     // ミドルウェア
     app.use(cors());
     … +133 lines (ctrl+r to expand)
