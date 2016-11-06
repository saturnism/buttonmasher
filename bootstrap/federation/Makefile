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

tmp:
	-mkdir .tmp/

dns:
	-gcloud --project $(PROJECT_ID) dns managed-zones create $(FEDERATION_NAME) \
	  --description "Kubernetes Federation $(FEDERATION_NAME)" \
	  --dns-name $(FEDERATION_DOMAIN)

namespace: federation-vars
	-kubectl --context=$(federation_cluster_context) \
		apply -f ns/federation.yaml

api-server-lb: tmp federation-vars namespace
	-kubectl --context=$(federation_cluster_context) \
		apply -f services/federation-apiserver.yaml; \
	external_ip=""; \
	while [ -z $$external_ip ]; do \
		sleep 10; \
		external_ip=$$(kubectl --context=$(federation_cluster_context) --namespace=federation get svc federation-apiserver --template="{{range .status.loadBalancer.ingress}}{{.ip}}{{end}}") ; \
	done; \
	echo $$external_ip > .tmp/api-server-ip

api-server: tmp federation-vars api-server-lb etcd-pvc token
	-mkdir -p .tmp/deployments
	-kubectl --context=$(federation_cluster_context) --namespace=federation \
		delete -f .tmp/deployments/federation-apiserver.yaml
	$(eval server_address := $(shell cat .tmp/api-server-ip))
	sed -e "s|ADVERTISE_ADDRESS|$(server_address)|g" deployments/federation-apiserver.yaml > .tmp/deployments/federation-apiserver.yaml ; \
	kubectl --context=$(federation_cluster_context) --namespace=federation \
		apply -f .tmp/deployments/federation-apiserver.yaml ; \
	kubectl --context=$(federation_cluster_context) --namespace=federation \
		get deployments

federation-kubeconfig: federation-vars api-server
	$(eval cluster_token := $(shell cut -d"," -f1 .tmp/known-tokens.csv))
	$(eval api_server_ip := $(shell cat .tmp/api-server-ip))
	kubectl config set-cluster federation-cluster \
		--server=https://$(api_server_ip) \
		--insecure-skip-tls-verify=true && \
	kubectl config set-credentials federation-cluster \
	  --token=$(cluster_token) && \
	kubectl config set-context federation-cluster \
		--cluster=federation-cluster \
		--user=federation-cluster
	kubectl config use-context federation-cluster
	-mkdir -p .tmp/kubeconfigs/federation-apiserver
	kubectl config view --flatten --minify > .tmp/kubeconfigs/federation-apiserver/kubeconfig
	-kubectl --context=$(federation_cluster_context) --namespace=federation \
		delete secret federation-apiserver-kubeconfig
	kubectl --context=$(federation_cluster_context) --namespace=federation \
		create secret generic federation-apiserver-kubeconfig \
		--from-file=.tmp/kubeconfigs/federation-apiserver/kubeconfig

controller: tmp federation-vars federation-kubeconfig
	sed -e "s|FEDERATION_NAME|$(FEDERATION_NAME)|g" -e "s|FEDERATION_DOMAIN|$(FEDERATION_DOMAIN)|g" deployments/federation-controller-manager.yaml > .tmp/deployments/federation-controller-manager.yaml
	-kubectl --context=$(federation_cluster_context) --namespace=federation \
		delete -f .tmp/deployments/federation-controller-manager.yaml
	kubectl --context=$(federation_cluster_context) --namespace=federation \
		create -f .tmp/deployments/federation-controller-manager.yaml
	kubectl --context=$(federation_cluster_context) --namespace=federation \
		get deployments

token: tmp federation-vars
	-kubectl --context=$(federation_cluster_context) --namespace=federation \
		delete secret federation-apiserver-secrets
	echo "$$(cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1),admin,admin" > .tmp/known-tokens.csv
	cd .tmp && kubectl --context=$(federation_cluster_context) --namespace=federation \
		create secret generic federation-apiserver-secrets --from-file=known-tokens.csv
	kubectl --context=$(federation_cluster_context) --namespace=federation \
		describe secret federation-apiserver-secrets

etcd-pvc: federation-vars
	kubectl --context=$(federation_cluster_context) --namespace=federation \
		apply -f pvc/federation-apiserver-etcd.yaml

kubedns: $(addsuffix -kubedns,$(CLUSTER_REGIONS))

%-kubedns: %-vars
	kubectl --context=$(cluster_context) --namespace=kube-system \
		patch rc kube-dns-v20 \
		-p '{"spec": {"template": {"spec": {"containers": [{"name": "kubedns", "args": ["--domain=cluster.local.", "--dns-port=10053", "--federations=$(FEDERATION_NAME)=$(FEDERATION_DOMAIN)"]}]}}}}'
	kubectl --context=$(cluster_context) --namespace=kube-system \
		scale rc kube-dns-v20 --replicas=0
	kubectl --context=$(cluster_context) --namespace=kube-system \
		scale rc kube-dns-v20 --replicas=2

cluster-yaml: $(addsuffix -cluster-yaml,$(CLUSTER_REGIONS))

%-cluster-yaml: tmp %-vars
	kubectl config use-context $(cluster_context)
	-mkdir -p .tmp/clusters/
	$(eval server_address := $(shell kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}'))
	sed -e "s|SERVER_ADDRESS|$(server_address)|g" -e "s|CLUSTER_NAME|$(cluster_name)|g" clusters/cluster.tpl > .tmp/clusters/$(cluster_name).yaml

kubeconfig: $(addsuffix -kubeconfig,$(CLUSTER_REGIONS))

%-kubeconfig: tmp %-vars
	kubectl config use-context $(cluster_context)
	-mkdir -p .tmp/kubeconfigs/$(cluster_name)
	kubectl config view --flatten --minify > .tmp/kubeconfigs/$(cluster_name)/kubeconfig

federate: $(addsuffix -federate,$(CLUSTER_REGIONS))

%-federate: federation-vars %-vars %-kubedns %-kubeconfig %-cluster-yaml
	-kubectl --context=$(federation_cluster_context) --namespace=federation \
		delete secret $(cluster_name)
	kubectl --context=$(federation_cluster_context) --namespace=federation \
  	create secret generic $(cluster_name) \
  	--from-file=.tmp/kubeconfigs/$(cluster_name)/kubeconfig
	-kubectl --context=federation-cluster \
		delete -f .tmp/clusters/$(cluster_name).yaml
	kubectl --context=federation-cluster \
  	apply -f .tmp/clusters/$(cluster_name).yaml
	kubectl --context=federation-cluster get clusters

clean:
	rm -rf .tmp/

federation-all: clean dns controller federate

