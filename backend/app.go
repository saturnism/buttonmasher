// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////////

package main

import (
	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus"
	"log"
	"math"
	"math/rand"
	"net/http"
	"os"
	"sync/atomic"
	"time"
)

var (
  version       = "v2"
	//messages      = [...]string{"Say Hello", "Don't Panic!", "Stay Calm.", "Press!"}
	messages      = [...]string{"Hello!", "GCP Rocks!", "You Rock!", "Woohoo!"}

	requests      uint64
	rps           float64
	last_requests uint64
	last_rps_time time.Time

	requestCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "request_count",
			Help: "Counter of requests broken out for each verb, resource, and HTTP response code.",
		},
		[]string{"verb", "resource", "client", "code"},
	)
	requestLatencies = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "request_latencies",
			Help: "Response latency distribution in microseconds for each verb, resource and client.",
			// Use buckets ranging from 125 ms to 8 seconds.
			Buckets: prometheus.ExponentialBuckets(1000, 2.0, 7),
		},
		[]string{"verb", "resource"},
	)
	requestLatenciesSummary = prometheus.NewSummaryVec(
		prometheus.SummaryOpts{
			Name: "request_latencies_summary",
			Help: "Response latency summary in microseconds for each verb and resource.",
			// Make the sliding window of 1h.
			MaxAge: time.Minute,
		},
		[]string{"verb", "resource"},
	)
)

func round(f float64) int {
	if math.Abs(f) < 0.5 {
		return 0
	}
	return int(f + math.Copysign(0.5, f))
}

func init() {
	rand.Seed(time.Now().UTC().UnixNano())
	last_rps_time = time.Now()

	prometheus.MustRegister(requestCounter)
	prometheus.MustRegister(requestLatencies)
	prometheus.MustRegister(requestLatenciesSummary)
}

func corsFilter() gin.HandlerFunc {
     return func(c *gin.Context) {
         h := c.Writer.Header()
         h.Set("Access-Control-Allow-Origin", "*")
         h.Set("Access-Control-Allow-Methods", "GET, OPTIONS")
         h.Set("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token")
         h.Set("Access-Control-Expose-Headers", "Content-Length")
         h.Set("Access-Control-Allow-Credentials", "true")

         if c.Request.Method == "OPTIONS" {
             c.AbortWithStatus(200)
         } else {
             c.Next()
         }
     }
 }

func main() {
	r := gin.Default()

	tick := time.Tick(1 * time.Second)
	go func() {
		for now := range tick {
			t := atomic.LoadUint64(&requests)
			r := t - last_requests
			ns := now.Sub(last_rps_time)
			rps = float64(r) / float64(round(float64(ns)/float64(time.Second)))
			last_requests = t
			last_rps_time = now

			log.Printf("now: %v, total: %v, r: %v, l: %v, ns: %v, rps: %v", now, t, r, last_requests, ns, rps)
		}
	}()

	r.Use(gin.LoggerWithWriter(os.Stdout, "/api/next"))
  r.Use(corsFilter())

	r.StaticFile("/", "/go/assets/index.html")

	r.GET("/api/healthz", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})
	r.GET("/api/prometheus", gin.WrapH(prometheus.Handler()))
	r.GET("/api/stats", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
      "v":        version,
			"t":        atomic.LoadUint64(&requests),
			"rps":      rps,
		})
	})
	r.GET("/api/next", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"m": messages[rand.Intn(len(messages))],
      "v": version,
		})
		atomic.AddUint64(&requests, 1)
	})

	r.Run()
}
