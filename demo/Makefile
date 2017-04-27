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
include ../bootstrap/Makefile.config

deploy-v1: primary-vars
	kubectl --context=$(primary_cluster_context) apply -f buttonmasher-v1.yaml

load:
	kubectl --context=$(FEDERATION_NAME) scale deployment load-bots --replicas=3

noload:
	kubectl --context=$(FEDERATION_NAME) scale deployment load-bots --replicas=0

rolling-update: primary-vars
	kubectl --context=$(primary_cluster_context) apply -f buttonmasher-v2.yaml

deploy-v2: $(addsuffix -deploy-v2,$(CLUSTER_REGIONS))

%-deploy-v2: %-vars
	kubectl --context=$(cluster_context) apply -f buttonmasher-v2.yaml

reset: noload $(addsuffix -reset,$(CLUSTER_REGIONS)) deploy-v1

%-reset: %-vars
	-kubectl --context=$(cluster_context) delete deployment buttonmasher-backend

redeploy: $(addsuffix -redeploy,$(CLUSTER_REGIONS))

%-redeploy: %-vars
	-kubectl --context=$(cluster_context) scale deployment buttonmasher-aggregator --replicas=0
	-kubectl --context=$(cluster_context) scale deployment buttonmasher-aggregator --replicas=1
	-kubectl --context=$(cluster_context) scale deployment buttonmasher-frontend --replicas=0
	-kubectl --context=$(cluster_context) scale deployment buttonmasher-frontend --replicas=1
	-kubectl --context=$(cluster_context) scale deployment buttonmasher-visualizer --replicas=0
	-kubectl --context=$(cluster_context) scale deployment buttonmasher-visualizer --replicas=1

repull: $(addsuffix -repull,$(CLUSTER_REGIONS))

%-repull: %-vars
	for node in `kubectl --context=$(cluster_context) get nodes -o name | cut -f2 -d/` ; do \
		gcloud compute ssh --zone=$(cluster_zone) --project=$(PROJECT_ID) $$node --command="sudo docker pull gcr.io/$(PROJECT_ID)/buttonmasher-backend:v1; sudo docker pull gcr.io/$(PROJECT_ID)/buttonmasher-backend:v2"; \
	done
