#!/usr/bin/env bash

mkdir -p mongodb_data
mkdir -p mongodb_data/log

mongod \
    --directoryperdb \
    --dbpath mongodb_data \
    --logpath mongodb_data/log/mongodb.log \
    --logappend \
