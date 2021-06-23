// J'importe ce dont j'ai besoin
import { CONSTANTS } from "../config.js";
import { CONVERT_MILLIS_TO_MINS_SECONDS } from "../helpers.js";
import { GET_JSON } from "../helpers.js";
import { REMOVEDUPLICATES } from "../helpers.js";
import CoverView from "../view/coverView.js";

/* Quelques valeurs de tests
https://musicbrainz.org/ws/2/recording/738920d3-c6e6-41c7-b504-57761bb625fd?inc=genres+artists+ratings+releases&fmt=json
loadTrackDetail("738920d3-c6e6-41c7-b504-57761bb625fd");
*/

// J'initialise le state de mes données
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
    // Je vide les parties du state pour supprimer ce qui était contenu dedans au précédent clic
    state.coverUrlArray = [];
    state.renderCoverArray = [];

    // Je récupère les données dont j'ai besoin à partir de l'objet trackData pour me simplifier la tâche et je prépare déjà les cas d'erreurs pour mes views (données manquantes ou autre) à l'aide de ternaires sur les propriétés
    state.trackDetails = {
      trackTitle:
        trackData.title ??
        `<span class="italic text-red-800">No title provided</span>`,
      trackID: trackData.id,
      trackReleaseDate:
        trackData["first-release-date"] ??
        `<span class="italic text-red-800">No date provided</span>`,
      // J'utilise ma fonction de conversion en milisecondes sur la durée de la track si elle est renseignée
      trackLength: trackData.length
        ? CONVERT_MILLIS_TO_MINS_SECONDS(trackData.length)
        : `<span class="italic text-red-800">No duration provided</span>`,
      // Je prépare le markup de ma trackView en faisant un map / join des noms des artistes
      trackArtists: trackData["artist-credit"].length
        ? trackData["artist-credit"].map((artist) => artist.name).join(" / ")
        : `<span class="italic text-red-800">No information on artist</span>`,
      /* Si releases a une longueur (en gros, supérieur à 0, donc qu'il y a une release pour la track) alors je prépare le markup en trois étapes :
      1 - je mappe le tableau en conservant uniquement les titres de chaque objet release
      2 - je supprime les doublons (cf helpers) pour pas que plusieurs releases ayant le même nom apparaissent (je sais, c'est pas ce qu'il y a dans la démo, mais je trouvais ça plus propre)
      3 - je join le tout */
      trackReleasesDisplay: trackData["releases"].length
        ? REMOVEDUPLICATES(
            trackData["releases"].map((release) => release.title)
          ).join(" / ")
        : `<span class="italic text-red-800">No information on releases</span>`,
      /* Comme je supprime des doublons et que je transforme ça en string sur la propriété précédente, je crée un tableau qui conserve les ID des releases, pour préparer les requêtes pour les cover  */
      trackReleasesIdArray: trackData["releases"].length
        ? trackData["releases"].map((release) => release.id)
        : "no-release",
      /* Même principe que pour les releases, mais sur les genres */
      trackGenres: trackData["genres"].length
        ? REMOVEDUPLICATES(trackData["genres"].map((genre) => genre.name)).join(
            " / "
          )
        : `<span class="italic text-red-800">No information on genres</span>`,
      /* Enfin, pour le rating, s'il existe, je transforme la chaîne en nombre que j'arrondie à l'entier le plus proche*/
      trackRating: trackData.rating.value
        ? Math.round(Number(trackData.rating.value))
        : '<span class="italic text-red-800">No rating yet for this track</span>',
    };
    if (state.bookMarks.some((bookMark) => bookMark.trackID === id)) {
      state.trackDetails.trackBookmarked = true;
    } else {
      state.trackDetails.trackBookmarked = false;
    }
    /** Hop, j'ai mes données de base, maintenant, je dois m'occuper de mes covers.
     * C'est là où je fais une entorse au MVC car j'utilise CoverView, mais je ne suis pas parvenu à gérer un affichage des covers APRES la récupération des données, sinon en mettant mes requêtes AJAX dans la fonction loadTrackDetails dans laquelle on se trouve.
     * Du coup, j'aurai plein de questions !
     */

    /* Je vérifie que la propriété où j'ai enregistrée mes ID est un tableau (sinon, c'est une string "no-release") et si oui, je fais un map pour créer un tableau d'URL pour aller fetch mes covers de l'ensemble des releases */
    if (Array.isArray(state.trackDetails.trackReleasesIdArray)) {
      state.coverUrlArray = state.trackDetails.trackReleasesIdArray.map((id) =>
        encodeURI(`${CONSTANTS.COVER_API_URL}${id}`)
      );
    }

    /**
     *
     */
    if (state.coverUrlArray.length > 0) {
      Promise.allSettled(
        state.coverUrlArray.map((url) => fetch(url).then((res) => res.json()))
      )
        .then((results) => {
          console.log(results);
          const validResults = [];
          results.forEach(function (release) {
            console.log(release);
            if (release.status == "fulfilled") {
              validResults.push(release.value);
            }
          });
          validResults.forEach((release) => {
            console.log(release);
            release.images.forEach((image) => {
              state.renderCoverArray.push({
                thumbnailUrl: image.thumbnails.small,
                originalUrl: image.image,
              });
            });
          });
          console.log(state.renderCoverArray);
          CoverView.renderCovers(state.renderCoverArray);
        })
        .catch(function (err) {
          console.log("Woups, tu t'es raté !", err);
        });
    } else {
      CoverView.renderCovers(state.trackDetails.trackReleasesIdArray);
    }
  } catch (err) {
    throw err;
  }
};

//http://musicbrainz.org/ws/2/artist/f27ec8db-af05-4f36-916e-3d57f91ecf5e?inc=releases&fmt=json
export const loadArtistDetail = async function (id) {
  try {
    const artistData = await GET_JSON(
      encodeURI(`${CONSTANTS.API_URL}artist/${id}?inc=releases&fmt=json`)
    );
    state.artistDetails = {
      artistName:
        artistData.name ?? '<span class="italic text-red-800">No Name found',
      artistType:
        artistData.type ??
        '<span class="italic text-red-800">No type found for this artist</span>',
      artistID: artistData.id,
      artistStartDate:
        artistData["life-span"].begin ??
        '<span class="italic text-red-800">No beginning date provided</span>',
      artistEndDate:
        artistData["life-span"].end ??
        '<span class="italic text-red-800">No ending date provided</span>',
      artistArea: artistData.area
        ? artistData.area.name
        : '<span class="italic text-red-800">No info on area</span>',
    };
  } catch (err) {
    throw err;
  }
};

export const loadReleaseDetail = async function (id) {
  try {
    const releaseData = await GET_JSON(
      encodeURI(
        `${CONSTANTS.API_URL}release/${id}?inc=artists+labels+recordings&fmt=json`
      )
    );
    state.renderCoverArray = [];
    console.log(releaseData);
    state.releaseDetails = {
      releaseTitle:
        releaseData.title ??
        '<span class="italic text-red-800">No title found</span>',
      releaseDate:
        releaseData.date ??
        '<span class="italic text-red-800">No date provided</span>',
      releaseID: releaseData.id,
      hasCover: releaseData["cover-art-archive"].count > 0 ? true : false,
      releaseArtists: releaseData["artist-credit"].length
        ? releaseData["artist-credit"].map((artist) => artist.name).join(" / ")
        : `<span class="italic text-red-800">No information on artist</span>`,
      releaseTrackList: releaseData.media.length
        ? releaseData.media[0].tracks
            .map((track) => track.position + ". " + track.recording.title)
            .join("<br>")
        : `<span class="italic text-red-800">No tracklist provided</span>`,
    };

    if (state.releaseDetails.hasCover) {
      fetch(
        encodeURI(`${CONSTANTS.COVER_API_URL}${state.releaseDetails.releaseID}`)
      )
        .then((res) => res.json())
        .then((result) => {
          result.images.forEach(function (image) {
            state.renderCoverArray.push({
              thumbnailUrl: image.thumbnails.small,
              originalUrl: image.image,
            });
            console.log(state.renderCoverArray);
            CoverView.renderCovers(state.renderCoverArray);
          });
        });
    }
  } catch (err) {
    throw err;
  }
};

export const addBookmark = function (track) {
  state.bookMarks.push(track);
  state.trackDetails.trackBookmarked = true;
};

export const deleteBookmark = function (id) {
  const index = state.bookMarks.findIndex((el) => el.trackID === id);
  state.bookMarks.splice(index, 1);
  state.trackDetails.trackBookmarked = false;
};
