/*
Copyright 2016 The Kubernetes Authors All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var app = angular.module('KubernetesScaleDemo', ['ngMaterial', 'chart.js'])
    .config(['ChartJsProvider', function(ChartJsProvider) {
        // Configure all charts
        ChartJsProvider.setOptions({
            animation: false,
            responsive: true
        });
    }]);

var limit = 40;

var ScaleApp = function(http, scope, q) {
    console.log("Loading a list of Aggregator Names from Local Storage");
    this.aggregatorNames = store.get('aggregatorNames');
    if (!this.aggregatorNames) {
      console.log("Aggregator Names not in Local Storage, setting default values.");
      this.aggregatorNames = {"buttonmasher-aggregator.default.hybrid-cloud-rocks.svc.us-central1-c.us-central1.hybrid-cloud-rocks.com":"Central","buttonmasher-aggregator.default.hybrid-cloud-rocks.svc.asia-east1-c.asia-east1.hybrid-cloud-rocks.com":"Asia", "buttonmasher-aggregator.default.hybrid-cloud-rocks.svc.europe-west1-c.europe-west1.hybrid-cloud-rocks.com": "Europe"};
      store.set('aggregatorNames', this.aggregatorNames);
    }
    console.log("Use your browser's Developer Tool to update configurations in the Local Storage");
    this.aggregators = Object.keys(this.aggregatorNames);

    this.http = http;
    this.scope = scope;
    this.q = q;
    this.fullData = {};

    this.labels = [];
    for (var i = 0; i < limit; i++) {
        this.labels.push(i);
    }

    this.qpsData = [
        []
    ];
    this.qpsSeries = ['QPS'];
    this.qpsOptions = {
        //scaleOverride : false,
        //scaleSteps : 20,
        //scaleStepWidth : 1000,
        //scaleStartValue: 0,
        scaleBeginAtZero: true,
        bezierCurve: false
    }
    this.qpsColors = [{
        "fillColor": 'rgba(232, 127, 12, 0.2)',
        "strokeColor": 'rgba(232, 127, 12, 0.8)',
        "highlightFill": 'rgba(232, 127, 12, 0.8)',
        "highlightStroke": 'rgba(232, 127, 12, 0.8)'
    }];

    this.latencyData = [
        [],
        []
    ];
    this.latencySeries = ['Mean', '99th'];
    this.latencyOptions = {
        "scaleOverride": true,
        "scaleSteps": 10,
        "scaleStepWidth": 100,
        "scaleStartValue": 0,
        "scaleLabel": "<%=value + 'ms'%>"
    }

    this.availData = [
        [],
        []
    ];
    this.availSeries = ['Availability', 'Errors'];
    this.availOptions = {
        "scaleOverride": true,
        "scaleSteps": 10,
        "scaleStepWidth": 10,
        "scaleStartValue": 0,
    };
    this.availColors = [{
            "fillColor": 'rgba(47, 132, 71, 0.2)',
            "strokeColor": 'rgba(47, 132, 71, 0.8)',
            "highlightFill": 'rgba(47, 132, 71, 0.8)',
            "highlightStroke": 'rgba(47, 132, 71, 0.8)'
        },
        {
            "fillColor": 'rgba(132, 47, 71, 0.2)',
            "strokeColor": 'rgba(132, 47, 71, 0.8)',
            "highlightFill": 'rgba(132, 47, 71, 0.8)',
            "highlightStroke": 'rgba(132, 47, 71, 0.8)'
        }
    ];
};

ScaleApp.prototype.onClick = function(data) {};

// Fetch data from the server and update the data to display
ScaleApp.prototype.refresh = function() {
    if (this.refreshInProgress) {
        return;
    }
    this.refreshInProgress = true;
    var promises = [];
    var thiz = this;
    angular.forEach(this.aggregators, function(aggregator) {
        promises.push(thiz.http.get("http://" + aggregator + ":8080/api/aggregator/stats")
            .success(function(data) {
                thiz.fullData[aggregator] = data;
            }.bind(thiz))
            .error(function(data) {
                console.log("Error!");
                console.log(data);
            }));
    });

    /*
    promises.push(this.http.get("/api/v1/pods?labelSelector=app=buttonmasher-backend")
    .success(function(data) {
	    this.servers = data;
	}.bind(this))
    .error(function(data) {
	    console.log("Error!");
	    console.log(data);
	}));

    promises.push(this.http.get("/api/v1/pods?labelSelector=run=vegeta")
    .success(function(data) {
	    this.loadbots = data;
	}.bind(this))
    .error(function(data) {
	    console.log("Error!");
	    console.log(data);
	}));
  */
    var doneFn = function() { this.refreshInProgress = false; }.bind(this);
    this.q.all(promises).then(doneFn, doneFn);
};

ScaleApp.prototype.getVersionedServers = function() {
    var servers = [];

    angular.forEach(this.fullData, function(aggregator, key) {
        angular.forEach(aggregator.stats, function(stat) {
            servers.push(stat);
        });
    });

    return servers.sort(function(a, b) {
        if (a.v < b.v) { return -1; } else if (a.v > b.v) { return 1; } else { return 0; }
    });
};

ScaleApp.prototype.getVersionedServerCount = function() {
    var counts = {};
    angular.forEach(this.fullData, function(aggregator, key) {
        angular.forEach(aggregator.stats, function(stat) {
            if (!stat.v) { stat.v = ' '; }
            if (!counts[stat.v]) { counts[stat.v] = 1; } else { counts[stat.v]++ }
        });
    });

    return counts;
}

ScaleApp.prototype.getServerCount = function() {
    var count = 0;
    angular.forEach(this.fullData, function(aggregator) {
        if (aggregator.servers) {
            count += aggregator.servers;
        }
    });
    return count;
};

/*
ScaleApp.prototype.getLoadbotCount = function() {
    if (!this.loadbots || !this.loadbots.items) {
	return 0;
    }
    var count = 0;
    angular.forEach(this.loadbots.items, function(pod) {
	    if (pod.status.phase == "Running") {
		count++;
	    }
	});
    return count;
};
*/

/*
ScaleApp.prototype.getLoadbotReports = function() {
    if (!this.loadbots) {
	return nil
    }
    var promises = []
    for (var i = 0; i < this.loadbots.items.length; i++) {
	var pod = this.loadbots.items[i];
	var promise = this.http.get("/api/v1/proxy/namespaces/default/pods/" + pod.metadata.name + ":8080/")
	.success(function(data) {
		this.loadData = data;
	    }.bind(pod))
	.error(function(data) {
		console.log("Error loading loadbot");
		console.log(data);
	    });
	promises.push(promise)
    }

    this.q.all(promises).then(function() {
	    this.updateGraphData();
	}.bind(this));

};
*/

ScaleApp.prototype.slideWindow = function(data, newPoint) {
    if (data.length < limit) {
        data.push(newPoint);
        return data;
    }
    var newData = [];
    for (var i = 0; i < limit; i++) {
        newData[i] = data[i + 1];
    }
    newData[limit - 1] = newPoint;

    return newData;
}

ScaleApp.prototype.getAggregatorName = function(aggregator) {
    if (this.aggregatorNames[aggregator]) { return this.aggregatorNames[aggregator]; } else { return aggregator.replace(/^aggregator-/, '').replace(/\..*/, ''); }
}

ScaleApp.prototype.updateGraphData = function() {
    var qps = this.getQPS();
    /*
    var latency = this.getLatency();
    var success = this.getSuccess();
    */

    var i = 0;
    var thiz = this;
    angular.forEach(qps, function(val, key) {
        if (!thiz.qpsData[i]) {
            thiz.qpsData[i] = [];
        }
        thiz.qpsData[i] = thiz.slideWindow(thiz.qpsData[i], val);
        i++;
    });
};

ScaleApp.prototype.getQPS = function() {
    var qps = {};
    angular.forEach(this.fullData, function(aggregator, key) {
        qps[key] = 0;
        angular.forEach(aggregator.stats, function(stat) {
            if (stat.rps) {
                qps[key] += stat.rps;
            }
        });
    });
    return qps;
};

ScaleApp.prototype.getNumServers = function() {
    return this.getNumPods(this.servers);
};

ScaleApp.prototype.getNumLoadbots = function() {
    return this.getNumPods(this.loadbots);
};

ScaleApp.prototype.getNumPods = function(pods) {
    if (pods) {
        return pods.items.length;
    }
    return 0;
};

ScaleApp.prototype.getVersionColor = function(version) {
    if (version == "v1") {
        return "#4285f4";
    }
    if (version == "v2") {
        return "#20a229";
    }
    return "#DDDDDD";
};


app.controller('AppCtrl', ['$scope', '$http', '$interval', '$q', function($scope, $http, $interval, $q) {
    $scope.controller = new ScaleApp($http, $scope, $q);
    $scope.controller.refresh();

    $interval($scope.controller.refresh.bind($scope.controller), 1000)
    $interval($scope.controller.updateGraphData.bind($scope.controller), 1000)
}]);
