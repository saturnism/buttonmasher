Copy another cluster's kubeconfig to this directory, and then you can:

* Join the federation: make federate
* Deploy backend: make deploy
* Undeploy backend: make reset
* Leave the federation: make unfederate

You'll need to update kube-dns manually to add federations flag, see [Kubernetes Federation guide](http://kubernetes.io/docs/admin/federation/#updating-kubedns)

When this works, federation controller will automatically provision federated resources into this new cluster, such as:
* Federated Service (Buttonmasher backend service, for example)
* Federated ReplicaSet (Load Bots are provisioned from Federated ReplicaSet)
* Federated Ingress
* Federated Namespace
* Federated Secret
* ... See [Federated User Guide](http://kubernetes.io/docs/user-guide/federation/)

DNS will be updated w/ healthy load balanced service IP address. Becareful you are using Cloud DNS + AWS ELB though.
Access to service exposed via AWS ELB should use the ELB DNS entries rather than the IP addresses directly.
This is because AWS ELB may change the IP address of the load balancer.
However, in federation, DNS entries use A records (and multiple A records). If the IP changes, this needs to be reconciled.

