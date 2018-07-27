#!/bin/bash
#set -xv

# starts and unlock the developer user
parity --chain dev --base-path=./.parity --unlock 0x00a329c0648769a73afac7f9381e08fb43dbea72 --password ./password --jsonrpc-cors "'*'"
