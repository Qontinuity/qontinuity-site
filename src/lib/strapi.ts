// src/lib/strapi.ts

// Base URL de ton Strapi (préfixé VITE_ dans .env)
export const BASE = import.meta.env.VITE_STRAPI_URL;

/**
 * Convertit un contenu Rich Text (blocks) Strapi en HTML,
 * en gérant les marques, paragraphes, titres, et listes.
 */
function richTextToHtml(blocks: any[] = []): string {
  let html = "";
  let inList = false;
  let listTag = "ul";

  blocks.forEach((block) => {
    // 1️⃣ Génère le HTML des enfants avec marques + hard breaks
    const childrenHtml = (block.children || [])
      .map((child: any) => {
        let txt = (child.text || "").replace(/\r?\n/g, "<br/>");
        if (child.bold)          txt = `<strong>${txt}</strong>`;
        if (child.italic)        txt = `<em>${txt}</em>`;
        if (child.underline)     txt = `<u>${txt}</u>`;
        if (child.strikethrough) txt = `<s>${txt}</s>`;
        if (child.href) {
          txt = `<a href="${child.href}" class="text-indigo-600 hover:underline">${txt}</a>`;
        }
        return txt;
      })
      .join("");

    switch (block.type) {
      case "paragraph":
        // ferme une liste ouverte avant un paragraphe
        if (inList) {
          html += `</${listTag}>\n`;
          inList = false;
        }
        html += `<p>${childrenHtml.trim() ? childrenHtml : "<br/>"}</p>\n`;
        break;

      case "heading":
        if (inList) {
          html += `</${listTag}>\n`;
          inList = false;
        }
        html += `<h3 class="text-xl font-semibold my-4">${childrenHtml}</h3>\n`;
        break;

        case "list": {
          // Strapi utilise `format` = "unordered" | "ordered`
          const tag       = block.format === "ordered" ? "ol" : "ul";
          // on ajoute ml-6 pour l'indent, space-y-2 pour espacer chaque <li>
          const listClass = block.format === "ordered"
            ? "list-decimal ml-6 space-y-2"
            : "list-disc ml-6 space-y-2";
        
          const itemsHtml = (block.children || [])
            .map((item: any) => {
              const itemHtml = (item.children || [])
                .map((child: any) => {
                  let txt = (child.text || "").replace(/\r?\n/g, "<br/>");
                  if (child.bold)          txt = `<strong>${txt}</strong>`;
                  if (child.italic)        txt = `<em>${txt}</em>`;
                  if (child.underline)     txt = `<u>${txt}</u>`;
                  if (child.strikethrough) txt = `<s>${txt}</s>`;
                  if (child.href) {
                    txt = `<a href="${child.href}" class="text-indigo-600 hover:underline">${txt}</a>`;
                  }
                  return txt;
                })
                .join("");
              return `<li>${itemHtml}</li>`;
            })
            .join("\n");
        
          html += `<${tag} class="${listClass} mb-4">
        ${itemsHtml}
        </${tag}>\n`;
          break;
        }
        

      default:
        // ferme la liste si un autre bloc arrive
        if (inList) {
          html += `</${listTag}>\n`;
          inList = false;
        }
        html += childrenHtml;
    }
  });

  // en fin de tableau, ferme la liste si besoin
  if (inList) {
    html += `</${listTag}>\n`;
  }

  return html;
}


/**
 * Récupère toutes les catégories depuis Strapi.
 * Gère à la fois item.attributes et item (flat).
 */
export async function getCategories() {
  const res = await fetch(
    `${BASE}/api/categories?sort[0]=ordre:asc&pagination[pageSize]=100`,
  );
  if (!res.ok) {
    throw new Error(`Strapi getCategories error: ${res.status}`);
  }
  const { data } = await res.json();
  return (data || []).map((item: any) => {
    // raw pointe soit vers attributes, soit vers item lui-même
    const raw = item.attributes ?? item;
    return {
      id: item.id,
      nom: raw.Nom || raw.nom || "",
      slug: raw.slug,
      descriptionHtml: richTextToHtml(
        Array.isArray(raw.description) ? raw.description : [],
      ),
    };
  });
}

/**
 * Récupère une catégorie par slug, avec ses formations.
 * Gère flat vs attributes, et mapping des formations.
 */
export async function getCategorieBySlug(slug: string) {
  const res = await fetch(
    `${BASE}/api/categories?filters[slug][$eq]=${slug}&populate=formations`,
  );  
  if (!res.ok) {
    throw new Error(`Strapi getCategorieBySlug error: ${res.status}`);
  }
  const { data } = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const item: any = data[0];
  const raw = item.attributes ?? item;

  // Description riche
  const descriptionHtml = richTextToHtml(
    Array.isArray(raw.description) ? raw.description : [],
  );

  // Récupère les blocs de formations (flat array ou under .data)
  const formsRaw: any[] = Array.isArray(raw.formations)
    ? raw.formations
    : (raw.formations?.data ?? []);

    const formations = formsRaw.map((f: any) => {
      const fa = f.attributes ?? f;
      return {
        id: f.id,
        titre: fa.titre || "",
        slug: fa.slug || "",
        niveauDepart: fa.Niveau_de_depart || "",
        duree: fa.duree || "",
        prixTtc: fa.prix_ttc || "",
        IA_etudiees: fa.IA_etudiees || "",
        descriptionHtml: richTextToHtml(
          Array.isArray(fa.description) ? fa.description : [],
        ),
      };
    });

  return {
    id: item.id,
    nom: raw.Nom || raw.nom || "",
    slug: raw.slug,
    descriptionHtml,
    formations,
  };
}

/**
 * Récupère les blocs d’action depuis Strapi.
 */
// ---------- FAQ --------------------
export async function getFaqs() {
  const res = await fetch(
    `${BASE}/api/faqs?pagination[pageSize]=100`
  );
  if (!res.ok) {
    throw new Error(`Strapi getFaqs error: ${res.status}`);
  }
  const { data } = await res.json();
  return (data || []).map((item: any) => {
    const raw = item.attributes ?? item;
    return {
      id: item.id,
      question: raw.question || "",
      answerHtml: richTextToHtml(Array.isArray(raw.answer) ? raw.answer : []),
    };
  });
}
// ---------- FIN helper FAQs -----------

export async function getActionBlocks() {
  const res = await fetch(
    `${BASE}/api/action-blocks?sort[0]=ordre:asc&pagination[pageSize]=100`,
  );
  if (!res.ok) {
    throw new Error(`Strapi getActionBlocks error: ${res.status}`);
  }
  const { data } = await res.json();
  return (data || []).map((item: any) => {
    const raw = item.attributes ?? item;
    const description = Array.isArray(raw.description)
      ? raw.description
          .map((blk: any) =>
            (blk.children || []).map((c: any) => c.text || "").join(""),
          )
          .join("\n")
      : "";
    return {
      title: raw.titre || raw.Nom || "",
      description,
      link: raw.link || "#",
    };
  });
}

/**
 * (Fallback) Récupère les formations par slug de catégorie.
 */

// ---------- FIN helper formation ----------

export async function getFormationsByCategorySlug(slug: string) {
  const res = await fetch(
    `${BASE}/api/formations?filters[categorie][slug][$eq]=${slug}` +
      `&sort[0]=ordre:asc&pagination[pageSize]=100`,
  );
  if (!res.ok) {
    throw new Error(`Strapi getFormationsByCategorySlug error: ${res.status}`);
  }
  const { data } = await res.json();
  return (data || []).map((item: any) => {
    const raw = item.attributes || item;
    return {
      id: item.id,
      titre: raw.titre || "",
      slug: raw.slug || "",

    };
  });
}
/**
 * Récupère le détail d’une formation par son slug.
 */
export async function getFormationBySlug(slug: string) {
  const res = await fetch(
    `${BASE}/api/formations?filters[slug][$eq]=${slug}&populate=*`
  );

  if (!res.ok) {
    throw new Error(`Strapi getFormationBySlug error: ${res.status}`);
  }
  const { data } = await res.json();
  console.log('DEBUG sessions brut →', JSON.stringify(data, null, 2));
  if (!Array.isArray(data) || data.length === 0) return null;

  const item: any = data[0];
  const fa = item.attributes ?? item;
  /// DEBUG : afficher la structure brute du champ programme
  console.log(
    "DEBUG Strapi resume blocks →",
    JSON.stringify(fa.resume, null, 2)
  );

  // ─── Récupération des sessions liées ───
const sessionsRaw = Array.isArray(fa.sessions) ? fa.sessions : [];
const sessions = sessionsRaw.map((s: any) => ({
  id: s.id,
  date: s.date,
  heure_debut: s.heure_debut,
  heure_fin: s.heure_fin,
  mode: s.mode,
  // transforme le rich-text du lieu en HTML
  lieu: richTextToHtml(Array.isArray(s.lieu) ? s.lieu : []),
}));


  return {
    id: item.id,
    titre: fa.titre || "",
    slug: fa.slug || "",
    niveauDepart: fa.Niveau_de_depart || "",
    duree: fa.duree || "",
    prixTtc: fa.prix_ttc || "",
    iaEtudiees: fa.IA_etudiees || "",
    sessions,
    // ─── Champs Qualiopi ───
  resumeHtml: richTextToHtml(Array.isArray(fa.resume) ? fa.resume : []),
  publicConcerneHtml: richTextToHtml(Array.isArray(fa.public_concerne) ? fa.public_concerne : []),
  objectifsHtml: richTextToHtml(Array.isArray(fa.objectifs) ? fa.objectifs : []),
  programmeHtml: richTextToHtml(Array.isArray(fa.programme) ? fa.programme : []),
  evaluationHtml: richTextToHtml(Array.isArray(fa.processus_evaluation) ? fa.processus_evaluation : []),
  moyensPedagogiquesHtml: richTextToHtml(Array.isArray(fa.moyens_pedagogiques) ? fa.moyens_pedagogiques : []),
  handicapHtml: richTextToHtml(Array.isArray(fa.handicap) ? fa.handicap : []),
    descriptionHtml: richTextToHtml(
      Array.isArray(fa.description) ? fa.description : [],
    ),
    // ─── EXPOSER updatedAt pour la page Astro ───
    updatedAt: fa.updatedAt,
  };
}