#!/bin/bash

rm -rf ./dist

mkdir ./dist
mkdir ./dist/subapp

# demo01子应用
cp -r ./demo01/dist/ ./dist/subapp/demo01/

# demo02子应用
cp -r ./demo02/build/ ./dist/subapp/demo02/

# main基座
cp -r ./main/dist/ ./dist/main/

# cd ./dist
# zip -r mp$(date +%Y%m%d%H%M%S).zip *
# cd ..
echo 'bundle.sh execute success.'
