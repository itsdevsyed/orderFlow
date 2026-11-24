import {
    Registry,
    collectDefaultMetrics,
    Counter,
    Histogram
} from "prom-client";

export const register = new Registry();

// Collect Node.js runtime metrics
collectDefaultMetrics({
    register
});

// Count HTTP requests
export const httpRequestsTotal = new Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"],
    registers: [register]
});

// Measure HTTP request duration
export const httpRequestDuration = new Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    registers: [register]
});
