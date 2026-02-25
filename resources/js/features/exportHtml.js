(function () {
    const app = window.LiteMark || (window.LiteMark = {});
    const dom = app.dom || {};
    const preview = dom.preview;
    const fileLabel = dom.fileLabel;
    const exportButton = dom.exportHtmlButton;

    if (!preview || !exportButton) {
        return;
    }

    function stripExtension(fileName) {
        if (typeof fileName !== "string" || fileName.trim().length === 0) {
            return "litemark-export";
        }

        const lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex <= 0) {
            return fileName;
        }

        return fileName.slice(0, lastDotIndex);
    }

    function sanitizeFileName(fileName) {
        return fileName
            .trim()
            .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "")
            .toLowerCase() || "litemark-export";
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function buildDocument(title, contentHtml) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
</head>
<body>
${contentHtml}
</body>
</html>
`;
    }

    async function exportPreviewHtml() {
        const api = window.Neutralino;
        if (!api || !api.os || !api.filesystem) {
            if (fileLabel) {
                fileLabel.textContent = "Export unavailable outside Neutralino";
            }
            return;
        }

        exportButton.disabled = true;

        try {
            const baseName = sanitizeFileName(stripExtension(app.state && app.state.fileName ? app.state.fileName : ""));
            const outputName = `${baseName}.html`;
            const downloadsPath = await api.os.getPath("downloads");
            const outputPath = await api.filesystem.getJoinedPath(downloadsPath, outputName);
            const documentHtml = buildDocument(baseName, preview.innerHTML);

            await api.filesystem.writeFile(outputPath, documentHtml);

            if (fileLabel) {
                fileLabel.textContent = `Saved to Downloads: ${outputName}`;
            }
        }
        catch (error) {
            if (fileLabel) {
                fileLabel.textContent = "Failed to export HTML";
            }
            console.error("Failed to export HTML", error);
        }
        finally {
            exportButton.disabled = false;
        }
    }

    exportButton.addEventListener("click", exportPreviewHtml);
    app.actions.exportPreviewHtml = exportPreviewHtml;
})();
