# BDS Manager

このアプリの大まかなディレクトリ構成
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
        │   │   ├── mongodb/ MongoDB処理
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