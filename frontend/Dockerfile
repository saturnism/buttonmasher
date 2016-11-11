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
FROM nginx:1.8.1
RUN apt-get update && apt-get -y install qrencode && \
    apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

VOLUME /data
RUN qrencode -o /usr/share/nginx/html/qr.png -s 16 -l Q -m 1 http://hcr.k8s.io
COPY *.png /usr/share/nginx/html/
COPY gzip_static.conf /etc/nginx/conf.d/
COPY index.html /usr/share/nginx/html/
