
require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" } });

document.addEventListener("DOMContentLoaded", () => {
    loadNotebookFromLocal();
});

// Function to add a new code cell
function addCodeCell() {
    addCell("code", "# Write Python code here...");
}

// Function to add a new markdown cell
function addMarkdownCell() {
    addCell("markdown", "## Markdown Text");
}

// Function to add a new cell dynamically
function addCell(type, content) {
    const notebook = document.getElementById("notebook");
    const cellId = `cell-${Date.now()}`;

    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.type = type;
    cell.dataset.cellId = cellId;
    cell.innerHTML = `
        <div id="${cellId}" class="editor"></div>
        ${type === "code" ? `<button onclick="runCode('${cellId}')">▶️ Run</button>` : ""}
        <button class="delete-button" onclick="deleteCell('${cellId}')">❌ Delete</button>
        <div class="output" id="output-${cellId}"></div>
    `;

    notebook.appendChild(cell);

    require(["vs/editor/editor.main"], function () {
        const editor = monaco.editor.create(document.getElementById(cellId), {
            value: content,
            language: type === "code" ? "python" : "markdown",
            theme: "vs-dark",
            automaticLayout: true
        });

        editor.onDidChangeModelContent(() => saveNotebookLocally());

        if (type === "markdown") {
            editor.onDidChangeModelContent(() => renderMarkdown(cellId, editor));
            renderMarkdown(cellId, editor);
        }

        // Store editor instance in the cell dataset
        cell.dataset.uri = editor.getModel().uri.toString();
    });
}

// Function to render Markdown
function renderMarkdown(cellId, editor) {
    document.getElementById(`output-${cellId}`).innerHTML = marked.parse(editor.getValue());
}

// Function to delete a cell
function deleteCell(cellId) {
    const cellElement = document.querySelector(`.cell[data-cell-id="${cellId}"]`);
    if (cellElement) {
        cellElement.remove();
        saveNotebookLocally();
    }
}

// Function to execute Python code in a specific cell
async function runCode(cellId) {
    const cellElement = document.querySelector(`.cell[data-cell-id="${cellId}"]`);
    const editor = monaco.editor.getModels().find(model => model.uri.toString() === cellElement.dataset.uri);

    if (editor) {
        const code = editor.getValue();
        const outputElement = document.getElementById(`output-${cellId}`);

        outputElement.innerHTML = "<pre>⏳ Running...</pre>";
        try {
            const output = await window.electronAPI.runPython(code);
            outputElement.innerHTML = `<pre>${output}</pre>`;
        } catch (error) {
            outputElement.innerHTML = `<pre style="color: red;">❌ Error: ${error.message}</pre>`;
        }
    }
}

// Function to run all code cells sequentially
async function runAllCells() {
    for (let cell of document.querySelectorAll(".cell[data-type='code']")) {
        const cellId = cell.dataset.cellId;
        await runCode(cellId);
    }
}

// Function to save the notebook locally (auto-save)
function saveNotebookLocally() {
    const cells = Array.from(document.querySelectorAll('.cell')).map(cell => {
        const editor = monaco.editor.getModels().find(model => model.uri.toString() === cell.dataset.uri);
        if (editor) {
            return {
                type: cell.dataset.type,
                content: editor.getValue()
            };
        }
        return null;
    }).filter(cell => cell !== null);

    localStorage.setItem("notebookData", JSON.stringify(cells));
}

// Function to manually save the notebook to a file
async function saveNotebook() {
    saveNotebookLocally(); // Update local storage first
    await window.electronAPI.saveNotebook(JSON.parse(localStorage.getItem("notebookData")));
}

// Function to load a notebook from a file
async function loadNotebook() {
    const data = await window.electronAPI.loadNotebook();
    if (!data) return;

    document.getElementById("notebook").innerHTML = "";
    data.forEach(cell => addCell(cell.type, cell.content));
}

// Function to load the notebook from local storage
function loadNotebookFromLocal() {
    const savedData = localStorage.getItem("notebookData");
    if (!savedData) return;

    document.getElementById("notebook").innerHTML = "";
    JSON.parse(savedData).forEach(cell => addCell(cell.type, cell.content));
}

// Function to toggle between dark and light mode
function toggleTheme() {
    const newTheme = document.body.style.background === "white" ? "vs-dark" : "vs-light";
    document.body.style.background = newTheme === "vs-dark" ? "#1e1e1e" : "white";
    monaco.editor.getModels().forEach(ed => ed.updateOptions({ theme: newTheme }));
}
