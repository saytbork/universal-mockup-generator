#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 10 ]]; then
  cat <<'USAGE' 1>&2
Usage:
  bash scripts/replace-landing-slider-images.sh \
    <pair1_before> <pair1_after> \
    <pair2_before> <pair2_after> \
    <seq_before> <seq_01> <seq_02> <seq_03> <seq_04> <seq_05>

This updates the landing carousel assets under:
  public/slider/

Mapping:
  pair1_before -> public/slider/01-product.jpg
  pair1_after  -> public/slider/01-real.jpg
  pair2_before -> public/slider/02-before.jpg
  pair2_after  -> public/slider/02-after.jpg
  seq_before   -> public/slider/seq-before.jpg
  seq_01..05   -> public/slider/seq-01.jpg .. public/slider/seq-05.jpg
USAGE
  exit 2
fi

dst_dir="public/slider"
mkdir -p "$dst_dir"

pair1_before="$1"
pair1_after="$2"
pair2_before="$3"
pair2_after="$4"
seq_before="$5"
seq_01="$6"
seq_02="$7"
seq_03="$8"
seq_04="$9"
seq_05="${10}"

copy() {
  local src="$1"
  local dst="$2"
  if [[ ! -f "$src" ]]; then
    echo "Missing file: $src" 1>&2
    exit 1
  fi
  cp -f "$src" "$dst"
}

copy "$pair1_before" "$dst_dir/01-product.jpg"
copy "$pair1_after"  "$dst_dir/01-real.jpg"
copy "$pair2_before" "$dst_dir/02-before.jpg"
copy "$pair2_after"  "$dst_dir/02-after.jpg"
copy "$seq_before"   "$dst_dir/seq-before.jpg"
copy "$seq_01"       "$dst_dir/seq-01.jpg"
copy "$seq_02"       "$dst_dir/seq-02.jpg"
copy "$seq_03"       "$dst_dir/seq-03.jpg"
copy "$seq_04"       "$dst_dir/seq-04.jpg"
copy "$seq_05"       "$dst_dir/seq-05.jpg"

echo "Updated landing carousel images in $dst_dir"
