## Pre-requisite
1. Google Cloud Platform account
1. Google Cloud Platform project
1. Enable Google Compute Engine API and Google Cloud DNS API
1. Installed `gcloud` SDK and installed `kubectl` component
1. DNS domain in order to run the demo

## Deployment

### Do Everything
If you have nothing to start with:
1. `make everything`

### Step by Step
If you want to create the cluster, federation, and deploy the app in different steps, following are the different `make` targets you can run.

#### Create Clusters
1. `cd clusters`
1. Create Clusters: `make create`
1. Fetch Credentials: `make credentials`
1. or, do both: `make clusters-all`

#### Create Federation
1. `cd federation`
1. Make DNS Zone: `make dns`
1. Install Federation API Server & Controller: `make controller`
1. Add clusters to federation: `make federate`
1. or, do everything: `make federation-all`

#### Build Application and Push Containers
This is optional. All the containers are publicly accessible.

1. `cd apps`
1. `make -j4 push`

#### Deploy Demo
1. `cd demo`
1. Deploy Federated Service and Loader Federated ReplicaSet: `make federation-deploy`
1. Deploy Buttonmasher Frontend, Backend, Aggregator, and Visualizer: `make deploy`
1. Make easier to use context names, e.g. gcp-us-central1: `make ez`
1. or, do everything: `make demo-all`

## What's next?
Once you have the clusters created, federated, and the apps deployed, you need to validate that the DNS entries were updated with your the service endpoints.
