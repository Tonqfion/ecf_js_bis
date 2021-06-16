import view from "./view.js";

class TrackView extends view {
  generateMarkup() {
    return `<h2 class="text-3xl leading-6 font-medium text-gray-900" id="modal-title">
    ${this.data.trackTitle}
  </h2>
  <div class="mt-2">
  <h3 class="mt-2 text-xl text-gray-900">First release date</h3>
  <p class="border-b-2 pb-2">
  ${this.data.trackReleaseDate}
  </p>
  <h3 class="mt-2 text-xl text-gray-900">Track duration</h3>
  <p class="border-b-2 pb-2">
  ${this.data.trackLength}
  </p>
    <h3 class="mt-2 text-xl text-gray-900">Artist credits</h3>
    <p class="border-b-2 pb-2">
    ${this.data.trackArtists}
    </p>
    <h3 class="mt-2 text-xl text-gray-900">Release list</h3>
    <p class="border-b-2 pb-2">
    ${this.data.trackReleasesDisplay}
    </p>
    <h3 class="mt-2 text-xl text-gray-900">Genres</h3>
    <p class="border-b-2 pb-2">
    ${this.data.trackGenres}
    </p>
    <h3 class="mt-2 text-xl text-gray-900">Rating</h3>
    <p class="border-b-2 pb-2">
    ${
      isNaN(this.data.trackRating)
        ? this.data.trackRating
        : this.generateStars(this.data.trackRating).join("")
    }
    </p>
    </div>`;
  }

  generateStars(rating) {
    const nbrRating = Math.round(Number(rating) * 2);
    const markUp = [];
    for (let i = 1; i <= nbrRating; i++) {
      markUp.push(`<i class="fas fa-star"></i>`);
    }
    for (let i = nbrRating; i < 10; i++) {
      markUp.push(`<i class="far fa-star"></i>`);
    }
    return markUp;
  }
}

export default new TrackView();
