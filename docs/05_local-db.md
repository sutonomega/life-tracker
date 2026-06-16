# ローカルDBの作り方

開発・テスト用にUbuntuサーバー内へPostgreSQLを作る手順。

## PostgreSQLを入れる

sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl status postgresql

## DBを作る

sudo -u postgres psql

CREATE DATABASE life_tracker;
CREATE USER galpachi WITH PASSWORD '任意のパスワード';
ALTER USER galpachi CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE life_tracker TO galpachi;
\q

## publicスキーマの権限を付ける

sudo -u postgres psql -d life_tracker

GRANT ALL ON SCHEMA public TO galpachi;
ALTER SCHEMA public OWNER TO galpachi;
\q

## .envを作る

DATABASE_URL="postgresql://galpachi:任意のパスワード@localhost:5432/life_tracker"

## migrationを実行する

npm install
npm exec prisma migrate dev

## 動作確認

npm run build
npm run dev

## 注意

本番DBの DATABASE_URL は Vercel 側で管理する。

ローカル確認では本番DBではなくローカルDBを利用する。
