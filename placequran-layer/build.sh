#!/bin/bash -ex

rm -rf nodejs placequran-layer.zip
unzip chrome_aws_lambda.zip

npm install --prefix nodejs --no-package-lock --no-save better-sqlite3

pack=$(npm pack)

mkdir -p nodejs/node_modules/placequran-layer/
tar --directory nodejs/node_modules/placequran-layer/ --extract --file $pack --strip-components=1

rm $pack

zip -r9 placequran-layer.zip nodejs
rm -rf nodejs
