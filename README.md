# Bankers Algorithm Simulator

A beautiful, production-ready interactive simulation of the Bankers Algorithm for deadlock avoidance in operating systems.

## Features

### Safety Algorithm
- **Determines System Safety**: Checks if the current state is safe (deadlock-free)
- **Safe Sequence Generation**: Produces an ordered sequence of processes that can complete without deadlock
- **Detailed Analysis**: Provides step-by-step explanation of the algorithm's decision

### Resource Request Algorithm  
- **Dynamic Request Handling**: Processes resource requests from any process
- **Pre-Grant Simulation**: Simulates the allocation before committing to it
- **Safety Verification**: Uses the safety algorithm to verify the simulated state
- **Smart Decision Making**: Grants requests only if the system remains safe; denies otherwise

### System State Visualization
- **Available Resources**: Real-time display of currently available resources
- **Allocated Resources**: Shows what each process currently holds
- **Maximum Demand**: Displays the maximum resources each process may need
- **Need Calculation**: Shows remaining needs (Maximum - Allocated)

### Multiple Examples
- **Default Safe State**: A well-balanced resource distribution
- **Abundant Resources**: System with plenty of available resources
- **Potential Deadlock**: A critical state vulnerable to deadlock

## Getting Started

### Prerequisites
- Node.js 16+ installed

### Installation

```bash
npm install
```

### Running the Simulator

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## How to Use the Simulator

1. **Select an Example**: Choose from three predefined system configurations
2. **View System State**: Examine the available resources, allocations, and needs
3. **Run Safety Check**: Click "Run Safety Algorithm" to verify if the system is in a safe state
4. **Make Requests**: Select a process and request resources
5. **Observe Decisions**: See if the request is granted (safe) or denied (would cause deadlock)
6. **Review History**: Check the request history to see all decisions made

## Algorithm Explanation

### Safety Algorithm

The safety algorithm determines if a system state is safe:

1. Initialize `Work = Available` and `Finish[i] = false` for all processes
2. Find a process `i` where `Finish[i] = false` AND `Need[i] ≤ Work`
3. If found:
   - Simulate process completion: `Work += Allocated[i]`
   - Mark: `Finish[i] = true`
   - Add process to safe sequence
4. Repeat steps 2-3 until all processes are finished (SAFE) or no such process exists (UNSAFE)

**Safe State**: All processes can complete without deadlock
**Unsafe State**: No safe sequence exists; potential for deadlock

### Resource Request Algorithm

When a process requests resources:

1. **Validation Check**:
   - Verify `Request[i] ≤ Need[i]` (request doesn't exceed need)
   - Verify `Request[i] ≤ Available` (resources exist)

2. **Simulation**:
   - `Available -= Request[i]`
   - `Allocated[i] += Request[i]`
   - `Need[i] -= Request[i]`

3. **Safety Check**:
   - Run safety algorithm on simulated state

4. **Decision**:
   - If SAFE → **Grant** the request and update system state
   - If UNSAFE → **Deny** the request to prevent potential deadlock

## Key Concepts

- **Process**: A task or program requiring system resources
- **Resource**: A system entity (CPU cores, memory blocks, file handles, etc.)
- **Allocation**: Resources currently held by a process
- **Need**: Remaining resources a process might still require
- **Maximum**: Total resources a process has declared it might need
- **Available**: Resources currently not allocated to any process
- **Safe State**: A state where no deadlock can occur
- **Unsafe State**: A state where deadlock might occur
- **Deadlock**: A situation where two or more processes cannot proceed

## Project Structure

```
src/
├── algorithms/
│   └── BankersAlgorithm.ts    # Core algorithm implementation
├── components/
│   ├── App.tsx                # Main application component
│   ├── SimulationPanel.tsx    # Simulation interface
│   ├── SystemStateDisplay.tsx # System state visualization
│   ├── SafetyAlgorithmPanel.tsx # Safety results display
│   └── ResourceRequestPanel.tsx # Request interface
├── data/
│   └── systemExamples.ts      # Example configurations
├── types.ts                   # TypeScript type definitions
├── main.tsx                   # Entry point
└── index.css                  # Styling
```

## Technologies Used

- **React 18**: UI framework for building interactive components
- **TypeScript**: Type-safe JavaScript for robust code
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Beautiful icon library

## Features Highlights

✨ **Production-Ready UI**: Beautiful, professional dark-themed interface
🎯 **Interactive Simulation**: Real-time algorithm execution and visualization
📊 **Data Visualization**: Clear tables and status displays
🔄 **Request History**: Track all resource requests and decisions
💡 **Educational**: Detailed algorithm explanations and step-by-step logic
🎨 **Responsive Design**: Works on desktop and tablet devices

## Understanding the Output

### When Safety Check is Run
- **SAFE**: Shows the safe sequence in which processes should execute
- **UNSAFE**: Indicates which processes could not complete and explains why

### When a Request is Made
- **GRANTED**: Request approved; system remains safe
- **DENIED**: Request rejected; would cause potential deadlock

## Example Scenarios

### Scenario 1: Safe State
All processes can be executed in a safe sequence without causing deadlock.

### Scenario 2: Request Granted
A process requests resources and the algorithm grants it because the system remains in a safe state.

### Scenario 3: Request Denied
A process requests resources but the algorithm denies it because granting would lead to an unsafe state.

## Learning Outcomes

By using this simulator, you'll understand:
- How the Bankers Algorithm works in practice
- Why deadlock avoidance is important in operating systems
- How to determine system safety
- How resource requests are evaluated
- The relationship between available resources and process completion

## License

MIT License - Feel free to use and modify for educational purposes

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve the simulator.

## Support

For questions or issues, please refer to the algorithm comments in the code or standard operating systems textbooks on the Bankers Algorithm.

---

**Created as an educational tool for understanding the Bankers Algorithm and deadlock avoidance in operating systems.**
