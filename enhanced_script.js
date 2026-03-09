/**
 * BANKER'S ALGORITHM SIMULATOR - ENHANCED FRONTEND
 * Interactive learning platform with visualizations and real-time calculations
 */

// ========================================
// STATE MANAGEMENT
// ========================================

const state = {
    numProcesses: 5,
    numResources: 3,
    allocation: {},
    maximum: {},
    available: {},
    need: {},
    safeSequence: [],
    isSafe: false,
    executionLog: [],
    isCalculating: false
};

// Sample data for realistic example
const SAMPLE_DATA = {
    processes: 5,
    resources: 3,
    allocation: {
        'P0': { 'A': 0, 'B': 1, 'C': 0 },
        'P1': { 'A': 2, 'B': 0, 'C': 0 },
        'P2': { 'A': 3, 'B': 0, 'C': 2 },
        'P3': { 'A': 2, 'B': 1, 'C': 1 },
        'P4': { 'A': 0, 'B': 0, 'C': 2 }
    },
    maximum: {
        'P0': { 'A': 7, 'B': 5, 'C': 3 },
        'P1': { 'A': 3, 'B': 2, 'C': 2 },
        'P2': { 'A': 9, 'B': 0, 'C': 2 },
        'P3': { 'A': 2, 'B': 2, 'C': 2 },
        'P4': { 'A': 4, 'B': 3, 'C': 3 }
    },
    available: { 'A': 3, 'B': 3, 'C': 2 }
};

// Chart instances
let charts = {
    resourceChart: null,
    needChart: null,
    processChart: null,
    timelineChart: null
};

// ========================================
// DOM ELEMENT REFERENCES
// ========================================

const elements = {
    numProcesses: document.getElementById('numProcesses'),
    numResources: document.getElementById('numResources'),
    generateBtn: document.getElementById('generateBtn'),
    loadSampleBtn: document.getElementById('loadSampleBtn'),
    resetBtn: document.getElementById('resetBtn'),
    calculateBtn: document.getElementById('calculateBtn'),
    
    availableDisplay: document.getElementById('availableDisplay'),
    allocationDisplay: document.getElementById('allocationDisplay'),
    maximumDisplay: document.getElementById('maximumDisplay'),
    needDisplay: document.getElementById('needDisplay'),
    
    resultsSection: document.getElementById('resultsSection'),
    resultStatus: document.getElementById('resultStatus'),
    safeSequenceDisplay: document.getElementById('safeSequenceDisplay'),
    executionLog: document.getElementById('executionLog'),
    explanationText: document.getElementById('explanationText'),
    progressBarsContainer: document.getElementById('progressBarsContainer'),
    
    resourceChart: document.getElementById('resourceChart'),
    needChart: document.getElementById('needChart'),
    processChart: document.getElementById('processChart'),
    timelineChart: document.getElementById('timelineChart')
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Application loaded successfully');
    initializeEventListeners();
    loadSampleData();
});

function initializeEventListeners() {
    elements.generateBtn.addEventListener('click', generateRandomData);
    elements.loadSampleBtn.addEventListener('click', loadSampleData);
    elements.resetBtn.addEventListener('click', resetApplication);
    elements.calculateBtn.addEventListener('click', runSafetyAlgorithm);
    
    // Validation on input change
    elements.numProcesses.addEventListener('change', validateInputs);
    elements.numResources.addEventListener('change', validateInputs);
}

// ========================================
// INPUT VALIDATION
// ========================================

function validateInputs() {
    const processes = parseInt(elements.numProcesses.value) || 2;
    const resources = parseInt(elements.numResources.value) || 2;
    
    elements.numProcesses.value = Math.max(2, Math.min(10, processes));
    elements.numResources.value = Math.max(2, Math.min(5, resources));
}

// ========================================
// DATA GENERATION
// ========================================

function generateRandomData() {
    validateInputs();
    const numProcesses = parseInt(elements.numProcesses.value);
    const numResources = parseInt(elements.numResources.value);
    
    state.numProcesses = numProcesses;
    state.numResources = numResources;
    
    state.allocation = {};
    state.maximum = {};
    state.available = {};
    state.need = {};
    
    // Generate matrices
    for (let i = 0; i < numProcesses; i++) {
        const processId = `P${i}`;
        state.allocation[processId] = {};
        state.maximum[processId] = {};
        state.need[processId] = {};
        
        for (let j = 0; j < numResources; j++) {
            const resourceId = String.fromCharCode(65 + j); // A, B, C, ...
            
            state.allocation[processId][resourceId] = Math.floor(Math.random() * 5);
            state.maximum[processId][resourceId] = state.allocation[processId][resourceId] + Math.floor(Math.random() * 4) + 1;
            state.need[processId][resourceId] = state.maximum[processId][resourceId] - state.allocation[processId][resourceId];
        }
    }
    
    // Generate available
    for (let j = 0; j < numResources; j++) {
        const resourceId = String.fromCharCode(65 + j);
        state.available[resourceId] = Math.floor(Math.random() * 4) + 2;
    }
    
    console.log('📊 Random data generated');
    displayMatrices();
}

function loadSampleData() {
    state.numProcesses = SAMPLE_DATA.processes;
    state.numResources = SAMPLE_DATA.resources;
    state.allocation = JSON.parse(JSON.stringify(SAMPLE_DATA.allocation));
    state.maximum = JSON.parse(JSON.stringify(SAMPLE_DATA.maximum));
    state.available = JSON.parse(JSON.stringify(SAMPLE_DATA.available));
    
    // Calculate need
    state.need = {};
    for (const process in state.maximum) {
        state.need[process] = {};
        for (const resource in state.maximum[process]) {
            state.need[process][resource] = state.maximum[process][resource] - state.allocation[process][resource];
        }
    }
    
    elements.numProcesses.value = SAMPLE_DATA.processes;
    elements.numResources.value = SAMPLE_DATA.resources;
    
    console.log('📚 Sample data loaded');
    displayMatrices();
}

function resetApplication() {
    state.safeSequence = [];
    state.isSafe = false;
    state.executionLog = [];
    elements.resultsSection.style.display = 'none';
    console.log('🔄 Application reset');
}

// ========================================
// MATRIX DISPLAY
// ========================================

function displayMatrices() {
    // Available
    let availableText = 'Available:\\n';
    for (const resource in state.available) {
        availableText += `${resource}: ${state.available[resource]}\\n`;
    }
    elements.availableDisplay.textContent = availableText;
    
    // Allocation
    let allocationText = 'Allocation (Current):\\n';
    for (const process in state.allocation) {
        allocationText += `${process}: `;
        const values = [];
        for (const resource in state.allocation[process]) {
            values.push(`${resource}=${state.allocation[process][resource]}`);
        }
        allocationText += values.join(', ') + '\\n';
    }
    elements.allocationDisplay.textContent = allocationText;
    
    // Maximum
    let maximumText = 'Maximum Demand:\\n';
    for (const process in state.maximum) {
        maximumText += `${process}: `;
        const values = [];
        for (const resource in state.maximum[process]) {
            values.push(`${resource}=${state.maximum[process][resource]}`);
        }
        maximumText += values.join(', ') + '\\n';
    }
    elements.maximumDisplay.textContent = maximumText;
    
    // Need
    let needText = 'Need (Maximum - Allocated):\\n';
    for (const process in state.need) {
        needText += `${process}: `;
        const values = [];
        for (const resource in state.need[process]) {
            values.push(`${resource}=${state.need[process][resource]}`);
        }
        needText += values.join(', ') + '\\n';
    }
    elements.needDisplay.textContent = needText;
    
    console.log('✅ Matrices displayed');
}

// ========================================
// SAFETY ALGORITHM
// ========================================

function canProcessComplete(processId, need, work) {
    for (const resource in need[processId]) {
        if ((need[processId][resource] || 0) > (work[resource] || 0)) {
            return false;
        }
    }
    return true;
}

function runSafetyAlgorithm() {
    if (state.isCalculating) return;
    
    state.isCalculating = true;
    elements.calculateBtn.disabled = true;
    
    try {
        const processIds = Object.keys(state.allocation);
        const numProcesses = processIds.length;
        
        // Initialize work = available, finish = all false
        const work = { ...state.available };
        const finish = {};
        state.safeSequence = [];
        state.executionLog = [];
        
        processIds.forEach(pid => {
            finish[pid] = false;
        });
        
        state.executionLog.push('═══════════════════════════════════');
        state.executionLog.push('SAFETY ALGORITHM EXECUTION');
        state.executionLog.push('═══════════════════════════════════');
        state.executionLog.push('');
        state.executionLog.push('Initial State:');
        state.executionLog.push(`Work (Available): ${JSON.stringify(work)}`);
        state.executionLog.push('');
        
        // Find safe sequence
        for (let count = 0; count < numProcesses; count++) {
            let found = false;
            
            for (const processId of processIds) {
                if (!finish[processId] && canProcessComplete(processId, state.need, work)) {
                    state.executionLog.push(`▶️  ITERATION ${count + 1}: Process ${processId} can complete`);
                    state.executionLog.push(`   Condition: Need ≤ Work`);
                    const needs = Object.entries(state.need[processId])
                        .map(([r, v]) => `${r}:${v}`)
                        .join(', ');
                    const works = Object.entries(work)
                        .map(([r, v]) => `${r}:${v}`)
                        .join(', ');
                    state.executionLog.push(`   Need(${processId}): [${needs}]`);
                    state.executionLog.push(`   Work: [${works}]`);
                    
                    // Simulate process completion - release resources
                    for (const resource in state.allocation[processId]) {
                        work[resource] = (work[resource] || 0) + state.allocation[processId][resource];
                    }
                    
                    state.executionLog.push(`   ✓ ${processId} completes`);
                    state.executionLog.push(`   Work after release: ${JSON.stringify(work)}`);
                    
                    finish[processId] = true;
                    state.safeSequence.push(processId);
                    state.executionLog.push('');
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                state.isSafe = false;
                state.executionLog.push('❌ UNSAFE STATE DETECTED');
                state.executionLog.push('');
                state.executionLog.push('No process can complete in this iteration.');
                state.executionLog.push('This indicates a DEADLOCK situation.');
                displayResults();
                return;
            }
        }
        
        // All processes completed
        state.isSafe = true;
        state.executionLog.push('═══════════════════════════════════');
        state.executionLog.push('✅ SAFE STATE CONFIRMED');
        state.executionLog.push('═══════════════════════════════════');
        state.executionLog.push('');
        state.executionLog.push(`Safe Sequence: ${state.safeSequence.join(' → ')}`);
        state.executionLog.push('');
        state.executionLog.push('All processes can complete without deadlock.');
        
        displayResults();
        
    } finally {
        state.isCalculating = false;
        elements.calculateBtn.disabled = false;
    }
}

// ========================================
// RESULTS DISPLAY
// ========================================

function displayResults() {
    elements.resultsSection.style.display = 'block';
    
    // Status
    if (state.isSafe) {
        elements.resultStatus.className = 'result-status safe';
        elements.resultStatus.innerHTML = '✅ SAFE STATE - No Deadlock Risk';
    } else {
        elements.resultStatus.className = 'result-status unsafe';
        elements.resultStatus.innerHTML = '❌ UNSAFE STATE - Potential Deadlock';
    }
    
    // Safe Sequence
    if (state.isSafe) {
        elements.safeSequenceDisplay.innerHTML = `<strong>Safe Sequence:</strong><br>${state.safeSequence.join(' → ')}`;
    } else {
        elements.safeSequenceDisplay.innerHTML = '<strong>No Safe Sequence Exists</strong><br>System cannot guarantee completion of all processes.';
    }
    
    // Execution Log
    elements.executionLog.textContent = state.executionLog.join('\\n');
    
    // Explanation
    if (state.isSafe) {
        elements.explanationText.innerHTML = `
            <strong>✅ The system is in a SAFE state.</strong><br><br>
            A safe sequence of process execution exists: <strong>${state.safeSequence.join(' → ')}</strong>. 
            Each process in this sequence can complete and release its resources without causing deadlock. 
            The system can safely grant resource requests following this sequence.
        `;
    } else {
        elements.explanationText.innerHTML = `
            <strong>❌ The system is in an UNSAFE state.</strong><br><br>
            No safe sequence exists where all processes can complete. At least one process will be unable to 
            obtain the resources it needs even after other processes complete. This violates the safety condition 
            and the resource allocation must be rejected to prevent deadlock.
        `;
    }
    
    // Update visualizations
    updateCharts();
    updateProgressBars();
    
    console.log(`📊 Results displayed - System is ${state.isSafe ? 'SAFE' : 'UNSAFE'}`);
}

// ========================================
// CHART VISUALIZATIONS
// ========================================

function updateCharts() {
    const processIds = Object.keys(state.allocation);
    const resources = Object.keys(state.available);
    
    // Calculate totals for each resource
    const allocatedByResource = {};
    const maximumByResource = {};
    const needByResource = {};
    
    for (const resource of resources) {
        allocatedByResource[resource] = 0;
        maximumByResource[resource] = 0;
        needByResource[resource] = 0;
        
        for (const process of processIds) {
            allocatedByResource[resource] += state.allocation[process][resource] || 0;
            maximumByResource[resource] += state.maximum[process][resource] || 0;
            needByResource[resource] += state.need[process][resource] || 0;
        }
    }
    
    const ctx1 = elements.resourceChart.getContext('2d');
    if (charts.resourceChart) charts.resourceChart.destroy();
    charts.resourceChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: resources,
            datasets: [
                {
                    label: 'Allocated',
                    data: resources.map(r => allocatedByResource[r]),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Maximum',
                    data: resources.map(r => maximumByResource[r]),
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Available',
                    data: resources.map(r => state.available[r]),
                    backgroundColor: 'rgba(16, 185, 129, 0.6)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#f1f5f9' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
    
    // Need vs Available
    const ctx2 = elements.needChart.getContext('2d');
    if (charts.needChart) charts.needChart.destroy();
    charts.needChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: resources,
            datasets: [
                {
                    label: 'Total Need',
                    data: resources.map(r => needByResource[r]),
                    backgroundColor: 'rgba(236, 72, 153, 0.8)',
                    borderColor: 'rgba(236, 72, 153, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Available',
                    data: resources.map(r => state.available[r]),
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#f1f5f9' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
    
    // Per-process comparison
    const ctx3 = elements.processChart.getContext('2d');
    if (charts.processChart) charts.processChart.destroy();
    
    const allocationData = {};
    const maximumData = {};
    
    for (const process of processIds) {
        const allocTotal = Object.values(state.allocation[process]).reduce((a, b) => a + b, 0);
        const maxTotal = Object.values(state.maximum[process]).reduce((a, b) => a + b, 0);
        allocationData[process] = allocTotal;
        maximumData[process] = maxTotal;
    }
    
    charts.processChart = new Chart(ctx3, {
        type: 'bar',
        data: {
            labels: processIds,
            datasets: [
                {
                    label: 'Allocated Resources',
                    data: processIds.map(p => allocationData[p]),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Maximum Demand',
                    data: processIds.map(p => maximumData[p]),
                    backgroundColor: 'rgba(139, 92, 246, 0.6)',
                    borderColor: 'rgba(139, 92, 246, 1)',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#f1f5f9' }
                }
            },
            scales: {
                y: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#cbd5e1' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
    
    // State timeline
    const ctx4 = elements.timelineChart.getContext('2d');
    if (charts.timelineChart) charts.timelineChart.destroy();
    
    const stateData = [
        { label: 'System State', value: state.isSafe ? 100 : 0, color: state.isSafe ? '#10b981' : '#ef4444' }
    ];
    
    charts.timelineChart = new Chart(ctx4, {
        type: 'doughnut',
        data: {
            labels: ['Safe Processes', 'Unsafe Risk'],
            datasets: [{
                data: state.isSafe ? [100, 0] : [0, 100],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#f1f5f9' }
                }
            }
        }
    });
    
    console.log('📈 Charts updated');
}

// ========================================
// PROGRESS BARS
// ========================================

function updateProgressBars() {
    const processIds = Object.keys(state.allocation);
    const resources = Object.keys(state.available);
    
    let html = '';
    
    for (const resource of resources) {
        let allocated = 0;
        let maximum = 0;
        
        for (const process of processIds) {
            allocated += state.allocation[process][resource] || 0;
            maximum += state.maximum[process][resource] || 0;
        }
        
        const percentage = maximum > 0 ? (allocated / maximum) * 100 : 0;
        
        html += `
            <div class="progress-item">
                <div class="progress-label">
                    <span>Resource ${resource}</span>
                    <span>${allocated}/${maximum}</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
    
    elements.progressBarsContainer.innerHTML = html;
    console.log('📊 Progress bars updated');
}

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Debounce for input changes
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

console.log('🚀 Banker\'s Algorithm Simulator loaded successfully');
