#!/usr/bin/env bash
cd /tmp

rm -rf memory-card-game; true

git clone https://github.com/scottrice10/memory-card-game.git

cd memory-card-game

npm install --unsafe-perm
npm start
