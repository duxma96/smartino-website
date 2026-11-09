#!/usr/bin/env bash
# Jedan korak: postavlja sajt na Smartino server (isti server i SSH kao za platformu).
#
#   bash scripts/deploy-website.sh            # najnoviji commit sa GitHub-a (grana main)
#   bash scripts/deploy-website.sh v2.0.1     # tacno taj tag ili grana
#   bash scripts/deploy-website.sh --rollback # vrati prethodnu verziju
#
# Treba: SSH kljuc krnjaicd ucitan u Windows ssh-agent (ssh-add $env:USERPROFILE\.ssh\krnjaicd).
# Dira SAMO kontejner "website". Platforma (Huly) i podaci se ne diraju.
# Pre svakog deploya cuva se prethodni image kao smartino-website:prev, pa je povratak jedan korak.
# Ako novi sajt ne odgovara HTTP 200, skripta sama vraca prethodnu verziju.
set -euo pipefail

SERVER="${DEPLOY_SERVER:-krnjaicd@92.242.189.41}"
URL="${DEPLOY_URL:-https://92-242-189-41.sslip.io/}"
REPO="${DEPLOY_REPO:-https://github.com/duxma96/smartino-website.git}"
REF="${1:-main}"

# U Git Bash-u koristi Windows ssh (on vidi ssh-agent), inace obican ssh.
SSH="ssh"
[ -x /c/Windows/System32/OpenSSH/ssh.exe ] && SSH="/c/Windows/System32/OpenSSH/ssh.exe"
SSH_OPTS=(-o BatchMode=yes -o ConnectTimeout=20)

if ! "$SSH" "${SSH_OPTS[@]}" "$SERVER" true 2>/dev/null; then
  echo "Nema SSH pristupa serveru $SERVER." >&2
  echo "Server je mozda ugasen ili kljuc nije ucitan (ssh-add \$env:USERPROFILE\\.ssh\\krnjaicd)." >&2
  exit 1
fi

ROLLBACK=0
[ "$REF" = "--rollback" ] && ROLLBACK=1

"$SSH" "${SSH_OPTS[@]}" "$SERVER" bash -s -- "$REPO" "$REF" "$URL" "$ROLLBACK" <<'REMOTE'
set -euo pipefail
REPO="$1"; REF="$2"; URL="$3"; ROLLBACK="$4"
cd /opt/smartino-infra

check() {
  local code=000
  for _ in $(seq 1 20); do
    code=$(curl -sk -o /dev/null -w '%{http_code}' "$URL" || true)
    [ "$code" = 200 ] && break
    sleep 2
  done
  echo "HTTP $code"
  [ "$code" = 200 ]
}

restore_prev() {
  docker image inspect smartino-website:prev >/dev/null
  docker tag smartino-website:prev smartino-website:local
  docker compose up -d website
}

if [ "$ROLLBACK" = 1 ]; then
  echo "Vracam prethodnu verziju..."
  restore_prev
  check
  echo "Gotovo: vracena prethodna verzija."
  exit 0
fi

TMP=$(mktemp -d /tmp/smartino-web.XXXXXX)
trap 'rm -rf "$TMP"' EXIT
echo "Preuzimam $REF ..."
git clone -q --depth 1 --branch "$REF" "$REPO" "$TMP/src" 2>&1 | grep -v 'detached HEAD' || true
[ -f "$TMP/src/package.json" ] || { echo "Nije uspelo preuzimanje $REF" >&2; exit 1; }
echo "Verzija: $(git -C "$TMP/src" log -1 --format='%h %s')"

# cuva trenutni image za povratak
docker image inspect smartino-website:local >/dev/null 2>&1 && docker tag smartino-website:local smartino-website:prev

echo "Gradim..."
docker build -q -f images/website/Dockerfile --build-context "site=$TMP/src" -t smartino-website:local images/website >/dev/null
docker compose up -d website

if check; then
  echo "Gotovo: sajt je postavljen."
else
  echo "Novi sajt ne radi, vracam prethodnu verziju..." >&2
  restore_prev
  check || true
  exit 1
fi
REMOTE
