import { SHORTEN_STRING } from "../helpers.js";
import View from "./view.js";

class BookmarkView extends View {
  parentElement = document.getElementById("bookmarkList");

  generateMarkup() {
    if (this.data.length > 0) {
      return this.data.map(this.generateUniqueMarkup).join("");
    } else {
      return `
      <li class="p-2 flex justify-between bg-red-400">
          <p>No bookmark yet. Search some music and add tracks to your bookmarks.</p>
      </li>`;
    }
  }

  //
  addHandlerRenderOnPageLoad(handler) {
    window.addEventListener("load", handler);
  }

  generateUniqueMarkup(track) {
    return `<li class="p-2 flex justify-between bg-red-400">    
    <p>${SHORTEN_STRING(track.trackArtists, 40)} - ${SHORTEN_STRING(
      track.trackTitle,
      40
    )}  </p>
      <button
        type="button" id=${track.trackID}
        class="view-bookmark-details w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 w-min sm:text-sm">
        <i class="fas fa-music"></i>
      </button>
    </li>`;
  }
}

// J'exporte une instance par défaut pour le controller
export default new BookmarkView();
