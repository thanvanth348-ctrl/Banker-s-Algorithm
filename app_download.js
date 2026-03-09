/**
 * Banker's Algorithm Simulator - Frontend with Backend Integration
 * Interactive deadlock avoidance system demonstration
 * 
 * Features:
 * - Backend API integration for matrix generation
 * - Real-time input validation
 * - Step-by-step execution
 * - Dark/Light mode toggle
 * - Responsive design
 */

// Backend API Base URL
const API_BASE_URL = 'http://localhost:3001/api';

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
    currentStep: 0,
    stepByStep: false,
    executionLog: [],
    isCalculating: false,
    backendAvailable: false
};

// ========================================
// DOM ELEMENTS
// ========================================

const elements = {
    numProcesses: document.getElementById('numProcesses'),
    numResources: document.getElementById('numResources'),
    generateBtn: document.getElementById('generateBtn'),
    calculateBtn: document.getElementById('calculateBtn'),
    resetBtn: document.getElementById('resetBtn'),
    nextStepBtn: document.getElementById('nextStepBtn'),
    themeToggle: document.getElementById('themeToggle'),
    
    inputCard: document.getElementById('inputCard'),
    matricesCard: document.getElementById('matricesCard'),
    executionCard: document.getElementById('executionCard'),
    resultCard: document.getElementById('resultCard'),
    
    availableInputs: document.getElementById('availableInputs'),
    allocationMatrix: document.getElementById('allocationMatrix'),
    maximumMatrix: document.getElementById('maximumMatrix'),
    needMatrix: document.getElementById('needMatrix'),
    
    stepByStepToggle: document.getElementById('stepByStepToggle'),
    executionVisualization: document.getElementById('executionVisualization'),
    resourceFlow: document.getElementById('resourceFlow'),
    
    resultAlert: document.getElementById('resultAlert'),
    systemState: document.getElementById('systemState'),
    safeSequence: document.getElementById('safeSequence'),
    explanation: document.getElementById('explanation'),
    
    loadingSpinner: document.getElementById('loadingSpinner')
};

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadTheme();
    checkBackendHealth();
});

function initializeEventListeners() {
    elements.generateBtn.addEventListener('click', handleGenerate);
    elements.calculateBtn.addEventListener('click', handleCalculate);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.nextStepBtn.addEventListener('click', handleNextStep);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.stepByStepToggle.addEventListener('change', handleStepByStepToggle);
    
    // Real-time validation
    elements.numProcesses.addEventListener('change', validateInput);
    elements.numResources.addEventListener('change', validateInput);
}

/**
 * Check if backend server is available
 */
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            state.backendAvailable = true;
            console.log('✅ Backend server is available');
        }
    } catch (error) {
        state.backendAvailable = false;
        console.warn('⚠️ Backend server not available. Using local generation.');
    }
}

// ========================================
// INPUT VALIDATION
// ========================================

function validateInput(e) {
    const value = parseInt(e.target.value);
    
    if (e.target === elements.numProcesses) {
        if (value < 2) elements.numProcesses.value = 2;
        if (value > 10) elements.numProcesses.value = 10;
    } else if (e.target === elements.numResources) {
        if (value < 2) elements.numResources.value = 2;
        if (value > 5) elements.numResources.value = 5;
    }
}

function validateMatrixInput(e) {
    if (e.target.classList.contains('input-small')) {
        const value = parseInt(e.target.value);
        if (value < 0) e.target.value = 0;
        if (value > 20) e.target.value = 20;
        updateNeedMatrix();
    }
}

// ========================================
// MATRIX GENERATION
// ========================================

/**
 * Handle Generate Tables button click
 * Fetches from backend if available, otherwise generates locally
 */
async function handleGenerate() {
    state.numProcesses = parseInt(elements.numProcesses.value);
    state.numResources = parseInt(elements.numResources.value);
    
    elements.loadingSpinner.style.display = 'flex';
    document.querySelector('.loading-spinner p').textContent = 'Generating matrices...';
    
    try {
        if (state.backendAvailable) {
            // Fetch from backend
            const response = await fetch(
                `${API_BASE_URL}/generate-tables?processes=${state.numProcesses}&resources=${state.numResources}`
            );
            
            if (!response.ok) {
                throw new Error('Backend error');
            }
            
            const data = await response.json();
            if (data.success) {
                state.allocation = data.data.allocation;
                state.maximum = data.data.maximum;
                state.available = data.data.available;
                state.need = data.data.need;
                console.log('✅ Matrices generated from backend');
            }
        } else {
            // Generate locally
            initializeMatrices();
            console.log('📱 Matrices generated locally');
        }
        
        // Display the generated matrices
        generateAvailableInputs();
        generateAllocationMatrix();
        generateMaximumMatrix();
        generateNeedMatrix();
        
        // Show matrices card
        elements.matricesCard.style.display = 'block';
        elements.executionCard.style.display = 'none';
        elements.resultCard.style.display = 'none';
        
        elements.loadingSpinner.style.display = 'none';
        
        // Scroll to matrices
        setTimeout(() => {
            elements.matricesCard.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } catch (error) {
        console.error('Error generating matrices:', error);
        // Fallback to local generation
        initializeMatrices();
        generateAvailableInputs();
        generateAllocationMatrix();
        generateMaximumMatrix();
        generateNeedMatrix();
        
        elements.matricesCard.style.display = 'block';
        elements.loadingSpinner.style.display = 'none';
        
        setTimeout(() => {
            elements.matricesCard.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

function initializeMatrices() {
    // Initialize with sample data
    state.allocation = {};
    state.maximum = {};
    state.available = {};
    state.need = {};
    
    for (let i = 0; i < state.numProcesses; i++) {
        state.allocation[`P${i}`] = {};
        state.maximum[`P${i}`] = {};
        state.need[`P${i}`] = {};
        
        for (let j = 0; j < state.numResources; j++) {
            const resChar = String.fromCharCode(65 + j); // A, B, C, etc.
            state.allocation[`P${i}`][resChar] = Math.floor(Math.random() * 5);
            state.maximum[`P${i}`][resChar] = state.allocation[`P${i}`][resChar] + Math.floor(Math.random() * 4) + 1;
            state.need[`P${i}`][resChar] = state.maximum[`P${i}`][resChar] - state.allocation[`P${i}`][resChar];
        }
    }
    
    // Initialize available resources
    for (let j = 0; j < state.numResources; j++) {
        const resChar = String.fromCharCode(65 + j);
        let total = 0;
        for (let i = 0; i < state.numProcesses; i++) {
            total += state.allocation[`P${i}`][resChar];
        }
        state.available[resChar] = Math.floor(Math.random() * 3) + 1;
    }
}

function generateAvailableInputs() {
    elements.availableInputs.innerHTML = '';
    
    const resources = Object.keys(state.available).length > 0 
        ? Object.keys(state.available) 
        : Array.from({length: state.numResources}, (_, i) => String.fromCharCode(65 + i));
    
    for (const resChar of resources) {
        const box = document.createElement('div');
        box.className = 'available-input-box';
        
        const label = document.createElement('label');
        label.textContent = `Resource ${resChar}`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'input-small';
        input.min = '0';
        input.max = '20';
        input.value = state.available[resChar] || 0;
        input.dataset.resource = resChar;
        input.addEventListener('change', (e) => {
            state.available[resChar] = parseInt(e.target.value) || 0;
        });
        input.addEventListener('input', validateMatrixInput);
        
        box.appendChild(label);
        box.appendChild(input);
        elements.availableInputs.appendChild(box);
    }
}

function generateAllocationMatrix() {
    elements.allocationMatrix.innerHTML = '';
    
    const processes = Object.keys(state.allocation);
    const resources = state.numResources > 0 
        ? Array.from({length: state.numResources}, (_, i) => String.fromCharCode(65 + i))
        : [];
    
    for (const processId of processes) {
        const row = document.createElement('div');
        row.className = 'row-input';
        
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = processId;
        row.appendChild(label);
        
        const inputs = document.createElement('div');
        inputs.className = 'row-inputs';
        
        for (const resChar of resources) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'input-small';
            input.min = '0';
            input.max = '20';
            input.value = state.allocation[processId][resChar] || 0;
            input.dataset.process = processId;
            input.dataset.resource = resChar;
            input.addEventListener('change', (e) => {
                state.allocation[processId][resChar] = parseInt(e.target.value) || 0;
                updateNeedMatrix();
            });
            input.addEventListener('input', validateMatrixInput);
            inputs.appendChild(input);
        }
        
        row.appendChild(inputs);
        elements.allocationMatrix.appendChild(row);
    }
}

function generateMaximumMatrix() {
    elements.maximumMatrix.innerHTML = '';
    
    const processes = Object.keys(state.maximum);
    const resources = state.numResources > 0 
        ? Array.from({length: state.numResources}, (_, i) => String.fromCharCode(65 + i))
        : [];
    
    for (const processId of processes) {
        const row = document.createElement('div');
        row.className = 'row-input';
        
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = processId;
        row.appendChild(label);
        
        const inputs = document.createElement('div');
        inputs.className = 'row-inputs';
        
        for (const resChar of resources) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'input-small';
            input.min = '0';
            input.max = '20';
            input.value = state.maximum[processId][resChar] || 0;
            input.dataset.process = processId;
            input.dataset.resource = resChar;
            input.addEventListener('change', (e) => {
                state.maximum[processId][resChar] = parseInt(e.target.value) || 0;
                updateNeedMatrix();
            });
            input.addEventListener('input', validateMatrixInput);
            inputs.appendChild(input);
        }
        
        row.appendChild(inputs);
        elements.maximumMatrix.appendChild(row);
    }
}

function generateNeedMatrix() {
    updateNeedMatrix();
}

function updateNeedMatrix() {
    elements.needMatrix.innerHTML = '';
    
    const processes = Object.keys(state.need).length > 0 
        ? Object.keys(state.need)
        : Array.from({length: state.numProcesses}, (_, i) => `P${i}`);
    
    const resources = state.numResources > 0 
        ? Array.from({length: state.numResources}, (_, i) => String.fromCharCode(65 + i))
        : [];
    
    for (const processId of processes) {
        const row = document.createElement('div');
        row.className = 'row-input';
        
        const label = document.createElement('div');
        label.className = 'row-label';
        label.textContent = processId;
        row.appendChild(label);
        
        const inputs = document.createElement('div');
        inputs.className = 'row-inputs';
        
        for (const resChar of resources) {
            // Calculate need
            const max = (state.maximum[processId] && state.maximum[processId][resChar]) || 0;
            const alloc = (state.allocation[processId] && state.allocation[processId][resChar]) || 0;
            const need = Math.max(0, max - alloc);
            
            if (!state.need[processId]) {
                state.need[processId] = {};
            }
            state.need[processId][resChar] = need;
            
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'input-small read-only';
            input.value = need;
            input.readOnly = true;
            input.disabled = true;
            inputs.appendChild(input);
        }
        
        row.appendChild(inputs);
        elements.needMatrix.appendChild(row);
    }
}

// ========================================
// BANKER'S ALGORITHM
// ========================================

function handleCalculate() {
    state.isCalculating = true;
    elements.loadingSpinner.style.display = 'flex';
    document.querySelector('.loading-spinner p').textContent = 'Calculating safe sequence...';
    
    if (state.backendAvailable) {
        // Use backend API
        calculateWithBackend();
    } else {
        // Use local algorithm
        calculateLocally();
    }
}

/**
 * Calculate safety algorithm using backend API
 */
async function calculateWithBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/calculate-safety`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                allocation: state.allocation,
                need: state.need,
                available: state.available
            })
        });

        if (!response.ok) {
            throw new Error('Backend error');
        }

        const data = await response.json();
        if (data.success) {
            const result = data.data;
            state.isSafe = result.isSafe;
            state.safeSequence = result.safeSequence;
            state.executionLog = result.executionLog;
            console.log('✅ Safety algorithm calculated by backend');
        }

        displayResults();
        setTimeout(() => {
            elements.loadingSpinner.style.display = 'none';
            state.isCalculating = false;
            
            elements.executionCard.style.display = 'block';
            elements.resultCard.style.display = 'block';
            
            setTimeout(() => {
                elements.resultCard.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }, 500);
    } catch (error) {
        console.error('Backend error, falling back to local calculation:', error);
        calculateLocally();
    }
}

/**
 * Calculate safety algorithm using local JavaScript
 */
function calculateLocally() {
    setTimeout(() => {
        runSafetyAlgorithm();
        displayResults();
        elements.loadingSpinner.style.display = 'none';
        state.isCalculating = false;
        
        elements.executionCard.style.display = 'block';
        elements.resultCard.style.display = 'block';
        
        setTimeout(() => {
            elements.resultCard.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }, 1000);
}

/**
 * Safety Algorithm Implementation
 * 
 * Determines if the system is in a safe state where all processes can complete
 * without entering a deadlock situation.
 */
function runSafetyAlgorithm() {
    // Initialize work and finish maps
    const work = { ...state.available };
    const finish = {};
    const safeSequence = [];
    state.executionLog = [];
    
    const processes = Object.keys(state.allocation);
    processes.forEach(pid => {
        finish[pid] = false;
    });
    
    // Log initial state
    logExecution(`Starting Safety Algorithm...`);
    logExecution(`Work (Available): ${JSON.stringify(work)}`);
    logExecution('');
    
    // Find safe sequence
    for (let count = 0; count < processes.length; count++) {
        let found = false;
        
        for (const processId of processes) {
            // Check if process can complete
            if (!finish[processId] && canComplete(processId, work)) {
                logExecution(`→ Process ${processId} can complete (Need ≤ Work)`);
                
                // Simulate process completion
                for (const res in state.allocation[processId]) {
                    work[res] = (work[res] || 0) + state.allocation[processId][res];
                }
                
                finish[processId] = true;
                safeSequence.push(processId);
                logExecution(`  Releasing resources: Work = ${JSON.stringify(work)}`);
                logExecution('');
                found = true;
                break;
            }
        }
        
        if (!found) {
            logExecution(`❌ No process can complete. System is UNSAFE!`);
            state.isSafe = false;
            state.safeSequence = [];
            return;
        }
    }
    
    logExecution(`✅ All processes can complete. System is SAFE!`);
    logExecution(`Safe Sequence: ${safeSequence.join(' → ')}`);
    
    state.isSafe = true;
    state.safeSequence = safeSequence;
    state.currentStep = 0;
}

/**
 * Check if a process can complete with given work resources
 */
function canComplete(processId, work) {
    const need = state.need[processId] || {};
    for (const res in need) {
        if ((need[res] || 0) > (work[res] || 0)) {
            return false;
        }
    }
    return true;
}

function logExecution(message) {
    state.executionLog.push(message);
}

// ========================================
// DISPLAY RESULTS
// ========================================

function displayResults() {
    // System State Badge
    const badge = document.createElement('div');
    badge.className = `state-badge ${state.isSafe ? 'safe' : 'unsafe'}`;
    badge.textContent = state.isSafe ? '✅ SAFE' : '❌ UNSAFE';
    elements.systemState.innerHTML = '';
    elements.systemState.appendChild(badge);
    
    // Safe Sequence
    elements.safeSequence.innerHTML = '';
    if (state.isSafe && state.safeSequence.length > 0) {
        state.safeSequence.forEach((processId, index) => {
            const step = document.createElement('div');
            step.className = 'process-step';
            step.textContent = processId;
            elements.safeSequence.appendChild(step);
            
            if (index < state.safeSequence.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'sequence-arrow';
                arrow.textContent = '→';
                elements.safeSequence.appendChild(arrow);
            }
        });
    } else {
        elements.safeSequence.innerHTML = '<p style="color: #94a3b8;">No safe sequence exists</p>';
    }
    
    // Explanation
    const explanation = state.isSafe
        ? `The system is in a SAFE state. A safe sequence of processes was found: ${
            state.safeSequence.join(' → ')
        }. Each process can complete and release its resources without causing a deadlock.`
        : `The system is in an UNSAFE state. No sequence of processes exists where all can complete without deadlock. Resource allocation must be adjusted.`;
    
    elements.explanation.textContent = explanation;
    
    // Result Alert
    elements.resultAlert.className = `result-alert ${state.isSafe ? 'safe' : 'unsafe'}`;
    elements.resultAlert.innerHTML = `
        <div class="alert-title">
            ${state.isSafe ? '✅System is SAFE' : '❌ System is UNSAFE'}
        </div>
        <p>${explanation}</p>
    `;
    
    // Show execution visualization
    displayExecutionVisualization();
    displayResourceFlow();
}

function displayExecutionVisualization() {
    elements.executionVisualization.innerHTML = '';
    
    const processes = Object.keys(state.allocation);
    
    for (const processId of processes) {
        const card = document.createElement('div');
        card.className = 'process-card';
        
        if (state.isSafe && state.safeSequence.includes(processId)) {
            const index = state.safeSequence.indexOf(processId);
            card.classList.add('completed');
            card.style.order = index;
        }
        
        const name = document.createElement('div');
        name.className = 'process-name';
        name.textContent = processId;
        
        const status = document.createElement('div');
        status.className = 'process-status';
        
        if (state.isSafe && state.safeSequence.includes(processId)) {
            status.textContent = `Position ${state.safeSequence.indexOf(processId) + 1}`;
        } else if (!state.isSafe) {
            status.textContent = 'Deadlock Risk';
        } else {
            status.textContent = 'Pending';
        }
        
        card.appendChild(name);
        card.appendChild(status);
        elements.executionVisualization.appendChild(card);
    }
}

function displayResourceFlow() {
    elements.resourceFlow.innerHTML = '';
    
    state.executionLog.forEach((line, index) => {
        const div = document.createElement('div');
        div.className = 'resource-line';
        if (line.includes('→')) div.classList.add('resource-line-current');
        div.textContent = line || ' ';
        elements.resourceFlow.appendChild(div);
    });
}

// ========================================
// EVENT HANDLERS
// ========================================

function handleStepByStepToggle(e) {
    state.stepByStep = e.target.checked;
    if (state.stepByStep) {
        elements.nextStepBtn.style.display = 'inline-flex';
    } else {
        elements.nextStepBtn.style.display = 'none';
    }
}

function handleNextStep() {
    if (state.currentStep < state.safeSequence.length) {
        state.currentStep++;
        // Update visualization dynamically
        updateStepVisualization();
    }
}

function updateStepVisualization() {
    const cards = document.querySelectorAll('.process-card');
    const processes = Object.keys(state.allocation);
    
    cards.forEach((card, index) => {
        const processId = processes[index];
        card.classList.remove('current', 'completed');
        
        if (state.isSafe && state.safeSequence.includes(processId)) {
            if (state.safeSequence.indexOf(processId) < state.currentStep) {
                card.classList.add('completed');
            } else if (state.safeSequence[state.currentStep] === processId) {
                card.classList.add('current');
            }
        }
    });
}

function handleReset() {
    state.safeSequence = [];
    state.isSafe = false;
    state.currentStep = 0;
    state.executionLog = [];
    state.stepByStep = false;
    state.allocation = {};
    state.maximum = {};
    state.available = {};
    state.need = {};
    
    elements.stepByStepToggle.checked = false;
    elements.nextStepBtn.style.display = 'none';
    
    elements.matricesCard.style.display = 'none';
    elements.executionCard.style.display = 'none';
    elements.resultCard.style.display = 'none';
    elements.inputCard.style.display = 'block';
    
    elements.inputCard.scrollIntoView({ behavior: 'smooth' });
}

// ========================================
// THEME MANAGEMENT
// ========================================

function toggleTheme() {
    const isDark = document.body.classList.contains('light-mode');
    
    if (isDark) {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
        updateThemeIcon('🌙');
    } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        updateThemeIcon('☀️');
    }
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    
    if (theme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcon('☀️');
    } else {
        updateThemeIcon('🌙');
    }
}

function updateThemeIcon(icon) {
    document.querySelector('.theme-icon').textContent = icon;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Format matrix data for display
 */
function formatMatrix(matrix) {
    return matrix.map(row => 
        Object.values(row).join(', ')
    ).join('\n');
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
