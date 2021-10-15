# Placequran Monorepo

This repo contains 3 main components. You can install dependencies for all component by running `yarn` in root folder, or by component by run `yarn` in the component folder.

Every component has different command available, and need to be run inside their folder.

## 1. Serverless

A serverless project that bootstraping all aws components.

| Command    | Description                         |
| ---------- | ----------------------------------- |
| yarn dev   | Run serverless offline              |
| yarn test  | Run unit test                       |
| sls deploy | Deploy the whole serverless project |

## 2. Website

A static website to serve the main page.

| Command     | Description                |
| ----------- | -------------------------- |
| yarn dev    | Run local dev server       |
| yarn build  | Build the production files |
| yarn deploy | Sync to the S3 bucket      |

## 3. Layer

A separate project to build a dependency lambda layer, to be consumed by `serverless` component. The major dependencies here are `puppeteer`, `better-sqlite3`, quran font and database.

Before you can build, you need to download the [chrome_aws_lambda.zip](https://github.com/shelfio/chrome-aws-lambda-layer) or ([build by yourself](https://github.com/alixaxel/chrome-aws-lambda#aws-lambda-layer)), and put it in the `/placequran-layer/` directory.

| Command     | Description                     |
| ----------- | ------------------------------- |
| yarn build  | Build the layer zip file        |
| yarn deploy | Publish the layer to aws lambda |
