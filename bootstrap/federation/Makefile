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
include ../Makefile.config

default:
	@echo "Cloud DNS Managed Zone: make dns"
	@echo "API Server and Controller: make controller"
	@echo "Regsiter clusters: make federate"

federation-vars:
	$(eval federation_cluster_region := $(FEDERATION_CLUSTER_REGION))
	$(eval federation_cluster_name := gcp-$(federation_cluster_region))
	$(eval federation_cluster_zones := $(addprefix $(federation_cluster_region)-,$(CLUSTER_ZONES)))
	$(eval federation_cluster_zone := $(firstword $(federation_cluster_zones)))
	$(eval federation_cluster_context := gke_$(PROJECT_ID)_$(federation_cluster_zone)_$(federation_cluster_name))

dns:
	-gcloud --project $(PROJECT_ID) dns managed-zones create $(FEDERATION_NAME) \
	  --description "Kubernetes Federation $(FEDERATION_NAME)" \
	  --dns-name $(FEDERATION_DOMAIN)

controller: federation-vars
	kubefed init $(FEDERATION_NAME) --host-cluster-context=$(federation_cluster_context) --dns-zone-name=$(FEDERATION_DOMAIN). --dns-provider=google-clouddns

federate: $(addsuffix -federate,$(CLUSTER_REGIONS))

%-federate: federation-vars %-vars
	-kubectl config use-context $(FEDERATION_CONTEXT)
	-kubefed join $(cluster_name) --host-cluster-context=$(federation_cluster_context) --cluster-context=$(cluster_context)

unfederate: $(addsuffix -unfederate,$(CLUSTER_REGIONS))

%-unfederate: federation-vars %-vars
	-kubectl --context=$(federation_cluster_context) --namespace=federation-system delete secret $(cluster_name)
	-kubectl config use-context $(FEDERATION_CONTEXT)
	-kubefed unjoin $(cluster_name) --host-cluster-context=$(federation_cluster_context)

federation-all: dns controller federate kubedns

