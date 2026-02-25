(function () {
    if (
        window.Neutralino &&
        typeof window.Neutralino.init === "function" &&
        typeof window.NL_PORT === "number" &&
        typeof window.NL_TOKEN === "string"
    ) {
        window.Neutralino.init();
    }

    const app = window.LiteMark || (window.LiteMark = {});

    app.dom = {
        editor: document.getElementById("editor"),
        preview: document.getElementById("markdownPreview"),
        dropZone: document.getElementById("dropZone"),
        fileLabel: document.getElementById("fileLabel"),
        exportHtmlButton: document.getElementById("exportHtmlButton")
    };

    app.state = app.state || {
        fileName: null
    };

    app.config = app.config || {
        acceptedFilePattern: /\.(md|markdown|txt)$/i,
        initialMarkdown: "# LiteMark\n\nWrite markdown on the left.\n\n- Drag and drop a `.md` file to load it.\n- Preview updates live on the right."
    };

    app.services = app.services || {};
    app.actions = app.actions || {};
})();
