#!/bin/bash

rm -rf ./dist

mkdir ./dist
mkdir ./dist/subapp

# demo02子应用
cp -r ./demo02/build/ ./dist/subapp/demo02/

# demo01子应用
cp -r ./demo01/build/ ./dist/subapp/demo01/

# main基座
cp -r ./main/build/ ./dist/main/

# cd ./dist
# zip -r mp$(date +%Y%m%d%H%M%S).zip *
# cd ..
echo 'bundle.sh execute success.'
