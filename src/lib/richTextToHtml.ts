/**
 * Parcours un tableau de blocs Strapi Rich Text (Blocks)
 * et retourne une chaîne HTML, en gérant notamment
 * les liens (http(s):// et mailto:).
 */
export function richTextToHtml(blocks: any[]): string {
    if (!Array.isArray(blocks)) return "";
  
    return blocks
      .map((node) => {
        switch (node.type) {
          case "paragraph": {
            const inner = (node.children || [])
              .map((child: any) => {
                if (child.type === "text") {
                  return child.value;
                }
                if (child.type === "link") {
                  const url = child.url;
                  // autorise http, https et mailto
                  if (/^(https?:\/\/|mailto:)/.test(url)) {
                    return `<a href="${url}">${child.children?.[0]?.value || url}</a>`;
                  }
                  // sinon, on affiche en texte brut
                  return child.children?.[0]?.value || "";
                }
                return "";
              })
              .join("");
            return `<p>${inner}</p>`;
          }
          case "heading": {
            const level = node.level >= 1 && node.level <= 6 ? node.level : 2;
            const inner = (node.children || [])
              .map((c: any) => c.value || "")
              .join("");
            return `<h${level}>${inner}</h${level}>`;
          }
          case "bulletList":
            return `<ul>${(node.children || [])
              .map((li: any) => `<li>${(li.children || []).map((c: any) => c.value || "").join("")}</li>`)
              .join("")}</ul>`;
          case "orderedList":
            return `<ol>${(node.children || [])
              .map((li: any) => `<li>${(li.children || []).map((c: any) => c.value || "").join("")}</li>`)
              .join("")}</ol>`;
          // tu peux ajouter d'autres types (blockquote, code, etc.)
          default:
            return "";
        }
      })
      .join("");
  }
  