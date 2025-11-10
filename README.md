# BDS Manager

## 1. アプリケーションの概要
Minecraft Bedrock Editionのマルチプレイサーバーを1つのインスタンスとして扱い、Web上で起動・管理ができるアプリケーションです。
GUI操作により、難易度変更・サーバー起動・バックアップ・ログなどを一括で管理できます。

## 2. 設計方針
本プロジェクトでは、初めて「設計方針・思想を明確化した開発」を行い、 **Azure/AWSライクなインフラ管理思想の導入と、開発者としての成長が見えるコードベース** を重視しています。

## 3. 技術スタック
### 1. 主要ライブラリ
- express, mysql2, mongoose, socket.io, node-cron, winston, zod
（詳細バージョンは `package.json` を参照）

### 2. 「なぜこの技術を選定したのか」
- **Express:** 軽量で柔軟な構成を実現し、API開発を迅速かつ保守性に優れた設計にするため
- **MySQL:** ユーザー情報やログイン履歴など、整合性が必要な構造化データを管理するため
- **MongoDB:** BDSインスタンスのログやインスタンスの設定データなど、柔軟なデータ構造を格納するため
- **node-cron:** サーバー管理(アップデート等)・バックアップやカスタムジョブなどの定期タスク実行を実現
- **Socket.io:** サーバー状態をリアルタイムでフロントに反映するため

これらの技術選定により、設計思想で掲げる **「開発の柔軟性・保守性・拡張性・堅牢性を高め、品質の高いコードベースの実現」** を確立しています。

### 3. 大まかな理由
| 区分 | 使用技術 | 主な用途 |
|------|-----------|-----------|
| 言語 / ランタイム | Node.js (v22) / TypeScript | 全体の開発基盤 |
| フレームワーク | Express / React | APIとUI構築 |
| DB | MySQL / MongoDB | 構造・非構造データの分離管理 |
| 通信 | axios / socket.io | HTTP通信・リアルタイム通信 |
| ジョブ管理 | node-cron | 自動バックアップ / 定期実行 |
| ロギング | winston | サーバーログ出力と保存 |
| テスト | jest / ts-jest | 単体テスト |
| ビルド / 開発補助 | vite / ts-node / nodemon | 開発効率化 |

### 4. 開発環境・補助ツール
- **vite:** フロントエンドの高速ビルド環境
- **ts-node:** TypeScriptを直接実行するための開発環境
- **nodemon:** ファイル変更時に自動リスタート
- **jest / ts-jest:** 単体テスト環境

## ディレクトリ構成 
```
BDS-Manager/
└── app/
    ├── BDS-client Reactアプリ/
    │   ├── public/
    │   │   ├── style.css
    │   │   └── imgs/
    │   ├── src/
    │   │   ├── api/ API通信処理
    │   │   ├── components/ 各コンポーネント宣言
    │   │   ├── config/ jsonスキーマ定義
    │   │   ├── Hooks/ カスタムフック
    │   │   ├── pages/ 各ページ定義
    │   │   ├── types/ 汎用型宣言
    │   │   ├── utils/ 汎用関数
    │   │   ├── App.tsx
    │   │   └── main.tsx
    │   └── index.html
    └── src バックエンド/
        ├── api/
        ├── modules/
        ├── routes/
        │   ├── auth/
        │   └── v1/
        │       ├── api/ 通常api
        │       └── bds/ BDSインスタンス専用ルート
        ├── service/ 各サービス層/
        │   ├── auth/ セキュア系
        │   ├── cli/ コマンドライン(廃止予定)
        │   ├── db/
        │   │   ├── mongod/ MongoDB処理
        │   │   └── mysql/ MySQL処理
        │   ├── log/ ロギング
        │   ├── mailer/ Gmail等送信
        │   ├── process/ アプリ正常終了ロジック等
        │   ├── webhook/ Discord送信
        │   └── websocket/ Websocketイベントハンドラー
        ├── types/ 汎用型宣言
        ├── utils/ 汎用関数
        ├── obsidian/ BDSのインスタンスを実際に管理/
        │   ├── core/ BDSインスタンス管理の中核
        │   ├── monitor/ ログ・パフォーマンス監視
        │   ├── backup/ 自動バックアップ
        │   ├── jobs/ ジョブ管理
        │   ├── installer/ サーバーファイルのダウンロードetc.../
        │   │   ├── config/ 設定ファイルの読込・書込み・更新
        │   │   └── downloader/ サーバーファイルダウンロード
        │   └── utils/ 共通モジュール/
        │       ├── FileUtils.ts ファイル操作
        │       └── Unzip.ts ファイル解凍
        └── server.ts
```
