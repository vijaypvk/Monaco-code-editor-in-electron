
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
            automaticLayout: true
        });

        // Listen for New File event
        window.electronAPI.onNewFile(() => editor.setValue(''));

        // Listen for Open File event
        window.electronAPI.onOpenFile((_, content) => editor.setValue(content));

        // Save File event
        window.electronAPI.onSaveFile(async (_, filePath) => {
            const content = editor.getValue();
            window.electronAPI.saveFileContent(filePath, content);
        });
    });
};
