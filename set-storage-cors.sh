#!/usr/bin/env bash

set -euo pipefail

gsutil cors set cors.json gs://boostugc-6d83f.firebasestorage.app
