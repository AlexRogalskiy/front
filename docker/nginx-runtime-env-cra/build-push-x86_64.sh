#!/bin/bash
set -e

# Build it on x86_64
docker build . -t kubeshark/nginx-runtime-env-cra:amd64 && docker push kubeshark/nginx-runtime-env-cra:amd64
