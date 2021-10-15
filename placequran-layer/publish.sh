#!/bin/bash -ex

S3_BUCKET_NAME=$BUCKET_NAME-$ENVIRONMENT

aws s3 cp \
  placequran-layer.zip \
  s3://$S3_BUCKET_NAME/placequran-layer.zip

aws lambda publish-layer-version \
  --region "$AWS_DEFAULT_REGION" \
  --layer-name "placequran-layer" \
  --description "placequran layer" \
  --content S3Bucket="$S3_BUCKET_NAME",S3Key=placequran-layer.zip

aws s3 rm s3://$S3_BUCKET_NAME/placequran-layer.zip
