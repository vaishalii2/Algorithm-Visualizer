const svg = document.getElementById('graph-svg');
let graph = {};
let queue = [];
let intervalID = null;

document.getElementById('create-graph-button').addEventListener('click', createGraph);

function createGraph() {
    const nodeCount = parseInt(document.getElementById('node-count').value);

    if (nodeCount < 1 || nodeCount > 7) {
        alert('Please enter a number between 1 and 7.');
        return;
    }

    const nodeValuesContainer = document.getElementById('node-values-container');
    nodeValuesContainer.innerHTML = '';

    for (let i = 1; i <= nodeCount; i++) {
        const nodeLabel = document.createElement('label');
        nodeLabel.textContent = `Node ${i} value: `;
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = `Node ${i} value`;
        inputField.id = `node-value-${i}`;

        const connectionsLabel = document.createElement('label');
        connectionsLabel.textContent = `Node ${i} connects to: `;
        const connectionsInput = document.createElement('input');
        connectionsInput.type = 'text';
        connectionsInput.placeholder = 'Comma-separated node numbers';
        connectionsInput.id = `node-connections-${i}`;

        nodeValuesContainer.appendChild(nodeLabel);
        nodeValuesContainer.appendChild(inputField);
        nodeValuesContainer.appendChild(document.createElement('br'));
        nodeValuesContainer.appendChild(connectionsLabel);
        nodeValuesContainer.appendChild(connectionsInput);
        nodeValuesContainer.appendChild(document.createElement('br'));
    }

    document.getElementById('node-values-input').style.display = 'block';
    document.getElementById('submit-values-button').addEventListener('click', () => submitValues(nodeCount));
}

function submitValues(nodeCount) {
    graph = {};
    for (let i = 1; i <= nodeCount; i++) {
        const nodeValue = document.getElementById(`node-value-${i}`).value;
        const nodeConnections = document.getElementById(`node-connections-${i}`).value.split(',').map(Number);
        if (!nodeValue) {
            alert(`Please enter a value for Node ${i}`);
            return;
        }
        graph[i] = { value: nodeValue, neighbors: nodeConnections };
    }

    drawGraph(nodeCount);
    document.getElementById('start-button').style.display = 'inline-block';
}

function drawGraph(nodeCount) {
    svg.innerHTML = '';  // Clear previous graph

    const positions = {
        1: { x: 300, y: 50 },     // Root
        2: { x: 150, y: 150 },    // Left child of 1
        3: { x: 450, y: 150 },    // Right child of 1
        4: { x: 100, y: 250 },    // Left child of 2
        5: { x: 200, y: 250 },    // Right child of 2
        6: { x: 400, y: 250 },    // Left child of 3
        7: { x: 500, y: 250 }     // Right child of 3
    };

    // Draw edges
    Object.keys(graph).forEach(node => {
        graph[node].neighbors.forEach(neighbor => {
            if (neighbor && positions[neighbor]) {
                drawEdge(positions[node], positions[neighbor]);
            }
        });
    });

    // Draw nodes
    for (let i = 1; i <= nodeCount; i++) {
        drawNode(i, positions[i].x, positions[i].y, graph[i].value);
    }
}

function drawNode(id, x, y, value) {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 20);
    circle.setAttribute('class', 'node');
    circle.setAttribute('id', `node-${id}`);
    svg.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.textContent = value;
    svg.appendChild(text);
}

function drawEdge(from, to) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.setAttribute('class', 'edge');
    svg.appendChild(line);
}

function startBFS() {
    const visited = {};
    let currentNode = 1;

    queue.push(currentNode);
    visited[currentNode] = true;
    updateQueueDisplay();

    intervalID = setInterval(() => {
        if (queue.length === 0) {
            clearInterval(intervalID);
            return;
        }

        const node = queue.shift();
        highlightNode(node, 'current');
        crossOutQueueItem(node);

        setTimeout(() => {
            highlightNode(node, 'visited');
        }, 500);

        graph[node].neighbors.forEach(neighbor => {
            if (!visited[neighbor] && graph[neighbor]) {
                visited[neighbor] = true;
                queue.push(neighbor);
                updateQueueDisplay();
            }
        });

    }, 1000);
}

function resetGraph() {
    clearInterval(intervalID);
    queue = [];
    document.getElementById('queue-display').innerHTML = '';
    document.getElementById('traversed-display').innerHTML = '';
    svg.innerHTML = '';
    document.getElementById('node-values-input').style.display = 'none';
    document.getElementById('start-button').style.display = 'none';
}

function highlightNode(node, state) {
    const circle = document.getElementById(`node-${node}`);
    if (circle) {
        circle.classList.remove('current', 'visited');
        circle.classList.add(state);
    }
}

function updateQueueDisplay() {
    const queueDisplay = document.getElementById('queue-display');
    queueDisplay.innerHTML = '';
    queue.forEach(node => {
        const queueItem = document.createElement('div');
        queueItem.classList.add('queue-item');
        queueItem.setAttribute('id', `queue-item-${node}`);
        queueItem.textContent = graph[node].value;
        queueDisplay.appendChild(queueItem);
    });
}

function crossOutQueueItem(node) {
    const queueItem = document.getElementById(`queue-item-${node}`);
    if (queueItem) {
        queueItem.classList.add('crossed-out');
        setTimeout(() => {
            queueItem.classList.add('fade-out');
        }, 500);

        setTimeout(() => {
            moveToTraversedDisplay(node);
        }, 1000);
    }
}

function moveToTraversedDisplay(node) {
    const traversedDisplay = document.getElementById('traversed-display');
    const traversedItem = document.createElement('div');
    traversedItem.classList.add('traversed-item');
    traversedItem.textContent = graph[node].value;
    traversedDisplay.appendChild(traversedItem);
}

document.getElementById('start-button').addEventListener('click', startBFS);
document.getElementById('reset-button').addEventListener('click', resetGraph);
