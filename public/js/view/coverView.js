import View from "./view.js";

class CoverView extends View {
  parentElement = document.getElementById("covers-content");
  renderCovers(data) {
    this.data = data;
    let markup;
    if (data.length > 0 && Array.isArray(data)) {
      markup = this.generateMarkup();
    } else if (data.length == 0 && Array.isArray(data)) {
      markup = this.generateError();
    } else {
      markup = this.generateErrorNoInfo();
    }
    this.clear();
    this.parentElement.insertAdjacentHTML("beforeend", markup);
  }

  generateErrorNoInfo() {
    return `      
    <h2 class="mt-16 text-3xl leading-6 font-medium text-gray-900" id="modal-title mb-4">
    No release were found. Cover arts could not be loaded
  </h2>`;
  }

  generateError() {
    return `      
    <h2 class="mt-16 text-3xl leading-6 font-medium text-gray-900" id="modal-title mb-4">
    No image were found for any of this track releases
  </h2>`;
  }

  generateMarkup() {
    return `      
    <h2 class="mt-16 text-3xl leading-6 font-medium text-gray-900" id="modal-title mb-4">
    Cover arts
  </h2>      
  <h3 class="text-2xl leading-6 font-medium text-gray-600 mb-8" id="modal-title">
  Click on a cover to see its full size if available
</h3>
  <div class="flex flex-row flex-wrap max-h-96 overflow-y-scroll">
  ${this.data
    .map(
      (url) =>
        `<div class="m-2 w-36 flex items-center justify-center"><a href="${url.originalUrl}" class="spotlight"><img src=${url.thumbnailUrl} class="shadow-lg rounded max-w-full h-auto border-none"></a></div>`
    )
    .join("")}
</div>
      `;
  }

  renderSpinner() {
    const markup = `
    <h2 class="mt-16 text-3xl leading-6 font-medium text-gray-900 mb-8" id="modal-title">
    Please wait while the software is looking for cover arts
  </h2>
  <div class="mt-16 flex justify-center items-center flex-row flex-wrap overflow-y-auto max-h-96"><svg
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
  </svg>
  </div>`;
    this.clear();
    this.parentElement.insertAdjacentHTML("beforeend", markup);
  }
}

export default new CoverView();
