(function () {
    const app = window.LiteMark || (window.LiteMark = {});
    const dom = app.dom || {};
    const editor = dom.editor;
    const preview = dom.preview;
    const fileLabel = dom.fileLabel;
    const markdownToHtml = app.services && app.services.markdownToHtml;

    if (!editor || !preview || typeof markdownToHtml !== "function") {
        return;
    }

    function render(markdown) {
        preview.innerHTML = markdownToHtml(markdown);
    }

    function setDocument(markdown, fileName) {
        editor.value = markdown;
        render(markdown);

        if (typeof fileName === "string" && fileName.length > 0) {
            app.state.fileName = fileName;
            if (fileLabel) {
                fileLabel.textContent = fileName;
            }
        }
        else if (fileLabel && !app.state.fileName) {
            fileLabel.textContent = "No file loaded";
        }

        if (typeof app.actions.syncScroll === "function") {
            app.actions.syncScroll(editor, preview, "preview");
        }
    }

    app.actions.render = render;
    app.actions.setDocument = setDocument;

    editor.addEventListener("input", () => {
        render(editor.value);
        if (typeof app.actions.syncScroll === "function") {
            app.actions.syncScroll(editor, preview, "preview");
        }
    });

    setDocument(app.config.initialMarkdown);
})();
