// Load test script - 50 bots connecting and sending inputs
// Usage: pnpm tsx packages/server/src/tools/loadTest.ts
import WebSocket from 'ws';
import { performance } from 'perf_hooks';
import { BinaryProtocol } from './packages/shared/protocol.ts';
const SERVER_URL = process.env.WS_URL || 'ws://localhost:2567';
const BOT_COUNT = parseInt(process.env.BOT_COUNT || '50', 10);
const TEST_DURATION_MS = parseInt(process.env.TEST_DURATION || '30000', 10);
const botMetrics = [];
function createBot(id) {
    return new Promise((resolve) => {
        const metrics = {
            id,
            connected: false,
            messagesSent: 0,
            messagesReceived: 0,
            latencies: [],
            errors: 0
        };
        botMetrics.push(metrics);
        const ws = new WebSocket(`${SERVER_URL}/arena`);
        let inputSequence = 0;
        let inputInterval;
        const pingTimestamps = new Map();
        ws.on('open', () => {
            metrics.connected = true;
            metrics.connectTime = performance.now();
            console.log(`✅ Bot ${id} connected`);
            // Send input every 50ms (20Hz)
            inputInterval = setInterval(() => {
                if (ws.readyState !== WebSocket.OPEN)
                    return;
                const input = {
                    seq: inputSequence++,
                    timestamp: Date.now(),
                    moveX: (Math.random() * 2) - 1, // -1 to 1
                    moveY: (Math.random() * 2) - 1,
                    aimAngle: Math.random() * Math.PI * 2,
                    fire: Math.random() > 0.7,
                    dash: Math.random() > 0.95
                };
                try {
                    const encoded = BinaryProtocol.encodeInput(input);
                    ws.send(encoded);
                    metrics.messagesSent++;
                    pingTimestamps.set(input.seq, performance.now());
                }
                catch (error) {
                    metrics.errors++;
                    console.error(`❌ Bot ${id} send error:`, error);
                }
            }, 50);
        });
        ws.on('message', (data) => {
            metrics.messagesReceived++;
            // Calculate latency (simplified - assumes server echo or snapshot)
            const now = performance.now();
            // In real scenario, we'd decode the snapshot and check sequence numbers
            // For load test, we just track any response
            if (pingTimestamps.size > 0) {
                const oldest = Array.from(pingTimestamps.entries())[0];
                if (oldest) {
                    const latency = now - oldest[1];
                    metrics.latencies.push(latency);
                    pingTimestamps.delete(oldest[0]);
                }
            }
        });
        ws.on('error', (error) => {
            metrics.errors++;
            console.error(`❌ Bot ${id} error:`, error.message);
        });
        ws.on('close', () => {
            console.log(`🔌 Bot ${id} disconnected`);
            clearInterval(inputInterval);
        });
        // Close after test duration
        setTimeout(() => {
            ws.close();
            resolve(metrics);
        }, TEST_DURATION_MS);
    });
}
async function runLoadTest() {
    console.log('🚀 Starting load test...');
    console.log(`📊 Configuration:`);
    console.log(`   Server: ${SERVER_URL}`);
    console.log(`   Bots: ${BOT_COUNT}`);
    console.log(`   Duration: ${TEST_DURATION_MS / 1000}s`);
    console.log('');
    const startTime = performance.now();
    // Create all bots
    const botPromises = [];
    for (let i = 0; i < BOT_COUNT; i++) {
        botPromises.push(createBot(i));
        // Stagger connection to avoid overwhelming server
        if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    // Wait for all bots to complete
    const results = await Promise.all(botPromises);
    const totalTime = (performance.now() - startTime) / 1000;
    // Calculate statistics
    console.log('');
    console.log('📈 LOAD TEST RESULTS');
    console.log('='.repeat(50));
    const connectedBots = results.filter(b => b.connected).length;
    const totalMessagesSent = results.reduce((sum, b) => sum + b.messagesSent, 0);
    const totalMessagesReceived = results.reduce((sum, b) => sum + b.messagesReceived, 0);
    const totalErrors = results.reduce((sum, b) => sum + b.errors, 0);
    console.log(`✅ Bots Connected: ${connectedBots}/${BOT_COUNT}`);
    console.log(`📤 Total Messages Sent: ${totalMessagesSent.toLocaleString()}`);
    console.log(`📥 Total Messages Received: ${totalMessagesReceived.toLocaleString()}`);
    console.log(`⚠️  Total Errors: ${totalErrors}`);
    console.log(`⏱️  Test Duration: ${totalTime.toFixed(2)}s`);
    console.log('');
    // Latency statistics
    const allLatencies = results.flatMap(b => b.latencies);
    if (allLatencies.length > 0) {
        allLatencies.sort((a, b) => a - b);
        const p50 = allLatencies[Math.floor(allLatencies.length * 0.5)];
        const p95 = allLatencies[Math.floor(allLatencies.length * 0.95)];
        const p99 = allLatencies[Math.floor(allLatencies.length * 0.99)];
        const avg = allLatencies.reduce((sum, l) => sum + l, 0) / allLatencies.length;
        console.log('⚡ LATENCY METRICS:');
        console.log(`   Average: ${avg.toFixed(2)}ms`);
        console.log(`   P50: ${p50.toFixed(2)}ms`);
        console.log(`   P95: ${p95.toFixed(2)}ms`);
        console.log(`   P99: ${p99.toFixed(2)}ms`);
        console.log('');
    }
    // Throughput
    const messagesPerSecond = totalMessagesSent / (TEST_DURATION_MS / 1000);
    console.log('🔥 THROUGHPUT:');
    console.log(`   ${messagesPerSecond.toFixed(0)} messages/second`);
    console.log(`   ${(messagesPerSecond * 120 / 1024).toFixed(2)} KB/s (est. at 120 bytes/packet)`);
    console.log('');
    // Performance assessment
    console.log('🎯 ASSESSMENT:');
    if (connectedBots === BOT_COUNT && totalErrors === 0) {
        console.log('   ✅ All bots connected successfully');
    }
    else {
        console.log(`   ⚠️  ${BOT_COUNT - connectedBots} bots failed to connect`);
    }
    if (allLatencies.length > 0) {
        const p95 = allLatencies[Math.floor(allLatencies.length * 0.95)];
        if (p95 < 100) {
            console.log('   ✅ Excellent latency (P95 < 100ms)');
        }
        else if (p95 < 200) {
            console.log('   ⚠️  Good latency (P95 < 200ms)');
        }
        else {
            console.log('   ❌ High latency (P95 > 200ms) - optimization needed');
        }
    }
    if (totalErrors === 0) {
        console.log('   ✅ No errors during test');
    }
    else {
        console.log(`   ⚠️  ${totalErrors} errors occurred`);
    }
    console.log('');
    console.log('Load test complete! 🎉');
}
// Run the test
runLoadTest().catch(error => {
    console.error('❌ Load test failed:', error);
    process.exit(1);
});
