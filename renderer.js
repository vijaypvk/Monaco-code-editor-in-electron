const monacoLoader = document.createElement('script');
monacoLoader.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js";
document.body.appendChild(monacoLoader);

let editor;
let currentTheme = "vs-dark";

monacoLoader.onload = function () {
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('editor'), {
            value: '// Write your code here...',
            language: 'javascript',
            theme: currentTheme,
            automaticLayout: true  // Enables auto-resizing
        });

        // Button functionalities
        document.getElementById('newFile').addEventListener('click', () => {
            editor.setValue('');
        });

        document.getElementById('toggleTheme').addEventListener('click', () => {
            currentTheme = currentTheme === "vs-dark" ? "vs-light" : "vs-dark";
            editor.updateOptions({ theme: currentTheme });
        });

        document.getElementById('openFile').addEventListener('click', () => {
            alert('File Open feature can be implemented using Electron dialog.');
        });

        document.getElementById('saveFile').addEventListener('click', () => {
            alert('File Save feature can be implemented using Electron fs module.');
        });

        // Resize editor when window resizes
        window.addEventListener('resize', () => {
            editor.layout();
        });
    });
};
