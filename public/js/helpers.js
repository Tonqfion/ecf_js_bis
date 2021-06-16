import { CONSTANTS } from "./config.js";

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const GET_JSON = async function (url) {
  try {
    const res = await Promise.race([
      fetch(url),
      timeout(CONSTANTS.TIMEOUT_SEC),
    ]);
    const data = await res.json();

    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data;
  } catch (err) {
    throw err;
  }
};

export function SHORTEN_STRING(string, maxLength) {
  if (string.length > maxLength) {
    return `${string.substring(0, maxLength - 3)}...`;
  } else {
    return string;
  }
}

export function CONSTRUCT_URL_PART(searchType, query) {
  if (searchType === "artist-opt") {
    return `artist:"${query}" OR artistname:"${query}"`;
  } else if (searchType === "track-opt") {
    return `recording:"${query}"`;
  } else if (searchType === "release-opt") {
    return `release:"${query}"`;
  } else {
    return `${query}`;
  }
}

export function CONVERT_MILLIS_TO_MINS_SECONDS(tracklength) {
  let minutes = Math.floor(tracklength / 60000);
  let seconds = ((tracklength % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

export function INIT() {
  CONSTANTS.SEARCH_FIELD.focus();
  CONSTANTS.MODAL_WINDOW.classList.add("hidden");
  CONSTANTS.PARENT_ELEMENT.innerHTML = "";
  CONSTANTS.SEARCH_FIELD.value = "";
  CONSTANTS.NEW_SEARCH.classList.add("hidden");
  CONSTANTS.RESULT_COUNT_MESSAGE.classList.add("hidden");
  CONSTANTS.RESULT_MESSAGE.innerHTML = `
  <p class="font-bold italic text-center text-blue-800">Start searching...</p>
`;
  CONSTANTS.HEADER.classList.remove("pt-16");
}

export function REMOVEDUPLICATES(array) {
  var prims = { boolean: {}, number: {}, string: {} },
    objs = [];

  return array.filter(function (item) {
    var type = typeof item;
    if (type in prims)
      return prims[type].hasOwnProperty(item)
        ? false
        : (prims[type][item] = true);
    else return objs.indexOf(item) >= 0 ? false : objs.push(item);
  });
}

//below taken from http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
export function GETSCROLLXY() {
  var scrOfX = 0,
    scrOfY = 0;
  if (typeof window.pageYOffset == "number") {
    //Netscape compliant
    scrOfY = window.pageYOffset;
    scrOfX = window.pageXOffset;
  } else if (
    document.body &&
    (document.body.scrollLeft || document.body.scrollTop)
  ) {
    //DOM compliant
    scrOfY = document.body.scrollTop;
    scrOfX = document.body.scrollLeft;
  } else if (
    document.documentElement &&
    (document.documentElement.scrollLeft || document.documentElement.scrollTop)
  ) {
    //IE6 standards compliant mode
    scrOfY = document.documentElement.scrollTop;
    scrOfX = document.documentElement.scrollLeft;
  }
  return [scrOfX, scrOfY];
}

//taken from http://james.padolsey.com/javascript/get-document-height-cross-browser/
export function GETDOCHEIGHT() {
  var D = document;
  return Math.max(
    D.body.scrollHeight,
    D.documentElement.scrollHeight,
    D.body.offsetHeight,
    D.documentElement.offsetHeight,
    D.body.clientHeight,
    D.documentElement.clientHeight
  );
}
