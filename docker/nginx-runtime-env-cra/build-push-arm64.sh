#!/bin/bash
set -e

# Build it on arm64
docker build . -t kubeshark/nginx-runtime-env-cra:arm64v8 && docker push kubeshark/nginx-runtime-env-cra:arm64v8
