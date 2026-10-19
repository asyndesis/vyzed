#!/usr/bin/env bash
# Run the API and web servers together; if either exits, stop so Fly restarts the machine.
PORT=4000 node api/dist/index.mjs &
node web/.output/server/index.mjs &
wait -n
exit $?
