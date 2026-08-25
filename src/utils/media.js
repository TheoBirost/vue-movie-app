/**
 * Résout l'illustration d'une entité en une URL affichable.
 *
 * L'API expose deux formes d'image selon l'entité, et le front n'en lisait
 * qu'une troisième qui n'existe pas :
 *
 *  - `Movie.url`          — chaîne, URL d'affiche externe (colonne en base) ;
 *  - `Movie.image`,
 *    `Actor.photo`,
 *    `User.photo`         — MediaObject, fichier envoyé, dont l'URL utile est
 *                           `contentUrl` et qui est relative au domaine de l'API ;
 *  - `Actor.url`,
 *    `Director.url`       — n'existent pas. Les cartes lisaient ce champ, donc
 *                           `undefined`, donc toujours le visuel de repli.
 *
 * `Director` n'a aujourd'hui aucun champ d'image dans le modèle : le repli
 * reste le seul rendu possible tant qu'une colonne n'aura pas été ajoutée.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''

/** Préfixe les chemins relatifs servis par l'API (`/media/images/…`). */
const absolute = (path) => {
    if (!path) return ''
    return /^https?:\/\//i.test(path) ? path : `${API_BASE}${path}`
}

/**
 * @param {object | null | undefined} entity
 * @returns {string} URL affichable, ou chaîne vide s'il n'y a pas d'image
 */
export function resolveImage(entity) {
    if (!entity) return ''

    // 1. URL externe portée directement par l'entité (affiches de films)
    if (typeof entity.url === 'string' && entity.url) return absolute(entity.url)

    // 2. MediaObject imbriqué, selon le nom du champ dans l'entité
    for (const media of [entity.image, entity.photo]) {
        if (media && typeof media === 'object' && media.contentUrl) {
            return absolute(media.contentUrl)
        }
    }

    // 3. MediaObject sérialisé en simple IRI (`/api/media_objects/4`) : pas
    //    d'URL de fichier exploitable, on laisse le repli s'afficher plutôt que
    //    de fabriquer un lien qui renverrait du JSON.
    return ''
}
