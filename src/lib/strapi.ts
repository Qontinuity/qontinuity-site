// src/lib/strapi.ts

// Base URL de ton Strapi (préfixé VITE_ dans .env)
export const BASE = import.meta.env.VITE_STRAPI_URL;

/**
 * Convertit des blocs rich-text Strapi en HTML.
 */
function richTextToHtml(blocks: any[] = []): string {
  return blocks
    .map((block) => {
      if (block.type === "paragraph") {
        const text = (block.children || [])
          .map((child: any) => child.text || "")
          .join("");
        return `<p>${text}</p>`;
      }
      return "";
    })
    .join("");
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
    `${BASE}/api/formations` +
      `?filters[slug][$eq]=${slug}` +
      `&populate=*`,
  );
  if (!res.ok) {
    throw new Error(`Strapi getFormationBySlug error: ${res.status}`);
  }
  const { data } = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const item: any = data[0];
  const fa = item.attributes ?? item;

  return {
    id: item.id,
    titre: fa.titre || "",
    slug: fa.slug || "",
    niveauDepart: fa.Niveau_de_depart || "",
    duree: fa.duree || "",
    prixTtc: fa.prix_ttc || "",
    iaEtudiees: fa.IA_etudiees || "",
    descriptionHtml: richTextToHtml(
      Array.isArray(fa.description) ? fa.description : [],
    ),
  };
}