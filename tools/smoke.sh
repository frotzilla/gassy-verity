#!/usr/bin/env bash
# Runs tests/smoke.html in headless Chrome against a throwaway local server.
# Usage: bash tools/smoke.sh      (exit code 0 = pass)
set -u
cd "$(dirname "$0")/.."
PORT=${PORT:-8791}

CHROME="${CHROME:-}"
for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" google-chrome google-chrome-stable chromium chromium-browser; do
  [ -n "$CHROME" ] && break
  if [ -x "$c" ] || command -v "$c" >/dev/null 2>&1; then CHROME="$c"; fi
done
[ -z "$CHROME" ] && { echo "No Chrome or Chromium found. Set CHROME=/path/to/chrome."; exit 2; }

# A static server with a deep connection backlog: the page loads ~30 scripts at once, and the stock
# `python3 -m http.server` drops some of those requests.
python3 - "$PORT" >/dev/null 2>&1 <<'PY' &
import http.server, sys
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
class Server(http.server.ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True
Server(("127.0.0.1", int(sys.argv[1])), Quiet).serve_forever()
PY
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
for _ in $(seq 1 30); do curl -sf "http://127.0.0.1:$PORT/tests/smoke.html" >/dev/null && break; sleep 0.2; done

OUT=$("$CHROME" --headless=new --no-sandbox --disable-gpu --user-data-dir="$(mktemp -d)" \
  --virtual-time-budget=60000 --dump-dom "http://127.0.0.1:$PORT/tests/smoke.html" 2>/dev/null)

# the result block is plain text inside <pre id="out">...</pre>
echo "$OUT" | python3 -c '
import sys,re,html
d=sys.stdin.read()
m=re.search(r"<pre id=\"out\">(.*?)</pre>", d, re.S)
t=html.unescape(m.group(1)) if m else "no result found (the page did not finish)"
print(t)
sys.exit(0 if t.startswith("SMOKE: PASS") else 1)'
