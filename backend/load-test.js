/**
 * UniHostel Automated Load Test Script
 * Simulates concurrent requests against the UniHostel API to verify scalability and latency.
 * Usage: node load-test.js [target_url] [concurrency] [total_requests]
 * Example: node load-test.js http://localhost:5000 50 500
 */

const http = require('http');
const https = require('https');

const TARGET_URL = process.argv[2] || process.env.API_URL || 'http://localhost:5000';
const CONCURRENCY = parseInt(process.argv[3], 10) || 50;
const TOTAL_REQUESTS = parseInt(process.argv[4], 10) || 500;

console.log('='.repeat(60));
console.log('🚀 UniHostel Scalability & Load Test');
console.log('='.repeat(60));
console.log(`• Target:        ${TARGET_URL}`);
console.log(`• Concurrency:   ${CONCURRENCY} concurrent workers`);
console.log(`• Total Volume:  ${TOTAL_REQUESTS} requests`);
console.log(`• Endpoints:     /api/health, /api/hostels`);
console.log('='.repeat(60));
console.log('Running benchmark...\n');

const endpoints = ['/api/health', '/api/hostels'];

const makeRequest = (url) => {
  return new Promise((resolve) => {
    const start = Date.now();
    const lib = url.startsWith('https') ? https : http;

    const req = lib.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const duration = Date.now() - start;
        resolve({
          statusCode: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        statusCode: 0,
        duration: Date.now() - start,
        success: false,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        statusCode: 408,
        duration: Date.now() - start,
        success: false,
        error: 'Timeout'
      });
    });
  });
};

const runBenchmark = async () => {
  const results = [];
  let completed = 0;
  let running = 0;
  let index = 0;

  return new Promise((resolve) => {
    const next = async () => {
      if (index >= TOTAL_REQUESTS) {
        if (running === 0) {
          resolve(results);
        }
        return;
      }

      const currentIndex = index++;
      running++;
      const endpoint = endpoints[currentIndex % endpoints.length];
      const url = `${TARGET_URL.replace(/\/$/, '')}${endpoint}`;

      const res = await makeRequest(url);
      results.push(res);
      completed++;
      running--;

      if (completed % 100 === 0 || completed === TOTAL_REQUESTS) {
        process.stdout.write(`Progress: ${completed}/${TOTAL_REQUESTS} requests completed...\r`);
      }

      next();
    };

    for (let i = 0; i < CONCURRENCY; i++) {
      next();
    }
  });
};

runBenchmark().then((results) => {
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  
  const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  const min = durations[0] || 0;
  const max = durations[durations.length - 1] || 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] || 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] || 0;

  console.log('\n\n' + '='.repeat(60));
  console.log('📊 Benchmark Results');
  console.log('='.repeat(60));
  console.log(`• Total Requests:     ${results.length}`);
  console.log(`• Success Rate:       ${((successful / results.length) * 100).toFixed(1)}% (${successful} ok, ${failed} failed)`);
  console.log(`• Min Latency:        ${min} ms`);
  console.log(`• Avg Latency:        ${avg} ms`);
  console.log(`• 95th Percentile:    ${p95} ms`);
  console.log(`• 99th Percentile:    ${p99} ms`);
  console.log(`• Max Latency:        ${max} ms`);
  console.log('='.repeat(60));

  if (successful === results.length && avg < 500) {
    console.log('✅ Scalability Check: PASSED (Under 500ms latency under load)\n');
  } else if (successful / results.length > 0.95) {
    console.log('⚠️ Scalability Check: ACCEPTABLE (>95% success rate)\n');
  } else {
    console.log('❌ Scalability Check: FAILED (Too many failures or timeouts)\n');
  }
});
