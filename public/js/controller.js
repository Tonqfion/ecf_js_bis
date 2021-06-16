// J'importe ce dont j'ai besoin pour la suite

import { CONSTANTS } from "./config.js";
import * as model from "./models/model.js";
import * as HELPERS from "./helpers.js";
import TrackView from "./view/trackView.js";
import CoverView from "./view/coverView.js";
import ArtistView from "./view/artistView.js";
import ReleaseView from "./view/releaseView.js";

/** Jusque la ligne XXX, j'avais pas pensé à tester un embryon de MVC.
 * C'est pour ça que plein de trucs qui devraient pas se trouver sur le fichier controller. Mais ça devient mieux après.
 */

/** J'initalise mes variables */
let searchResults = [];
let idNbr;
let currentSearch;
let limit = 25;
let startingPoint;
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
 * 2 - J'initialise mon starting point à 0 (qui sera l'offset) et l'idNbr (qui affiche le "numéro" de la piste)
 * 3 - Je vide le parent element (le container des résultats)
 * 4 - J'enregistre la valeur dans le champs de recherche
 * 5 - J'enregistre une partie de la future URL à partir de ce qui se trouve dans le menu déroulant et du champs de recherche
 * 6 - Je lance la fonction de chargement des résultats
 */
function startSearchHandler() {
  CONSTANTS.NEW_SEARCH.classList.remove("hidden");
  CONSTANTS.HEADER.classList.add("pt-16");
  startingPoint = 0;
  idNbr = 1;
  CONSTANTS.PARENT_ELEMENT.innerHTML = "";
  currentSearch = CONSTANTS.SEARCH_FIELD.value;
  constructedURL = HELPERS.CONSTRUCT_URL_PART(searchFilterInput, currentSearch);
  loadSearchResults(CONSTANTS.PARENT_ELEMENT, startingPoint, limit);
}

const loadSearchResults = async function (parent, start, maxResults) {
  document.removeEventListener("scroll", scrollLoad);
  try {
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

    const data = await HELPERS.GET_JSON(
      encodeURI(
        `${CONSTANTS.API_URL}recording/?query=${constructedURL}&fmt=json&limit=${maxResults}&offset=${start}`
      )
    );
    totalResults = data.count;
    CONSTANTS.RESULT_COUNT_MESSAGE.classList.remove("hidden");
    CONSTANTS.RESULT_COUNT_MESSAGE.classList.add("flex");
    CONSTANTS.RESULT_COUNT_MESSAGE.innerHTML = `<p class="font-bold italic text-center text-blue-800">
      We found ${totalResults} results for this search.
    </p>`;
    searchResults = data.recordings.map((rec) => {
      return {
        rank: idNbr++,
        recordingID: rec.id,
        title: HELPERS.SHORTEN_STRING(rec.title, 50),
        artist:
          rec["artist-credit"].length === 1
            ? HELPERS.SHORTEN_STRING(rec["artist-credit"][0].name, 50)
            : HELPERS.SHORTEN_STRING(rec["artist-credit"][0].name, 50) +
              '<span class="italic"> & </span>' +
              HELPERS.SHORTEN_STRING(rec["artist-credit"][1].name, 50),
        artistID: rec["artist-credit"][0].artist.id,
        mainRelease: rec.hasOwnProperty("releases")
          ? HELPERS.SHORTEN_STRING(rec.releases[0].title, 80)
          : '<span class="font-bold italic text-red-800">No information on releases</span>',
        mainRelaseID: rec.hasOwnProperty("releases")
          ? rec["releases"][0].id
          : "",
      };
    });
    startingPoint += maxResults;

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

    function generateMarkupRow(result) {
      let releaseDetailBtnMarkup = "";
      if (result.mainRelaseID) {
        releaseDetailBtnMarkup = `<button type="button" id=${result.mainRelaseID}
            class="view-release-details w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
            <i class="fas fa-compact-disc"></i>
        </button>`;
      }

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

    parent.insertAdjacentHTML("beforeend", generateMarkUp(searchResults));
    if (totalResults <= limit) {
      CONSTANTS.RESULT_MESSAGE.innerHTML = `
    <p class="font-bold italic text-center text-blue-800">No more results to show!</p>
  `;
    }

    document.addEventListener("scroll", scrollLoad);

    createListener("track", controlTrackDetail);
    createListener("artist", controlArtistDetail);
    createListener("release", controlReleaseDetail);

    // return idNbr;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

function createListener(itemType, controlFunction) {
  const selectButtons = document.querySelectorAll(`.view-${itemType}-details`);
  selectButtons.forEach(function (selectButton) {
    selectButton.addEventListener("click", function () {
      const itemToShow = selectButton.id;
      controlFunction(itemToShow);
    });
  });
}

function scrollLoad() {
  if (HELPERS.GETDOCHEIGHT() == HELPERS.GETSCROLLXY()[1] + window.innerHeight) {
    if (startingPoint >= totalResults) {
      CONSTANTS.RESULT_MESSAGE.innerHTML = `
        <p class="font-bold italic text-center text-blue-800">No more results to show!</p>
      `;
    } else {
      loadSearchResults(CONSTANTS.PARENT_ELEMENT, startingPoint, limit);
    }
  }
}

const controlTrackDetail = async function (trackID) {
  try {
    CoverView.clear();

    TrackView.renderSpinner();
    await model.loadTrackDetail(trackID);
    TrackView.render(model.state.trackDetails);
  } catch (err) {
    console.log(err);
  }
};

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

/** Je lance la fonction ci-dessus au clic sur le bouton SEARCH
 * Mais aussi si on presse entrée dans le champs de recherche, ou pendant la sélection d'un filtre (je sais pas pourquoi mais c'était marqué dans la consigne)
 */
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

CONSTANTS.NEW_SEARCH.addEventListener("click", () => {
  HELPERS.INIT();
  document.removeEventListener("scroll", scrollLoad);
});

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
