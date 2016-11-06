#!/bin/bash -eu
#
# Copyright 2016 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
################################################################################
#!/bin/bash

VEGETA=${VEGETA:-'/go/bin/vegeta'}
HOST=${HOST:-}
PORT=${PORT:-'80'}
URLPATH=${URLPATH:-'/'}
RATE=${RATE:-'1000'}
CPUS=${CPUS:-'8'}
WORKERS=${WORKERS:-'10'}
TIMEOUT=${TIMEOUT:-'10s'}
DURATION=${DURATION:-'0'}

while true; do
    echo "GET http://${HOST}:${PORT}${URLPATH}" | ${VEGETA} -cpus=${CPUS} attack -rate=${RATE} -workers=${WORKERS} -duration=${DURATION} > /dev/null
done
