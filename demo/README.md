## Configure Short DNS names
Kubernetes federation will create long DNS names, such as:
* `buttonmasher-backend.default.hybrid-cloud-rocks.svc.hybrid-cloud-rocks.com.`
* `buttonmasher-frontend.default.hybrid-cloud-rocks.svc.hybrid-cloud-rocks.com.`
* `buttonmasher-visualizer.default.hybrid-cloud-rocks.svc.hybrid-cloud-rocks.com.`

Make a shorter entry to CNAME to the longer DNS names, e.g.:
* stats CNAME 60 buttonmasher-visualizer.default.hybrid-cloud-rocks.svc.hybrid-cloud-rocks.com.

## Update Visualizer Configuration
If you are running this in your own domain name, you'll need to update configuration for the visualizer.

The Visualizer retrieves its QPS data from the Aggregator service deployed in each cluster.

The Aggregator endpoints that the Visualizer uses are stored and retrieved from browser's local storage. If no local storage entry exists, it'll store default values that point to `hybrid-cloud-rocks.com`. You can use your browser to update the local storage values to point to your Aggregators.
