include ../bootstrap/Makefile.config

KUBECONFIG := ./kubeconfig
SERVER := $(shell grep server: kubeconfig | sed -e 's|.*server:[[:space:]]*||g')
CLUSTER_NAME := $(shell grep "\- context:" kubeconfig -A3| grep name: | sed -e 's|.*name:[[:space:]]*||g')

tmp:
	-mkdir -p .tmp

clean:
	-rm -rf .tmp

cluster-yaml: tmp
	sed -e "s|SERVER_ADDRESS|$(SERVER)|g" -e "s|CLUSTER_NAME|$(CLUSTER_NAME)|g" ../bootstrap/federation/clusters/cluster.tpl > .tmp/cluster.yaml

uid: tmp
	$(eval UID := $(shell cat /dev/urandom | env LC_CTYPE=C tr -dc 'a-zA-Z0-9' | fold -w 12 | head -n 1))
	sed -e "s|UID|$(UID)|g" uid.tpl > .tmp/uid.yaml
	kubectl --kubeconfig=kubeconfig apply -f .tmp/uid.yaml

federate: federation-vars kubeconfig cluster-yaml uid
	kubectl --context=$(federation_cluster_context) --namespace=federation \
		create secret generic $(CLUSTER_NAME) \
		--from-file=kubeconfig
	kubectl --context=federation-cluster \
		apply -f .tmp/cluster.yaml
	kubectl --context=federation-cluster get clusters

load:
	$(eval count := $(shell kubectl --context=federation-cluster get cluster| grep -v STATUS | wc -l))
	kubectl --context=federation-cluster scale rs load-bots --replicas=$(count)

noload:
	kubectl --context=federation-cluster scale rs load-bots --replicas=

deploy-v2:
	kubectl --kubeconfig=kubeconfig apply -f ../demo/buttonmasher-v2.yaml

deploy:
	kubectl --kubeconfig=kubeconfig apply -f ../demo/buttonmasher-v1.yaml

reset:
	kubectl --kubeconfig=kubeconfig delete deployment buttonmasher-backend

unfederate: federation-vars
	-kubectl --context=federation-cluster delete cluster $(CLUSTER_NAME)
	-kubectl --context=$(federation_cluster_context) --namespace=federation delete secret $(CLUSTER_NAME)
