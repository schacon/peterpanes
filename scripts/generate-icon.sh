#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SOURCE_SVG="$ROOT_DIR/assets/icon.svg"
BUILD_DIR="$ROOT_DIR/build"
BASE_PNG="$BUILD_DIR/icon.png"

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "rsvg-convert is required but not installed."
  exit 1
fi

mkdir -p "$BUILD_DIR"
rsvg-convert -w 1024 -h 1024 "$SOURCE_SVG" -o "$BASE_PNG"
echo "Generated $BASE_PNG"
