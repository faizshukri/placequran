#!/bin/bash -ex

rm -rf nodejs placequran-layer.zip && mkdir -p nodejs
npm install --prefix nodejs --no-bin-links --no-fund --no-optional --no-package-lock --no-save --no-shrinkwrap \
  lambdafs@~2.0.3 \
  puppeteer-core@~10.1.0

npm install --prefix nodejs --no-package-lock --no-save better-sqlite3

pack=$(npm pack)

mkdir -p nodejs/node_modules/chrome-aws-lambda/
tar --directory nodejs/node_modules/chrome-aws-lambda/ --extract --file chrome-aws-lambda*.tgz --strip-components=1

mkdir -p nodejs/node_modules/placequran-layer/
tar --directory nodejs/node_modules/placequran-layer/ --extract --file $pack --strip-components=1

rm $pack

zip -r9 placequran-layer.zip nodejs
rm -rf nodejs
