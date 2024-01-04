#!/bin/bash

rm -rf ./dist

mkdir ./dist
mkdir ./dist/subapp

# micro-editor子应用
cp -r ./micro-editor/build/ ./dist/subapp/micro-editor/

# micro-console子应用
cp -r ./micro-console/build/ ./dist/subapp/micro-console/

# main基座
cp -r ./main/build/ ./dist/main/

# cd ./dist
# zip -r mp$(date +%Y%m%d%H%M%S).zip *
# cd ..
echo 'bundle.sh execute success.'
