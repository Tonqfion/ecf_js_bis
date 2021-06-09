class CoverView {
  parentElement = document.getElementById("covers-content");
  data;
  renderCovers(data) {
    this.data = data;
    let markup;
    if (data.length > 0) {
      markup = this.generateMarkup();
    } else {
      markup = this.generateError();
    }
    this.clear();
    this.parentElement.insertAdjacentHTML("beforeend", markup);
  }

  generateError() {
    return `      
    <h2 class="mt-16 text-3xl leading-6 font-medium text-gray-900" id="modal-title">
    No images for any of this track release.
  </h2>`;
  }

  generateMarkup() {
    return `      
    <h2 class="mt-16 text-3xl leading-6 font-medium text-gray-900" id="modal-title">
    Cover arts
  </h2>
  <div class="flex flex-row flex-wrap">
  ${this.data.map((url) => `<div class="w-24"><img src=${url}></div>`).join("")}
</div>
      `;
  }

  clear() {
    this.parentElement.innerHTML = "";
  }

  renderSpinner() {
    const markup = `<div class="mx-auto flex-col justify-center	items-center"><svg
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
