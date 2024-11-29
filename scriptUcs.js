const svg = document.getElementById('graph-svg');
let graph = {};
let priorityQueue = [];
let visited = new Set();
let nodePositions = {};

document.getElementById('create-graph-button').addEventListener('click', setupGraphInput);

function setupGraphInput() {
    const nodeCount = parseInt(document.getElementById('node-count').value);
    if (isNaN(nodeCount) || nodeCount < 2 || nodeCount > 10) {
        alert('Please enter a valid number between 2 and 10.');
        return;
    }

    graph = {};
    const container = document.getElementById('node-connections-container');
    container.innerHTML = '';
    document.getElementById('node-inputs').style.display = 'block';

    for (let i = 1; i <= nodeCount; i++) {
        const label = document.createElement('label');
        label.textContent = `Node ${i} connects to (format: node:weight, e.g., 2:5,3:10): `;
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `connections-${i}`;
        container.appendChild(label);
        container.appendChild(input);
        container.appendChild(document.createElement('br'));
    }

    document.getElementById('submit-graph-button').addEventListener('click', () => submitGraph(nodeCount));
}

function submitGraph(nodeCount) {
    for (let i = 1; i <= nodeCount; i++) {
        const connections = document.getElementById(`connections-${i}`).value.split(',').filter(c => c);
        const neighbors = connections.map(c => {
            const [neighbor, weight] = c.split(':').map(Number);
            if (isNaN(neighbor) || isNaN(weight)) {
                alert(`Invalid connection for Node ${i}.`);
                throw new Error('Invalid input.');
            }
            return { neighbor, weight };
        });
        graph[i] = neighbors;
    }

    drawGraph(nodeCount);
    document.getElementById('start-ucs-button').style.display = 'block';
}

function drawGraph(nodeCount) {
    svg.innerHTML = '';
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrow.setAttribute('points', '0 0, 10 3.5, 0 7');
    arrow.setAttribute('fill', '#666');
    marker.appendChild(arrow);
    defs.appendChild(marker);
    svg.appendChild(defs);

    nodePositions = calculateNodePositions(nodeCount);

    Object.keys(nodePositions).forEach(node => {
        const { x, y } = nodePositions[node];
        drawNode(node, x, y);
    });

    Object.keys(graph).forEach(node => {
        const start = nodePositions[node];
        graph[node].forEach(({ neighbor, weight }) => {
            const end = nodePositions[neighbor];
            drawEdge(start, end, weight);
        });
    });
}

function calculateNodePositions(nodeCount) {
    const radius = 200;
    const centerX = 400, centerY = 250;
    const positions = {};

    for (let i = 1; i <= nodeCount; i++) {
        const angle = (2 * Math.PI * (i - 1)) / nodeCount;
        positions[i] = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
        };
    }

    return positions;
}

function drawNode(node, x, y) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 20);
    circle.setAttribute('class', 'node');
    svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'node-text');
    text.textContent = node;
    svg.appendChild(text);
}

function drawEdge(start, end, weight) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', start.x);
    line.setAttribute('y1', start.y);
    line.setAttribute('x2', end.x);
    line.setAttribute('y2', end.y);
    line.setAttribute('class', 'edge');
    svg.appendChild(line);

    const weightText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    weightText.setAttribute('x', (start.x + end.x) / 2);
    weightText.setAttribute('y', (start.y + end.y) / 2 - 5);
    weightText.setAttribute('class', 'edge-weight');
    weightText.textContent = weight;
    svg.appendChild(weightText);
}
document.getElementById('start-ucs-button').addEventListener('click', startUCS);

function startUCS() {
    const startNode = prompt('Enter the start node:');
    if (!graph[startNode]) {
        alert('Invalid start node.');
        return;
    }

    priorityQueue = [{ node: startNode, cost: 0 }];
    visited = new Set();
    processUCS();
}

function processUCS() {
    if (priorityQueue.length === 0) {
        alert('UCS Completed.');
        return;
    }

    priorityQueue.sort((a, b) => a.cost - b.cost);
    const { node, cost } = priorityQueue.shift();

    if (visited.has(node)) {
        processUCS();
        return;
    }

    visited.add(node);
    updateDisplay();

    const currentNode = nodePositions[node];
    const circle = [...svg.querySelectorAll('circle')].find(c => c.nextSibling.textContent == node);
    circle.setAttribute('class', 'node visited');

    graph[node].forEach(({ neighbor, weight }) => {
        if (!visited.has(neighbor)) {
            priorityQueue.push({ node: neighbor, cost: cost + weight });
        }
    });

    setTimeout(processUCS, 1000);
}

function updateDisplay() {
    document.getElementById('priority-queue').textContent = priorityQueue
        .map(({ node, cost }) => `Node ${node} (Cost: ${cost})`)
        .join(', ');

    document.getElementById('visited-nodes').textContent = Array.from(visited).join(', ');
}

document.getElementById('reset-button').addEventListener('click', () => location.reload());