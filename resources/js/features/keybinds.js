(function () {
    const app = window.LiteMark || (window.LiteMark = {});
    const dom = app.dom || {};
    const editor = dom.editor;

    if (!editor) {
        return;
    }

    function refreshPreview() {
        if (typeof app.actions.render === "function") {
            app.actions.render(editor.value);
        }

        if (typeof app.actions.syncScroll === "function" && app.dom && app.dom.preview) {
            app.actions.syncScroll(editor, app.dom.preview, "preview");
        }
    }

    function replaceSelection(before, after, fallbackText) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = editor.value.slice(start, end);
        const content = selected.length > 0 ? selected : fallbackText;
        const replacement = `${before}${content}${after}`;

        editor.setRangeText(replacement, start, end, "select");

        const selectStart = start + before.length;
        const selectEnd = selectStart + content.length;
        editor.setSelectionRange(selectStart, selectEnd);
        editor.focus();
        refreshPreview();
    }

    function indentSelection(outdent) {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const hasSelection = end > start;

        if (!hasSelection) {
            if (outdent) {
                const beforeTwo = editor.value.slice(Math.max(0, start - 2), start);
                const beforeOne = editor.value.slice(Math.max(0, start - 1), start);

                if (beforeTwo === "  ") {
                    editor.setRangeText("", start - 2, start, "end");
                }
                else if (beforeOne === "\t") {
                    editor.setRangeText("", start - 1, start, "end");
                }
            }
            else {
                editor.setRangeText("  ", start, end, "end");
            }

            editor.focus();
            refreshPreview();
            return;
        }

        const lineStart = editor.value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
        const selectedText = editor.value.slice(lineStart, end);
        const lines = selectedText.split("\n");

        const updatedLines = lines.map((line) => {
            if (outdent) {
                if (line.startsWith("  ")) {
                    return line.slice(2);
                }
                if (line.startsWith("\t")) {
                    return line.slice(1);
                }
                return line;
            }
            return `  ${line}`;
        });

        const replacement = updatedLines.join("\n");
        editor.setRangeText(replacement, lineStart, end, "select");
        editor.focus();
        refreshPreview();
    }

    function insertTable() {
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selected = editor.value.slice(start, end).trim();
        const firstCell = selected.length > 0 ? selected : "Cell 1";
        const table = `| Column 1 | Column 2 |\n| --- | --- |\n| ${firstCell} | Cell 2 |`;

        editor.setRangeText(table, start, end, "end");

        const firstCellIndex = table.indexOf(firstCell);
        const selectStart = start + firstCellIndex;
        const selectEnd = selectStart + firstCell.length;
        editor.setSelectionRange(selectStart, selectEnd);
        editor.focus();
        refreshPreview();
    }

    editor.addEventListener("keydown", (event) => {
        const isMod = event.ctrlKey || event.metaKey;
        if (isMod) {
            const key = event.key.toLowerCase();

            if (key === "s" || key === "e") {
                event.preventDefault();
                if (typeof app.actions.exportPreviewHtml === "function") {
                    app.actions.exportPreviewHtml();
                }
                return;
            }

            // bold
            if (key === "b") {
                event.preventDefault();
                replaceSelection("**", "**", "bold text");
                return;
            }

            // italic
            if (key === "i") {
                event.preventDefault();
                replaceSelection("*", "*", "italic text");
                return;
            }

            // link
            if (key === "k") {
                event.preventDefault();
                replaceSelection("[", "](https://example.com)", "link text");
            }

            // table
            if (key === "t") {
                event.preventDefault();
                insertTable();
                return;
            }

            // headers
            if (key === "1") { // 1
                event.preventDefault();
                replaceSelection("# ", "", "header 1 text");
            } if (key === "2") { // 2
                event.preventDefault();
                replaceSelection("## ", "", "header 2 text");
            } if (key === "3") { // 3
                event.preventDefault();
                replaceSelection("### ", "", "header 3 text");
            }

            return;
        }

        if (event.key === "Tab") {
            event.preventDefault();
            indentSelection(event.shiftKey);
        }
    });
})();
