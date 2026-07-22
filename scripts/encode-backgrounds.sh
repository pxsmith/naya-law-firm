#!/bin/bash
#
# Encode the homepage background videos from the licensed Stocksy masters.
#
# Masters: Stocksy purchase stocksy_txpurchase_1025166 (4 clips, 1280x720, ~15 Mbps).
# They are NOT in the repo — they live in iCloud (see MASTERS below). Only the
# encoded outputs are committed.
#
# What each clip goes through, in one ffmpeg pass:
#
#   1. Denoise (hqdn3d) — these clips are grainy, and grain is what eats bitrate.
#      Removing it is most of the size win and looks better as a background plate.
#   2. Downscale (lanczos) to the target size.
#   3. Seamless loop — the last N frames are blended against a time-REVERSED copy
#      of the first N frames on a linear ramp, so the final frame IS frame 0 and
#      the clip wraps with no visible jump. Unlike a plain xfade this preserves
#      the full duration (nothing is cut), because the tail is blended in place.
#
#      NOTE: ffmpeg's blend filter exposes N as 1-BASED. The ramp must therefore be
#      (N-1)/(M-1), not N/(M-1) — the latter overshoots past frame 0 on the last
#      frame. The videos shipped before this script had that off-by-one and wrapped
#      at 0.958 similarity instead of ~1.0.
#   4. x264 veryslow, no audio, +faststart (so playback can begin before the whole
#      file arrives). A keyframe is forced on the LAST frame as well as the first:
#      without it the wrap frame sits deep in a GOP and carries visibly more
#      quantization noise than the pristine keyframe it loops back to, which reads
#      as a faint shimmer at the loop point. Costs ~8 KB and is worth it.
#
#      `veryslow` defaults to ref=16 / bframes=8, which we override back down to
#      4 / 3. Sixteen reference frames means the decoder keeps sixteen frames of
#      DPB per video, and this page runs several videos at once on phones that
#      have already crashed once over background-video memory (189f8eb). The
#      capped settings match what the site shipped before and cost ~1% in size.
#
# Trimming happens first, as a separate near-lossless pass, so that the loop
# blend operates on an exact known frame count.
#
# Each output is verified: the last frame is compared against frame 0 with SSIM,
# alongside a mid-clip control frame. A good loop scores >= 0.98 against a control
# of roughly 0.8.
#
# Usage:
#   ./scripts/encode-backgrounds.sh            # encode everything
#   ./scripts/encode-backgrounds.sh hero       # encode one slot
#
set -euo pipefail
export PATH="/opt/homebrew/bin:$PATH"

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MASTERS="${MASTERS:-$HOME/Library/Mobile Documents/com~apple~CloudDocs/_LIBRARY (secure:large)/CLIENTS/Naya/Website 2/stocksy_txpurchase_1025166}"
OUT_VIDEO="$REPO/public/videos"
OUT_POSTER="$REPO/public/posters"
WORK="${WORK:-${TMPDIR:-/tmp}/naya-bg-encode}"

XFADE=1.2   # seamless-loop crossfade length, in seconds

mkdir -p "$OUT_VIDEO" "$OUT_POSTER" "$WORK"

# slot|master|trim_start|trim_dur|width|height|crf|hqdn3d
#   trim_start/trim_dur of "-" means "use the whole clip".
#
# Sizes are chosen from a measured encode ladder (VMAF + full-screen stills).
# 640x360 is the knee of the curve: below it fern detail collapses into blobs for
# almost no further saving. The hero gets a rung more because it is the first
# thing anyone sees, and it is the only video on the critical path.
CLIPS=(
  "hero|2907984|-|-|768|432|33|3:2:4:4"
  "approach|3295997|-|-|854|480|32|3:2:4:4"
  "audience|2724147|4|12|640|360|34|4:3:6:4.5"
  # The waterfall runs in two places, cut differently for each.
  #
  # Homepage: a 12s window. It's one section among several that you scroll past,
  # so a tight loop is never on screen long enough to read as repetitive, and the
  # trim buys the resolution to stay sharp.
  "contact|4046271|6|12|768|432|33|3:2:4:4"
  # Pricing survey: the full 31s. It's the only background on that page and
  # people sit in front of it answering questions, which is exactly where a short
  # loop starts to show. Full length costs 2.6x the frames, so the resolution
  # comes down to pay for it — acceptable because it is the page's only asset.
  "contact-full|4046271|-|-|640|360|35|4:3:6:4.5"
)

# Does the clip wrap cleanly from its last frame back to frame 0?
#
# Comparing the two frames directly and demanding ~1.0 does NOT work on a lossy
# encode: frame 0 is a pristine keyframe while the last frame sits deep in a GOP,
# so they differ by quantization noise even when the underlying pixels are
# identical. (Verified: through the same filter chain at -qp 0 the last frame is
# byte-identical to frame 0.)
#
# So the real test is relative — compare the wrap against the ADJACENT-frame
# baseline, i.e. how similar two consecutive frames of this clip normally are.
# If wrapping is as smooth as an ordinary frame step, the loop is invisible.
# The mid-clip control shows what an unrelated frame looks like, for scale.
verify_loop() {
  local file="$1" tag="$2"
  local nf mid
  nf=$(ffprobe -v error -select_streams v:0 -count_frames \
        -show_entries stream=nb_read_frames -of csv=p=0 "$file")
  mid=$((nf / 2))

  local f
  for f in 0 $((nf-1)) $((nf-2)) "$mid"; do
    ffmpeg -v error -y -i "$file" -vf "select=eq(n\,$f)" -frames:v 1 "$WORK/${tag}_$f.png"
  done

  ssim_of() {
    ffmpeg -i "$1" -i "$2" -lavfi ssim -f null - 2>&1 \
      | grep -o 'All:[0-9.]*' | tail -1 | cut -d: -f2
  }

  local wrap adjacent control
  wrap=$(ssim_of     "$WORK/${tag}_$((nf-1)).png" "$WORK/${tag}_0.png")
  adjacent=$(ssim_of "$WORK/${tag}_$((nf-1)).png" "$WORK/${tag}_$((nf-2)).png")
  control=$(ssim_of  "$WORK/${tag}_${mid}.png"    "$WORK/${tag}_0.png")

  printf '   loop wrap %s | adjacent-frame baseline %s | unrelated-frame control %s | %d frames\n' \
    "$wrap" "$adjacent" "$control" "$nf"
  awk -v w="$wrap" -v a="$adjacent" -v c="$control" 'BEGIN{
    if (w+0 < c+0 + (a+0 - c+0) * 0.9)
      print "   WARNING: wrap is much less similar than a normal frame step — loop may visibly jump";
  }'
}

encode_one() {
  local slot="$1" master="$2" tstart="$3" tdur="$4" w="$5" h="$6" crf="$7" dn="$8"
  local src="$MASTERS/$master.mp4"
  local out="$OUT_VIDEO/$slot.mp4"

  [[ -f "$src" ]] || { echo "!! master not found: $src" >&2; return 1; }
  printf '\n== %s  (%s.mp4 -> %sx%s crf%s)\n' "$slot" "$master" "$w" "$h" "$crf"

  # --- optional trim, near-lossless so the loop blend sees clean frames ---
  local input="$src"
  if [[ "$tstart" != "-" ]]; then
    input="$WORK/${slot}_trimmed.mp4"
    printf '   trimming %ss from %ss\n' "$tdur" "$tstart"
    ffmpeg -v error -y -ss "$tstart" -t "$tdur" -i "$src" \
      -c:v libx264 -crf 12 -preset veryfast -pix_fmt yuv420p -an "$input"
  fi

  # --- frame geometry drives the loop blend ---
  local fps nf m body last
  fps=$(ffprobe -v error -select_streams v:0 -show_entries stream=r_frame_rate -of csv=p=0 "$input")
  nf=$(ffprobe -v error -select_streams v:0 -count_frames \
        -show_entries stream=nb_read_frames -of csv=p=0 "$input")
  m=$(awk "BEGIN{printf \"%d\", ($XFADE)*($fps)+0.5}")
  body=$((nf - m))
  last=$((nf - 1))

  # Denoise + scale FIRST so the loop blend runs at final resolution (exact, and
  # much cheaper). hqdn3d is temporal, so it must see the stream in forward order
  # before anything is reversed.
  ffmpeg -v error -y -i "$input" -filter_complex "\
[0:v]hqdn3d=$dn,scale=$w:$h:flags=lanczos,split=3[h][b][t];\
[h]trim=start_frame=0:end_frame=$m,setpts=N/FRAME_RATE/TB,reverse,setpts=N/FRAME_RATE/TB[rev];\
[b]trim=start_frame=0:end_frame=$body,setpts=N/FRAME_RATE/TB[body];\
[t]trim=start_frame=$body,setpts=N/FRAME_RATE/TB[tail];\
[tail][rev]blend=all_expr='A*(1-(N-1)/($m-1))+B*((N-1)/($m-1))'[mix];\
[body][mix]concat=n=2:v=1:a=0,format=yuv420p[v]" \
    -map "[v]" -an -r "$fps" \
    -c:v libx264 -crf "$crf" -preset veryslow -profile:v high -level 4.0 \
    -refs 4 -bf 3 -pix_fmt yuv420p \
    -g 240 -keyint_min 240 -sc_threshold 0 \
    -force_key_frames "expr:eq(n,0)+eq(n,$last)" \
    -movflags +faststart "$out"

  # --- poster = frame 0 of the FINAL encode, so the still-to-video handoff is
  #     invisible (the video starts on exactly the frame the poster shows) ---
  ffmpeg -v error -y -i "$out" -vf "select=eq(n\,0),scale=1280:-2:flags=lanczos" \
    -frames:v 1 -q:v 6 "$OUT_POSTER/$slot.jpg"

  local dur bytes pbytes
  dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out")
  bytes=$(stat -f%z "$out")
  pbytes=$(stat -f%z "$OUT_POSTER/$slot.jpg")
  printf '   video %s KB   poster %s KB   duration %s\n' \
    "$((bytes/1024))" "$((pbytes/1024))" "$dur"

  verify_loop "$out" "$slot"

  # Durations are hardcoded in page.tsx / SurveyExperience.tsx so the desktop
  # shader's loop lands on the video's own loop point. Print them to copy over.
  printf '   >> DURATION constant: %.3f\n' "$dur"
}

only="${1:-}"
for row in "${CLIPS[@]}"; do
  IFS='|' read -r slot master tstart tdur w h crf dn <<< "$row"
  [[ -n "$only" && "$slot" != "$only"* ]] && continue
  encode_one "$slot" "$master" "$tstart" "$tdur" "$w" "$h" "$crf" "$dn"
done

printf '\nDone. Outputs in public/videos and public/posters.\n'
