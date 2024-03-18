#!/bin/bash -ex

rm -rf nodejs placequran-layer.zip
mkdir -p nodejs/
# unzip chrome_aws_lambda.zip

npm install --prefix nodejs/ better-sqlite3@9.4.3 puppeteer-core@22.4.1 @sparticuz/chromium@122 --no-bin-links --no-fund --no-optional --no-package-lock --no-save --no-shrinkwrap

pack=$(npm pack)

mkdir -p nodejs/node_modules/placequran-layer/
tar --directory nodejs/node_modules/placequran-layer/ --extract --file $pack --strip-components=1

rm $pack

zip -r9 placequran-layer.zip nodejs
rm -rf nodejs
