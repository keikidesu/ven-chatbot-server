# ヴェンチャットボット サーバー版

共有APIキーでみんなが使えるヴェンのAIチャットボットです。

## 特徴

- 🔑 APIキー入力不要（サーバー側で管理）
- 👥 家族みんなで利用可能
- 🛡️ 使用量制限付き（1時間100回）
- 🚀 無料デプロイ可能

## セットアップ

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
cp .env.example .env
```

`.env`ファイルを編集してOpenAI APIキーを設定：
```
OPENAI_API_KEY=your_actual_api_key_here
```

### 3. ローカル実行
```bash
npm start
```

http://localhost:3000 でアクセス可能

## デプロイ

### Railway（推奨）
1. https://railway.app でアカウント作成
2. GitHub連携でリポジトリをデプロイ
3. 環境変数でOPENAI_API_KEYを設定

### Render
1. https://render.com でアカウント作成
2. Web Serviceとしてデプロイ
3. 環境変数を設定

## 使用量管理

- IPアドレスベースで1時間あたり100リクエスト制限
- 制限に達した場合は1時間待機が必要
- 必要に応じて`server.js`の`HOURLY_LIMIT`を調整

## 安全性

- APIキーはサーバー側でのみ管理
- フロントエンドには一切露出されません
- 使用量制限で予期しない大量使用を防止