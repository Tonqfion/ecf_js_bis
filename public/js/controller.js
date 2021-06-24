// J'importe ce dont j'ai besoin pour la suite

import { CONSTANTS } from "./config.js";
import * as model from "./models/model.js";
import * as HELPERS from "./helpers.js";
import TrackView from "./view/trackView.js";
import CoverView from "./view/coverView.js";
import ArtistView from "./view/artistView.js";
import ReleaseView from "./view/releaseView.js";
import BookmarkView from "./view/bookmarkView.js";

/** Jusque la ligne XXX, j'avais pas pensé à tester un embryon de MVC.
 * C'est pour ça que plein de trucs qui devraient pas se trouver sur le fichier controller. Mais ça devient mieux après.
 */

/** J'initalise mes variables */
let searchResults = [];
let idNbr;
let currentSearch;
let limit = 25;
let offSet;
let totalResults;
let searchFilterInput = CONSTANTS.SEARCH_FILTER.value;
let constructedURL;

/**J'utilise ma fonction d'initialisation au chargement du script "au cas où" */
HELPERS.INIT();

/** J'enregistre la valeur du filtre dans une variable à chaque input */
CONSTANTS.SEARCH_FILTER.addEventListener("input", function (ev) {
  ev.preventDefault();
  searchFilterInput = ev.target.value;
  console.log(searchFilterInput);
});

/** Je crée ma fonction qui se lance quand on commence une recherche
 * 1 - J'affiche le bouton pour commencer une nouvelle recherche (en haut en fixed) et je décale le header pour que l'on voit le logo
 * 2 - J'initialise mon offset à 0 et l'idNbr (qui affiche le "numéro" de la piste)
 * 3 - Je vide le parent element (le container des résultats)
 * 4 - J'enregistre la valeur dans le champs de recherche
 * 5 - J'enregistre une partie de la future URL à partir de ce qui se trouve dans le menu déroulant et du champs de recherche
 * 6 - Je lance la fonction de chargement des résultats
 */
function startSearchHandler() {
  CONSTANTS.NEW_SEARCH.classList.remove("hidden");
  CONSTANTS.HEADER.classList.add("pt-16");
  offSet = 0;
  idNbr = 1;
  CONSTANTS.PARENT_ELEMENT.innerHTML = "";
  currentSearch = CONSTANTS.SEARCH_FIELD.value;
  constructedURL = HELPERS.CONSTRUCT_URL_PART(searchFilterInput, currentSearch);
  loadSearchResults(CONSTANTS.PARENT_ELEMENT, offSet, limit);
}

// Fonction de chargement des résultats Elle se lance : soit au clic, soit au "scroll"

const loadSearchResults = async function (parent, start, maxResults) {
  // Je supprime l'eventlistener au scroll, pour éviter de le lancer une seconde fois avant que les résultats aient chargés
  document.removeEventListener("scroll", scrollLoad);
  try {
    // Je vide le cotenu du message indiquant les informations sur la recherche, et en attendant que ces derniers s'affichent, je fais apparaître un spinner
    CONSTANTS.RESULT_MESSAGE.innerHTML = "";
    CONSTANTS.RESULT_MESSAGE.innerHTML = `<svg
      class="animate-spin ml-1 mr-3 h-5 w-5 text-blue-800"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>`;

    // je lance ma fonction GET_JSON (cf helpers) qui prend une URL en paramètre et enregistre le résultat dans data
    const data = await HELPERS.GET_JSON(
      encodeURI(
        `${CONSTANTS.API_URL}recording/?query=${constructedURL}&fmt=json&limit=${maxResults}&offset=${start}`
      )
    );

    // Une fois les promesses résolues, j'affiche le nombre de résultats
    totalResults = data.count;
    CONSTANTS.RESULT_COUNT_MESSAGE.classList.remove("hidden");
    CONSTANTS.RESULT_COUNT_MESSAGE.classList.add("flex");
    CONSTANTS.RESULT_COUNT_MESSAGE.innerHTML = `<p class="font-bold italic text-center text-blue-800">
      We found ${totalResults} results for this search.
    </p>`;

    // Je mappe les résultats dans un nouvel objet plus exploitable (pas bien pour la mémoire !) qui enregistrera des valeurs pour différentes clefs selon la nature des résultats. J'en profite aussi pour raccourcis les noms des artistes, titres ou nom d'albums trop longs pour simplifier l'affichage.
    searchResults = data.recordings.map((rec) => {
      return {
        rank: idNbr++,
        recordingID: rec.id,
        title: HELPERS.SHORTEN_STRING(rec.title, 50),
        // Selon qu'il y ait un artiste ou plus, j'affiche au moins un artiste, sinon je concatène avec le nom du second (et désolé s'il y en a plus ...)
        artist:
          rec["artist-credit"].length === 1
            ? HELPERS.SHORTEN_STRING(rec["artist-credit"][0].name, 50)
            : HELPERS.SHORTEN_STRING(rec["artist-credit"][0].name, 50) +
              '<span class="italic"> & </span>' +
              HELPERS.SHORTEN_STRING(rec["artist-credit"][1].name, 50),
        artistID: rec["artist-credit"][0].artist.id,

        // Parfois, un titre n'a pas de releases, dans ce cas, j'affiche un texte différent !
        mainRelease: rec.hasOwnProperty("releases")
          ? HELPERS.SHORTEN_STRING(rec.releases[0].title, 80)
          : '<span class="font-bold italic text-red-800">No information on releases</span>',
        mainRelaseID: rec.hasOwnProperty("releases")
          ? rec["releases"][0].id
          : "",
      };
    });

    // J'incrémente l'offset, qui me servira pour mon prochain chargement de la fonction.
    offSet += maxResults;

    // Je crée un markup pour chaque résultat, qui prendra un objet du tableau searchResult en paramètre, et où les boutons pour afficher les détails utiliseront en id l'id de la track / de l'artiste[0] / de la release[0]
    function generateMarkupRow(result) {
      // Je crée un bouton pour afficher des détails sur la "mainRelease" (que j'ai choisi, arbitrairement, comme la première du tableau rec.releases) uniquement s'il existe
      let releaseDetailBtnMarkup = "";
      if (result.mainRelaseID) {
        releaseDetailBtnMarkup = `<button type="button" id=${result.mainRelaseID}
            class="view-release-details w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
            <i class="fas fa-compact-disc"></i>
        </button>`;
      }

      // Je crée le reste du markup, avec les infos sur la track pour chaque ligne, et les trois boutons
      return `<div class="result-row flex items-center px-2 py-4 border-gray-400 border-b-2">
          <p class="w-1/12 text-center">${result.rank}</p>
          <p class="w-3/12 border-l-2 border-blue-100 pl-3">${result.artist}</p>
          <p class="w-3/12 border-l-2 border-blue-100 pl-3">${result.title}</p>
          <p class="w-3/12 border-l-2 border-blue-100 pl-3">${result.mainRelease}</p>
          <div class="w-2/12 border-l-2 border-blue-100 pl-3 flex flex-row">
          <button type="button" id=${result.recordingID}
              class="view-track-details w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              <i class="fas fa-music"></i>
          </button>
          <button type="button" id=${result.artistID}
              class="view-artist-details w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
              <i class="fas fa-users"></i>
          </button>
          ${releaseDetailBtnMarkup}
          </div>
      </div>`;
    }

    // Je crée la fonction de génération du markup complet qui prend un tableau en paramètre et retourne un markup HTML grâce à un map / join (uniquement si le tableau à une longueur supérieur à zéro). Sinon, on affiche un message d'erreur.
    function generateMarkUp(data) {
      if (data.length > 0) {
        const markUp = data.map(generateMarkupRow).join("");
        return markUp;
      } else {
        CONSTANTS.RESULT_MESSAGE.innerHTML = `
        <p class="font-bold italic text-center text-blue-800">Sorry, no results were found. Check your spelling or try a new search query.</p>
      `;
        const markUp = "";
        return markUp;
      }
    }

    // On insère le markup complet avec le tableau searchResults en paramètres avant la fin du parent, c'est à dire entre la div affichant le nombre de résultat, et celle affichant le spinner.
    parent.insertAdjacentHTML("beforeend", generateMarkUp(searchResults));

    // S'il y a moins de résultats que la limite, on affiche un message expliquant qu'il n'y a plus de résultat à afficher (uniquement valable pour le premier chargement de la fonction)
    if (totalResults <= limit) {
      CONSTANTS.RESULT_MESSAGE.innerHTML = `
    <p class="font-bold italic text-center text-blue-800">No more results to show!</p>
  `;
    }

    // Je récrée l'eventlistener que j'ai supprimé au début, qui recharge la fonction une fois qu'on a atteind le bas de la fenêtre
    document.addEventListener("scroll", scrollLoad);

    // J'ajoute les events listener sur tous les boutons avec leur fonction de callBack selon la class du bouton (sans doute pas très propre car j'imagine que ça recrée les eventslisteners sur l'intégralité des boutons d'affichage des détails, pas uniquement les derniers ...)
    createEventListener("track", controlTrackDetail);
    createEventListener("artist", controlArtistDetail);
    createEventListener("release", controlReleaseDetail);
  } catch (err) {
    // Je log l'erreur si jamais j'en ai une !
    console.log(err);
  }
};

// Je lance la fonction ci-dessus au clic sur le bouton SEARCH, mais aussi si on presse Entrée dans le champs de recherche, ou pendant la sélection d'un filtre (je sais pas pourquoi mais c'était marqué dans la consigne)
CONSTANTS.SEARCH_BUTTON.addEventListener("click", startSearchHandler);
CONSTANTS.SEARCH_FIELD.addEventListener("keypress", function (ev) {
  if (ev.key === "Enter") {
    startSearchHandler();
  }
});

CONSTANTS.SEARCH_FILTER.addEventListener("keypress", function (ev) {
  if (ev.key === "Enter") {
    startSearchHandler();
  }
});

// Ma fonction de création des eventslisteners, qui les crée sur les boutons ci-dessus, et leur applique une fonction callback selon l'id
function createEventListener(itemType, controlFunction) {
  const selectButtons = document.querySelectorAll(`.view-${itemType}-details`);
  selectButtons.forEach(function (selectButton) {
    selectButton.addEventListener("click", function () {
      const itemToShow = selectButton.id;
      controlFunction(itemToShow);
    });
  });
}

// Ma fonction qui charge les résultats au scroll. Je l'ai pompé sur le net :D Mais en gros, elle enregistre la hauteur du document, puis compare à la position du scroll, et se déclenche quand les deux sont égales. S'il n'y a plus de résultats à afficher (que l'offset de la future fonction loadSearchResults dépasse le nombre de résultats total), alors j'affiche un message, sinon, on relance la fonction loadsearchresults.
function scrollLoad() {
  if (HELPERS.GETDOCHEIGHT() == HELPERS.GETSCROLLXY()[1] + window.innerHeight) {
    if (offSet >= totalResults) {
      CONSTANTS.RESULT_MESSAGE.innerHTML = `
        <p class="font-bold italic text-center text-blue-800">No more results to show!</p>
      `;
    } else {
      loadSearchResults(CONSTANTS.PARENT_ELEMENT, offSet, limit);
    }
  }
}

// A partir de là, j'ai commencé à me dire que si je continuais comme ça, j'allais avoir dix kilomètres de code dans un fichier. Je me suis dis que j'allais séparer mon code pour rendre ça plus propre. Mais comme j'étais en même temps en train de faire un petit cours sur un projet similaire, mais organisé différemment (en utilisant un ersatz de MVC), j'ai décidé de laisser le chargement des résultats comme je l'avais fait jusque là, mais de faire l'affichage des détails en essayant de mettre en place ce que j'avais appris. A partir de ce point, et tous les autres fichiers du projet prennent tout ça en compte.

// Ma fonction de callback, attaché au bouton avec la note de musique qui charge, stocke et affiche le détail de la piste en fonction de son id
const controlTrackDetail = async function (trackID) {
  try {
    // Je vide le conteneur des détails (via renderSpinner) et des covers au cas où ce ne soit pas le premier affichage de détails.
    CoverView.clear();
    TrackView.renderSpinner();

    // Je charge les infos qui m'intéressent dans le model.trackDetails
    await model.loadTrackDetail(trackID);

    // Une fois les infos enregistrées, j'utilise mon objet state comme paramètre de ma méthode render pour afficher les détails de la piste dans la modale
    TrackView.render(model.state.trackDetails);
    console.log(model.state.trackDetails);
  } catch (err) {
    console.log(err);
  }
};

// Même principe que plus haut, si on veut afficher des détails sur l'ariste principal en fonction de son id
const controlArtistDetail = async function (artistID) {
  try {
    CoverView.clear();
    ArtistView.renderSpinner();
    await model.loadArtistDetail(artistID);
    ArtistView.render(model.state.artistDetails);
    console.log(model.state.artistDetails);
  } catch (err) {
    console.log(err);
  }
};

// Et pareil, mais pour la release principale
const controlReleaseDetail = async function (releaseID) {
  try {
    CoverView.clear();
    ReleaseView.renderSpinner();
    await model.loadReleaseDetail(releaseID);
    console.log(model.state.releaseDetails);
    ReleaseView.render(model.state.releaseDetails);
  } catch (err) {
    console.log(err);
  }
};

// Une fonction d'ajout de piste dans les bookmarks
const controlAddBookmark = function () {
  // 1) Ajouter ou supprimer les bookmarks
  if (!model.state.trackDetails.trackBookmarked) {
    model.addBookmark(model.state.trackDetails);
  } else {
    model.deleteBookmark(model.state.trackDetails.trackID);
  }

  // 2) Update de l'affichage des boutons sur la track qu'on affiche quand on l'ajoute / la supprime des bookmarks
  TrackView.updateTrackView(model.state.trackDetails);

  // 3) Affichage des bookmarks dans le dropdown, et ajout d'un eventlistener sur le bouton pour réafficher les détails des tracks qu'on y a ajouté rapidement
  BookmarkView.render(model.state.bookMarks);
  createEventListener("bookmark", controlTrackDetail);
};

// Fonction pour afficher les bookmarks et créer les eventslisteners au chargement de la page s'il y en a dans le localstorage et qu'ils ont été enregistrés dans le model.state.bookmarks
const controlBookmarks = function () {
  BookmarkView.render(model.state.bookMarks);
  createEventListener("bookmark", controlTrackDetail);
};

// fonction d'initialisation des handler (car les bookmarks n'existent pas au moment de l'affichage de la page, de même que les boutons qui sont crée via une view. Il faut donc que je gère les events listeners différemment que par rapport à auparavant, où je les créée après leur affichage dans mon architecture "procédurale")
function initHandler() {
  BookmarkView.addHandlerRenderOnPageLoad(controlBookmarks);
  TrackView.addHandlerAddBookmark(controlAddBookmark);
}

// je lance la fonction en question
initHandler();

// Et pour finir, quelques eventslisteners User Friendly
// L'eventlistener attaché au bouton newsearch, qui lance la fonction INIT() (cf helpers) réinitialisant l'état original de la page et qui supprime l'eventlistener "onscroll" (car ça fait bugger si on le laisse...)
CONSTANTS.NEW_SEARCH.addEventListener("click", () => {
  HELPERS.INIT();
  document.removeEventListener("scroll", scrollLoad);
});

// Et enfin 3 méthodes pour fermer la modale : en cliquant sur le bouton "back to result", en faisant Echap, ou en cliquant sur le background de la modale
CONSTANTS.CLOSE_MODAL.addEventListener("click", function () {
  CONSTANTS.MODAL_WINDOW.classList.add("hidden");
});

document.addEventListener("keydown", function (ev) {
  if (ev.key === "Escape") {
    CONSTANTS.MODAL_WINDOW.classList.add("hidden");
  }
});

document.getElementById("modal-background").addEventListener("click", () => {
  CONSTANTS.MODAL_WINDOW.classList.add("hidden");
});
