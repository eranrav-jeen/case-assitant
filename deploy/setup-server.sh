#!/usr/bin/env bash
# One-time server setup for the Case Assistant demo (Ubuntu 22.04 / 24.04).
# Usage: ./deploy/setup-server.sh [DOMAIN] [--port=N] [--no-auth] [--https]
#   --port defaults to 80. Use another port (e.g. 8080) when port 80 already serves another site
#   and the demo has no domain of its own.
#   DOMAIN defaults to "_" (any host). --https needs a real domain pointing here.
set -euo pipefail
cd "$(dirname "$0")/.."

DOMAIN="_"; PORT=80; AUTH=yes; HTTPS=no
for a in "$@"; do
  case "$a" in
    --no-auth) AUTH=no ;;
    --https) HTTPS=yes ;;
    --port=*) PORT="${a#--port=}" ;;
    *) DOMAIN="$a" ;;
  esac
done

sudo apt-get update
sudo apt-get install -y curl ca-certificates gnupg nginx apache2-utils rsync
if ! command -v node >/dev/null || [ "$(node -v | cut -d. -f1 | tr -d v)" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
node -v && npm -v
sudo ufw allow 'Nginx Full' 2>/dev/null || true
if [ "$PORT" != 80 ]; then
  sudo ufw allow "$PORT"/tcp 2>/dev/null || true
  # Oracle Cloud Ubuntu images block ports with iptables rules (ufw is inactive there).
  if sudo iptables -S INPUT 2>/dev/null | grep -q -- '-j REJECT'; then
    sudo iptables -C INPUT -p tcp --dport "$PORT" -j ACCEPT 2>/dev/null \
      || sudo iptables -I INPUT 5 -m state --state NEW -p tcp --dport "$PORT" -j ACCEPT
    command -v netfilter-persistent >/dev/null && sudo netfilter-persistent save || true
  fi
fi

conf=/etc/nginx/sites-available/case-assistant
sed "s/__DOMAIN__/${DOMAIN}/; s/__PORT__/${PORT}/" deploy/nginx-case-assistant.conf | sudo tee "$conf" >/dev/null
if [ "$AUTH" = no ]; then
  sudo sed -i '/auth_basic/d' "$conf"
elif [ ! -f /etc/nginx/.htpasswd-case-assistant ]; then
  echo "Choose a password for the demo user 'demo':"
  sudo htpasswd -c /etc/nginx/.htpasswd-case-assistant demo
fi
sudo ln -sf "$conf" /etc/nginx/sites-enabled/case-assistant

if [ "$DOMAIN" = "_" ] && [ "$PORT" = 80 ] && [ -e /etc/nginx/sites-enabled/default ]; then
  echo "NOTE: /etc/nginx/sites-enabled/default also answers any host on port 80."
  echo "      Remove it only if nothing else uses it: sudo rm /etc/nginx/sites-enabled/default"
fi

sudo nginx -t
./deploy.sh   # builds, rsyncs to /var/www/case-assistant, reloads nginx


if [ "$HTTPS" = yes ]; then
  sudo apt-get install -y certbot python3-certbot-nginx
  sudo certbot --nginx -d "$DOMAIN" --redirect
fi

echo "Done. Check: curl -I http://${DOMAIN/_/localhost}:${PORT}/   (expect 200, or 401 with basic auth)"
