#!/bin/bash

BUCKET=$BUCKET_NAME-$ENVIRONMENT

# Put cache control on all file
aws s3 sync --delete --cache-control max-age=259200,s-maxage=31536000 --exclude 'tmp/*' --exclude "error*" ./dist s3://$BUCKET

# except on error files
aws s3 sync --delete --exclude "*" --include "error*" ./dist s3://$BUCKET
