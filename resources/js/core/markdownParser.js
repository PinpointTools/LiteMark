(function () {
    const app = window.LiteMark || (window.LiteMark = {});

    app.services = app.services || {};
    app.services.markdownToHtml = markdownToHtml;

    function markdownToHtml(markdown) {
        const lines = markdown.replace(/\r/g, "").split("\n");
        const html = [];
        let inCodeBlock = false;
        let inList = false;

        for (let i = 0; i < lines.length; i += 1) {
            const line = lines[i];
            
            if (line.trim().startsWith("```")) {
                if (inCodeBlock) {
                    html.push("</code></pre>");
                }
                else {
                    if (inList) {
                        html.push("</ul>");
                        inList = false;
                    }
                    html.push("<pre><code>");
                }
                inCodeBlock = !inCodeBlock;
                continue;
            }

            
            if (line.trim().startsWith("---")) {
                html.push("<hr/>");
                continue;
            }

            if (inCodeBlock) {
                html.push(escapeHtml(line) + "\n");
                continue;
            }

            if (i + 1 < lines.length && line.includes("|") && isTableDivider(lines[i + 1])) {
                const headers = splitTableRow(line);
                const alignments = getTableAlignments(lines[i + 1]);
                if (headers.length > 0 && headers.length === alignments.length) {
                    if (inList) {
                        html.push("</ul>");
                        inList = false;
                    }

                    html.push("<table><thead><tr>");
                    for (let col = 0; col < headers.length; col += 1) {
                        html.push(`<th style="text-align:${alignments[col]}">${inlineMarkdown(headers[col])}</th>`);
                    }
                    html.push("</tr></thead><tbody>");

                    i += 2;
                    while (i < lines.length && lines[i].trim() && lines[i].includes("|")) {
                        const cells = splitTableRow(lines[i]);
                        if (cells.length !== headers.length) {
                            break;
                        }

                        html.push("<tr>");
                        for (let col = 0; col < cells.length; col += 1) {
                            html.push(`<td style="text-align:${alignments[col]}">${inlineMarkdown(cells[col])}</td>`);
                        }
                        html.push("</tr>");
                        i += 1;
                    }
                    html.push("</tbody></table>");
                    i -= 1;
                    continue;
                }
            }

            if (!line.trim()) {
                if (inList) {
                    html.push("</ul>");
                    inList = false;
                }
                continue;
            }

            const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
            if (headingMatch) {
                if (inList) {
                    html.push("</ul>");
                    inList = false;
                }
                const level = headingMatch[1].length;
                html.push(`<h${level}>${inlineMarkdown(headingMatch[2])}</h${level}>`);
                continue;
            }

            const listMatch = line.match(/^[-*]\s+(.*)$/);
            if (listMatch) {
                if (!inList) {
                    html.push("<ul>");
                    inList = true;
                }
                html.push(`<li>${inlineMarkdown(listMatch[1])}</li>`);
                continue;
            }

            if (inList) {
                html.push("</ul>");
                inList = false;
            }

            if (line.startsWith("> ")) {
                html.push(`<blockquote>${inlineMarkdown(line.slice(2))}</blockquote>`);
                continue;
            }

            html.push(`<p>${inlineMarkdown(line)}</p>`);
        }

        if (inList) {
            html.push("</ul>");
        }
        if (inCodeBlock) {
            html.push("</code></pre>");
        }

        return html.join("\n");
    }

    function inlineMarkdown(text) {
        const escaped = escapeHtml(text);
        return escaped
            .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">')
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/\*([^*]+)\*/g, "<em>$1</em>")
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    }

    function splitTableRow(row) {
        let content = row.trim();
        if (content.startsWith("|")) {
            content = content.slice(1);
        }
        if (content.endsWith("|")) {
            content = content.slice(0, -1);
        }
        return content.split("|").map((cell) => cell.trim());
    }

    function isTableDivider(row) {
        const cells = splitTableRow(row);
        if (cells.length === 0) {
            return false;
        }
        return cells.every((cell) => /^:?-+:?$/.test(cell));
    }

    function getTableAlignments(dividerRow) {
        return splitTableRow(dividerRow).map((cell) => {
            const left = cell.startsWith(":");
            const right = cell.endsWith(":");
            if (left && right) {
                return "center";
            }
            if (right) {
                return "right";
            }
            return "left";
        });
    }

    function escapeHtml(value) {
        return value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
