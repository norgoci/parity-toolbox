#!/bin/bash
#set -xv

rm -rf .parity/
#parity --chain dev --base-path=./.parity --tx-gas-limit=ffffffffffff
parity --chain dev --base-path=./.parity
