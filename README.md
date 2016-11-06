## Introduction
This is not an official Google product.

This is a demo that demonstrates Kubernetes federation capabilities with an example application named Buttonmasher.

This is the code base for several Google Cloud Platform NEXT 2016 presentation demos.

## High-level Architecture
At a high-level you'll need the following to run/try the example:

1. A Google Cloud Platform account (You can use [Free trial](https://cloud.google.com/free-trial/))
1. A Google Cloud Platform project
1. Configure multiple Kubernetes clusters on Google Container Engine, and configure federation (Details in Kelsey Hightower's [Kubernetes Cluster Federation instructions](https://github.com/kelseyhightower/kubernetes-cluster-federation))
1. Build and deploy application components:
   * Frontend: a simple frontend with a button that calls the backend API
   * Backend: a simple backend that responds to API calls
   * Aggregator: an aggregator to collect backend statistics (QPS) for each of the federated cluster.
   * Visualizer: a visualization frontend to get the QPS statistics from the aggregator for each of the federated clusters.

The best way to learn is to set up everything manually. But if you are in a hurry, try using the scripts (see Setup)

## Setup
### Bootstrap
See [bootstrap/README.md](bootstrap/README.md)

### The Demo
See [demo/README.md](demo/README.md)
