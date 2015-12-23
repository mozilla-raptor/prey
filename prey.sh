#! /bin/bash

RAPTOR="./node_modules/.bin/raptor"
CONTEXT="$1"
METRIC="visuallyLoaded"
TIME="14d"
DEVICE="flame-kk"
MEMORY="512"
BRANCH="master"

./node_modules/.bin/raptor query measure \
  --host $DB_HOST \
  --port $DB_PORT \
  --username $DB_USERNAME \
  --password $DB_PASSWORD \
  --database $DB_NAME \
  --protocol $DB_PROTOCOL \
  --context $CONTEXT \
  --metric $METRIC \
  --time $TIME \
  --device $DEVICE \
  --memory $MEMORY \
  --branch $BRANCH | \
./node_modules/.bin/raptor regression | \
./node_modules/.bin/raptor track \
  --host $DB_HOST \
  --port $DB_PORT \
  --username $DB_USERNAME \
  --password $DB_PASSWORD \
  --database $DB_NAME \
  --protocol $DB_PROTOCOL | \
./node_modules/.bin/raptor bug \
  --username $BZ_USERNAME \ 
  --password $BZ_PASSWORD \
  --token $BITLY_TOKEN
