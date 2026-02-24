(function () {
    const app = window.LiteMark || (window.LiteMark = {});
    const dom = app.dom || {};
    const editor = dom.editor;
    const preview = dom.preview;
    const dropZone = dom.dropZone;
    const fileLabel = dom.fileLabel;

    if (!editor || !preview || !dropZone || !fileLabel || typeof app.actions.setDocument !== "function") {
        return;
    }

    let dragDepth = 0;

    window.addEventListener("dragenter", (event) => {
        event.preventDefault();
        dragDepth += 1;
        dropZone.classList.add("active");
    });

    window.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    window.addEventListener("dragleave", (event) => {
        event.preventDefault();
        dragDepth = Math.max(0, dragDepth - 1);
        if (dragDepth === 0) {
            dropZone.classList.remove("active");
        }
    });

    window.addEventListener("drop", async (event) => {
        event.preventDefault();
        dragDepth = 0;
        dropZone.classList.remove("active");

        const droppedFile = event.dataTransfer && event.dataTransfer.files ? event.dataTransfer.files[0] : null;
        if (!droppedFile) {
            return;
        }

        const fileName = droppedFile.name || "Untitled";
        if (!app.config.acceptedFilePattern.test(fileName)) {
            fileLabel.textContent = "Unsupported file type";
            return;
        }

        const text = await droppedFile.text();
        app.actions.setDocument(text, fileName);
    });
})();
