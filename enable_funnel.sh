#!/bin/bash
echo "142611" | sudo -S tailscale funnel --bg 3000
tailscale status | grep -E "(Funnel|tailscale.net)"
echo "Funnel enabled on port 3000"
