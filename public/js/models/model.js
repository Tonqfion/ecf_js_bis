// Regarder controller.js en premier !
// J'importe ce dont j'ai besoin
import { CONSTANTS } from "../config.js";
import { CONVERT_MILLIS_TO_MINS_SECONDS } from "../helpers.js";
import { GET_JSON } from "../helpers.js";
import { REMOVE_DUPLICATES } from "../helpers.js";
import { ESCAPE_HTML } from "../helpers.js";
import CoverView from "../view/coverView.js";

// J'initialise le state
export const state = {
  trackDetails: {},
  coverUrlArray: [],
  renderCoverArray: [],
  artistDetails: {},
  releaseDetails: {},
  bookMarks: [],
};

// Je crée ma fonction qui charge les données si l'on clique sur la note (plus de détails sur la piste)
export const loadTrackDetail = async function (id) {
  try {
    const trackData = await GET_JSON(
      encodeURI(
        `${CONSTANTS.API_URL}recording/${id}?inc=genres+artists+ratings+releases&fmt=json`
      )
    );

    // Je vide les parties du state pour supprimer ce qui s'y trouvait contenu dedans au précédent clic
    state.coverUrlArray = [];
    state.renderCoverArray = [];

    // Je récupère les données dont j'ai besoin à partir de l'objet trackData pour me simplifier la tâche et je prépare déjà les cas d'erreurs pour mes views (données manquantes ou autre) à l'aide de ternaires sur les propriétés ainsi que de l'opérateur de coalescence des nuls.
    state.trackDetails = {
      trackTitle:
        ESCAPE_HTML(trackData.title) ??
        `<span class="italic text-red-800">No title provided</span>`,
      trackID: ESCAPE_HTML(trackData.id),
      trackReleaseDate: trackData["first-release-date"]
        ? ESCAPE_HTML(trackData["first-release-date"])
        : `<span class="italic text-red-800">No date provided</span>`,

      // J'utilise ma fonction de conversion en milisecondes sur la durée de la track si elle est renseignée
      trackLength:
        trackData.length && typeof trackData.length === "number"
          ? CONVERT_MILLIS_TO_MINS_SECONDS(trackData.length)
          : `<span class="italic text-red-800">No duration provided</span>`,

      // Je prépare le markup de ma trackView en faisant un map / join des noms des artistes
      trackArtists: trackData["artist-credit"].length
        ? trackData["artist-credit"]
            .map((artist) => ESCAPE_HTML(artist.name))
            .join(" / ")
        : `<span class="italic text-red-800">No information on artist</span>`,

      // Si releases a une longueur (en gros, supérieur à 0, donc qu'il y a une release pour la track) alors je prépare le markup en trois étapes :
      // 1 - je mappe le tableau en conservant uniquement les titres de chaque objet release
      // 2 - je supprime les doublons (cf helpers) pour pas que plusieurs releases ayant le même nom apparaissent (je sais, c'est pas ce qu'il y a dans la démo, mais je trouvais ça plus propre)
      // 3 - je join le tout
      trackReleasesDisplay: trackData["releases"].length
        ? REMOVE_DUPLICATES(
            trackData["releases"].map((release) => ESCAPE_HTML(release.title))
          ).join(" / ")
        : `<span class="italic text-red-800">No information on releases</span>`,

      // Comme je supprime des doublons et que je transforme ça en string sur la propriété précédente, je crée un tableau qui conserve les ID des releases, pour préparer les requêtes pour les cover
      trackReleasesIdArray: trackData["releases"].length
        ? trackData["releases"].map((release) => ESCAPE_HTML(release.id))
        : "no-release",

      // Même principe que pour les releases, mais sur les genres
      trackGenres: trackData["genres"].length
        ? REMOVE_DUPLICATES(
            trackData["genres"].map((genre) => ESCAPE_HTML(genre.name))
          ).join(" / ")
        : `<span class="italic text-red-800">No information on genres</span>`,

      // Pour le rating, s'il existe, je transforme la chaîne en nombre que j'arrondie à l'entier le plus proche
      trackRating:
        trackData.rating.value && typeof trackData.rating.value === "number"
          ? Math.round(Number(trackData.rating.value))
          : '<span class="italic text-red-800">No rating yet for this track</span>',

      // On initalise l'état de trackBookmarked selon que l'id soit présent dans le tableau bookmark ou non
      trackBookmarked: state.bookMarks.some(
        (bookMark) => bookMark.trackID === trackData.id
      )
        ? true
        : false,
    };

    // Hop, j'ai mes données de base, maintenant, je dois m'occuper de mes covers.
    // C'est là où je fais une entorse à mon architecture car j'utilise CoverView, mais je ne suis pas parvenu à gérer un affichage des covers APRES la récupération des données, sinon en mettant mes requêtes AJAX dans la fonction loadTrackDetails dans laquelle on se trouve.
    // Du coup, j'aurai plein de questions !

    // Je vérifie que la propriété où j'ai enregistrée mes ID est un tableau (sinon, c'est une string "no-release") et si oui, j'enregistre le return d'un map pour créer un tableau d'URL afin d'aller fetch mes covers de l'ensemble des releases
    if (Array.isArray(state.trackDetails.trackReleasesIdArray)) {
      state.coverUrlArray = state.trackDetails.trackReleasesIdArray.map((id) =>
        encodeURI(`${CONSTANTS.COVER_API_URL}${id}`)
      );
    }

    // Si la longueur du tableau généré est supérieur à 0, alors, je lance mes promesses sur chaque entrée de ce dernier. Promise.allSettled permet de consommer les résultats des promesses une fois que toutes sont retournées (Promise.all interrompt le process si une est rejetée)
    if (state.coverUrlArray.length > 0) {
      Promise.allSettled(
        state.coverUrlArray.map((url) => fetch(url).then((res) => res.json()))
      )
        // Je consomme les promesses et pousse dans un tableau uniquement celles dont le status est "fulfilled". Souvent, dans le cas de *.json qui retourne lui aussi une promesse lorsqu'on tente de parse du JSON sur quelque chose qui n'en est pas. Dans notre cas, il échoue lorsqu'une release n'a pas de covers associé (c'est du HTML qui s'affiche alors)
        .then((results) => {
          console.log(results);
          const validResults = [];
          results.forEach(function (release) {
            if (release.status == "fulfilled") {
              validResults.push(release.value);
            }
          });
          // Pour chaque objet "image" que je reçois contenu dans mon tableau, je recrée un tableau qui contient des objets avec uniquement l'url de l'image réduite en small, et son url originale
          validResults.forEach((release) => {
            release.images.forEach((image) => {
              state.renderCoverArray.push({
                thumbnailUrl: ESCAPE_HTML(image.thumbnails.small),
                originalUrl: ESCAPE_HTML(image.image),
              });
            });
          });
          console.log(state.renderCoverArray);

          // Voici l'entorse à l'architecture, le renderCovers qui devrait normalement être dans le controller ...
          CoverView.renderCovers(state.renderCoverArray);
        })
        .catch(function (err) {
          console.log("Woups, tu t'es raté !", err);
        });
    } else {
      // Sinon, j'affiche cover avec une string en paramètre (cf coverView pour voir ce que ça fait !)
      CoverView.renderCovers(state.trackDetails.trackReleasesIdArray);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Comme pour trackDetails, je crée une propriété artistDetails qui sera stockée dans l'état, pour afficher les détails de l'artiste principal à partir de son id
export const loadArtistDetail = async function (id) {
  try {
    const artistData = await GET_JSON(
      encodeURI(`${CONSTANTS.API_URL}artist/${id}?inc=releases&fmt=json`)
    );
    state.artistDetails = {
      artistName:
        ESCAPE_HTML(artistData.name) ??
        '<span class="italic text-red-800">No Name found',
      artistType:
        ESCAPE_HTML(artistData.type) ??
        '<span class="italic text-red-800">No type found for this artist</span>',
      artistID: ESCAPE_HTML(artistData.id),
      artistStartDate: artistData["life-span"].begin
        ? ESCAPE_HTML(artistData["life-span"].begin)
        : '<span class="italic text-red-800">No beginning date provided</span>',
      artistEndDate: artistData["life-span"].end
        ? ESCAPE_HTML(artistData["life-span"].end)
        : '<span class="italic text-red-800">No ending date provided</span>',
      artistArea: artistData.area
        ? ESCAPE_HTML(artistData.area.name)
        : '<span class="italic text-red-800">No info on area</span>',
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Idem, mais pour les détails de la release principale
export const loadReleaseDetail = async function (id) {
  try {
    const releaseData = await GET_JSON(
      encodeURI(
        `${CONSTANTS.API_URL}release/${id}?inc=artists+labels+recordings&fmt=json`
      )
    );

    state.renderCoverArray = [];

    state.releaseDetails = {
      releaseTitle: releaseData.title
        ? ESCAPE_HTML(releaseData.title)
        : '<span class="italic text-red-800">No title found</span>',
      releaseDate: releaseData.date
        ? ESCAPE_HTML(releaseData.date)
        : '<span class="italic text-red-800">No date provided</span>',
      releaseID: ESCAPE_HTML(releaseData.id),
      hasCover: releaseData["cover-art-archive"].count > 0 ? true : false,
      releaseArtists: releaseData["artist-credit"].length
        ? releaseData["artist-credit"]
            .map((artist) => ESCAPE_HTML(artist.name))
            .join(" / ")
        : `<span class="italic text-red-800">No information on artist</span>`,

      // La tracklist, où je regarde si le "premier" media existe (media a t-il une longueur supérieur à 0 ?) et si oui, je fais un map de tracks pour retourner une concaténation de sa position et de son titre.
      releaseTrackList: releaseData.media.length
        ? releaseData.media[0].tracks
            .map(
              (track) =>
                ESCAPE_HTML(track.position.toString()) +
                ". " +
                ESCAPE_HTML(track.recording.title)
            )
            .join("<br>")
        : `<span class="italic text-red-800">No tracklist provided</span>`,
    };

    // Si des covers sont indiquées (grâce à la propriété hasCover à true), je refais un renderCovers, mais avec une seule requête (pas besoin de tableau, vu qu'on traite une seule release)
    if (state.releaseDetails.hasCover) {
      fetch(
        encodeURI(`${CONSTANTS.COVER_API_URL}${state.releaseDetails.releaseID}`)
      )
        .then((res) => res.json())
        .then((result) => {
          result.images.forEach(function (image) {
            state.renderCoverArray.push({
              thumbnailUrl: ESCAPE_HTML(image.thumbnails.small),
              originalUrl: ESCAPE_HTML(image.image),
            });
            CoverView.renderCovers(state.renderCoverArray);
          });
        });
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// Et pour finir, petite partie pour enregistrer des bookmarks

// D'abord, je crée une fonction qui enregistre le tableau state.bookmarks dans le local storage à la clef "bookmarks"
const persistBookmark = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookMarks));
};

// Puis à chauqe ajout d'un bookmark, la track est passé dans le tableau, puis la fonction persistBookmark lancée pour enregistrer ce tableau dans le local storage
export const addBookmark = function (track) {
  state.bookMarks.push(track);
  state.trackDetails.trackBookmarked = true;
  persistBookmark();
};

// Inversement pour la suppression : on cherche l'index de la track correspondant à l'id passé comme paramètre de la fonction, puis, on le splice en utilisant l'index qui est ressorti avec la méthode findIndex. On relance persistBookmark pour mettre à jour le localStorage
export const deleteBookmark = function (id) {
  const index = state.bookMarks.findIndex((el) => el.trackID === id);
  state.bookMarks.splice(index, 1);
  state.trackDetails.trackBookmarked = false;
  persistBookmark();
};

// Enfin, on crée une fonction init qui, lorsqu'on lance l'appli, enregistre dans state.bookmark la valeur parser de la clef "bookmarks" de localStorage
const initBookmarks = function () {
  const storage = localStorage.getItem("bookmarks");
  if (storage) {
    state.bookMarks = JSON.parse(storage);
    console.log(state.bookMarks);
  }
};

// On lance la fonction au chargement du script
initBookmarks();
