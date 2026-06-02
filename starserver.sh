#!/bin/bash

CURRENT_WINDOW=$(tmux display-message -p '#W')
CURRENT_PANE=$(tmux display-message -p '#P')

tmux split-window -h

tmux send-keys -t "$CURRENT_PANE" "bun dev" C-m

tmux send-keys "bunx wrangler dev worker/index.js --port 8787" C-m

