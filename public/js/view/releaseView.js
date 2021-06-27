import View from "./view.js";

// Un markup spécifique pour l'affichage des détails de la release principale
class ReleaseView extends View {
  generateMarkup() {
    return `<h2 class="text-3xl leading-6 font-medium text-gray-900" id="modal-title">
    ${this.data.releaseTitle}
  </h2>
  <div class="mt-2">
  <h3 class="mt-2 text-xl text-gray-900">Artist</h3>
  <p class="border-b-2 pb-2">
  ${this.data.releaseArtists}
  </p>
  <h3 class="mt-2 text-xl text-gray-900">Release Date</h3>
  <p class="border-b-2 pb-2">
  ${this.data.releaseDate}
  </p>
  <h3 class="mt-2 text-xl text-gray-900">Track list</h3>
  <p class="border-b-2 pb-2">
  ${this.data.releaseTrackList}
  </p>
</div>`;
  }
}

// J'exporte une instance par défaut pour le controller
export default new ReleaseView();
