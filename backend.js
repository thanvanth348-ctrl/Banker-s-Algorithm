/**
 * Backend Server for Banker's Algorithm Simulator
 * API endpoints for generating matrices and running calculations
 */

import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Generate random matrices for given processes and resources
 */
function generateMatrices(numProcesses, numResources) {
    const allocation = {};
    const maximum = {};
    const available = {};
    const need = {};

    // Generate allocation and maximum matrices
    for (let i = 0; i < numProcesses; i++) {
        allocation[`P${i}`] = {};
        maximum[`P${i}`] = {};
        need[`P${i}`] = {};

        for (let j = 0; j < numResources; j++) {
            const resChar = String.fromCharCode(65 + j); // A, B, C, etc.
            
            allocation[`P${i}`][resChar] = Math.floor(Math.random() * 5);
            maximum[`P${i}`][resChar] = allocation[`P${i}`][resChar] + Math.floor(Math.random() * 4) + 1;
            need[`P${i}`][resChar] = maximum[`P${i}`][resChar] - allocation[`P${i}`][resChar];
        }
    }

    // Generate available resources
    for (let j = 0; j < numResources; j++) {
        const resChar = String.fromCharCode(65 + j);
        available[resChar] = Math.floor(Math.random() * 3) + 1;
    }

    return { allocation, maximum, available, need };
}

/**
 * Check if a process can complete with given work resources
 */
function canComplete(processId, need, work) {
    for (const res in need[processId]) {
        if ((need[processId][res] || 0) > (work[res] || 0)) {
            return false;
        }
    }
    return true;
}

/**
 * Run the Banker's Algorithm safety check
 */
function runSafetyAlgorithm(allocation, need, available) {
    const processIds = Object.keys(allocation);
    const numProcesses = processIds.length;

    // Initialize work and finish
    const work = { ...available };
    const finish = {};
    const safeSequence = [];
    const executionLog = [];

    processIds.forEach(pid => {
        finish[pid] = false;
    });

    executionLog.push(`Starting Safety Algorithm...`);
    executionLog.push(`Work (Available): ${JSON.stringify(work)}`);
    executionLog.push('');

    // Find safe sequence
    for (let count = 0; count < numProcesses; count++) {
        let found = false;

        for (const processId of processIds) {
            if (!finish[processId] && canComplete(processId, need, work)) {
                executionLog.push(`→ Process ${processId} can complete (Need ≤ Work)`);

                // Simulate process completion
                for (const res in allocation[processId]) {
                    work[res] = (work[res] || 0) + allocation[processId][res];
                }

                finish[processId] = true;
                safeSequence.push(processId);
                executionLog.push(`  Releasing resources: Work = ${JSON.stringify(work)}`);
                executionLog.push('');
                found = true;
                break;
            }
        }

        if (!found) {
            executionLog.push(`❌ No process can complete. System is UNSAFE!`);
            return {
                isSafe: false,
                safeSequence: [],
                executionLog,
                explanation: 'The system is in an UNSAFE state. No sequence of processes exists where all can complete without deadlock.'
            };
        }
    }

    executionLog.push(`✅ All processes can complete. System is SAFE!`);
    executionLog.push(`Safe Sequence: ${safeSequence.join(' → ')}`);

    return {
        isSafe: true,
        safeSequence,
        executionLog,
        explanation: `The system is in a SAFE state. A safe sequence of processes was found: ${safeSequence.join(' → ')}. Each process can complete and release its resources without causing a deadlock.`
    };
}

// ========================================
// API ENDPOINTS
// ========================================

/**
 * GET /api/generate-tables
 * Generate initial matrices for the system
 */
app.get('/api/generate-tables', (req, res) => {
    try {
        const numProcesses = Math.min(Math.max(parseInt(req.query.processes) || 5, 2), 10);
        const numResources = Math.min(Math.max(parseInt(req.query.resources) || 3, 2), 5);

        const matrices = generateMatrices(numProcesses, numResources);

        res.json({
            success: true,
            data: {
                numProcesses,
                numResources,
                allocation: matrices.allocation,
                maximum: matrices.maximum,
                available: matrices.available,
                need: matrices.need,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/calculate-safety
 * Run safety algorithm on provided matrices
 */
app.post('/api/calculate-safety', (req, res) => {
    try {
        const { allocation, need, available } = req.body;

        if (!allocation || !need || !available) {
            return res.status(400).json({
                success: false,
                error: 'Missing required matrices: allocation, need, available'
            });
        }

        const result = runSafetyAlgorithm(allocation, need, available);

        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/request-resources
 * Handle a resource request from a process (future feature)
 */
app.post('/api/request-resources', (req, res) => {
    try {
        const { allocation, maximum, need, available, processId, request } = req.body;

        // Validate request doesn't exceed need
        if (need[processId]) {
            for (const res in request) {
                if ((request[res] || 0) > (need[processId][res] || 0)) {
                    return res.status(400).json({
                        success: false,
                        granted: false,
                        reason: `Request exceeds declared need for process ${processId}`
                    });
                }
            }
        }

        // Simulate the request
        const simAllocation = JSON.parse(JSON.stringify(allocation));
        const simNeed = JSON.parse(JSON.stringify(need));
        const simAvailable = { ...available };

        for (const res in request) {
            if ((request[res] || 0) > (simAvailable[res] || 0)) {
                return res.json({
                    success: true,
                    granted: false,
                    reason: `Insufficient resources available`
                });
            }
            simAvailable[res] -= request[res];
            simAllocation[processId][res] = (simAllocation[processId][res] || 0) + request[res];
            simNeed[processId][res] = (simNeed[processId][res] || 0) - request[res];
        }

        // Check if new state is safe
        const result = runSafetyAlgorithm(simAllocation, simNeed, simAvailable);

        res.json({
            success: true,
            granted: result.isSafe,
            reason: result.isSafe
                ? `Request safely granted. New safe sequence: ${result.safeSequence.join(' → ')}`
                : `Request denied to prevent deadlock`,
            newState: result.isSafe ? {
                allocation: simAllocation,
                available: simAvailable,
                need: simNeed
            } : null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Backend server is running',
        timestamp: new Date().toISOString()
    });
});

// ========================================
// SERVER START
// ========================================

app.listen(PORT, () => {
    console.log(`\n  🏦 Banker's Algorithm Backend Server\n`);
    console.log(`  ➜ http://localhost:${PORT}`);
    console.log(`  ➜ API Health: http://localhost:${PORT}/api/health`);
    console.log(`  ➜ Ready to accept requests\n`);
});
