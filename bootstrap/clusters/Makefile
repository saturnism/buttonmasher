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

comma := ,
empty :=
space := $(empty) $(empty)

default:
	@echo "Create clusters: make create"
	@echo "Fetch credentials: make credentials"
	@echo "Do both: make clusters-all"

create: $(addsuffix -create,$(CLUSTER_REGIONS))

%-create: %-vars
	gcloud container --project $(PROJECT_ID) clusters create $(cluster_name) \
		--cluster-version $(CLUSTER_VERSION) \
		--zone $(cluster_zone) \
		--machine-type $(CLUSTER_MACHINE_TYPE) \
		--image-type $(CLUSTER_IMAGE_TYPE) \
		--scopes $(CLUSTER_SCOPES) \
		--num-nodes $(CLUSTER_NUM_NODES_PER_ZONE) $(additional_zones_flag)

credentials: $(addsuffix -credentials,$(CLUSTER_REGIONS))

%-credentials: %-vars
	gcloud container --project $(PROJECT_ID) clusters get-credentials $(cluster_name) \
		--zone $(cluster_zone)

%-delete: %-vars
	-gcloud container --project $(PROJECT_ID) clusters delete $(cluster_name) \
		--async -q \
		--zone $(cluster_zone)

clusters-all: create credentials

delete: $(addsuffix -delete,$(CLUSTER_REGIONS))

delete-all: delete
