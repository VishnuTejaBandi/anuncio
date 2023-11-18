#!/usr/bin/fish
set dir (dirname (status --current-filename))
zellij --layout $dir/layout.kdl

