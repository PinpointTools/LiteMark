(function () {
    const app = window.LiteMark || (window.LiteMark = {});
    const dom = app.dom || {};
    const editor = dom.editor;
    const preview = dom.preview;

    if (!editor || !preview) {
        return;
    }

    let suppressEditorScroll = false;
    let suppressPreviewScroll = false;

    function syncScroll(source, target, targetSide) {
        const sourceMax = source.scrollHeight - source.clientHeight;
        const sourceRatio = sourceMax > 0 ? source.scrollTop / sourceMax : 0;

        const targetMax = target.scrollHeight - target.clientHeight;
        const targetScrollTop = sourceRatio * targetMax;

        if (targetSide === "preview") {
            suppressPreviewScroll = true;
            target.scrollTop = targetScrollTop;
            requestAnimationFrame(() => {
                suppressPreviewScroll = false;
            });
            return;
        }

        suppressEditorScroll = true;
        target.scrollTop = targetScrollTop;
        requestAnimationFrame(() => {
            suppressEditorScroll = false;
        });
    }

    editor.addEventListener("scroll", () => {
        if (suppressEditorScroll) {
            return;
        }
        syncScroll(editor, preview, "preview");
    });

    preview.addEventListener("scroll", () => {
        if (suppressPreviewScroll) {
            return;
        }
        syncScroll(preview, editor, "editor");
    });

    app.actions.syncScroll = syncScroll;
})();
