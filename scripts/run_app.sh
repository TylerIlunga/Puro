#!/bin/bash
echo "Generating static files for nginx..."
cd ../web && yarn install && yarn build
echo "Spinning up containers..."
cd .. && docker-compose up
