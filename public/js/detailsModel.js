import { CONSTANTS } from "./config.js";
import { CONVERT_MILLIS_TO_MINS_SECONDS } from "./helpers.js";
import { GET_JSON } from "./helpers.js";
import { SHORTEN_STRING } from "./helpers.js";
import { CONSTRUCT_URL_PART } from "./helpers.js";
/*
https://musicbrainz.org/ws/2/recording/738920d3-c6e6-41c7-b504-57761bb625fd?inc=genres+artists+ratings+releases&fmt=json
loadTrackDetail("738920d3-c6e6-41c7-b504-57761bb625fd");
*/
export const details = {
  trackDetails: {},
  artistDetails: {},
  releaseDetails: {},
  coverUrlArray: [],
};

export const loadTrackDetail = async function (id) {
  try {
    const trackData = await GET_JSON(
      encodeURI(
        `${CONSTANTS.API_URL}${id}?inc=genres+artists+ratings+releases&fmt=json`
      )
    );
    details.coverUrlArray = [];
    details.trackDetails = {
      trackTitle: trackData.title ?? "No title provided",
      trackID: trackData.id,
      trackReleaseDate: trackData["first-release-date"] ?? "No date provided",
      trackLength: trackData.length
        ? CONVERT_MILLIS_TO_MINS_SECONDS(trackData.length)
        : "No duration provided",
      trackArtists: trackData["artist-credit"].length
        ? trackData["artist-credit"]
        : "No information on artists",
      trackReleasesBase: trackData["releases"].length
        ? trackData["releases"]
        : "No information on releases",
      trackReleasesIdArray: trackData["releases"].length
        ? trackData["releases"].map((release) => release.id)
        : "No information on releases",
      trackGenres: trackData["genres"].length
        ? trackData["genres"]
        : "No information on genres",
      trackRating: trackData.rating.value ?? "No rating yet",
    };
    details.trackDetails.trackReleasesIdArray.forEach((id) => {
      unqReleaseCoversUrl(id);
    });
    //console.log(details.coverUrlArray);
  } catch (err) {
    throw err;
  }
};

/*

*/

const unqReleaseCoversUrl = async function (mbid) {
  try {
    const coverData = await GET_JSON(
      encodeURI(`${CONSTANTS.COVER_API_URL}${mbid}`)
    );
    console.log(coverData.images);
    coverData.images.forEach((image) => {
      image.thumbnails.large
        ? details.coverUrlArray.push(image.thumbnails.large)
        : null;
    });
  } catch (err) {
    throw err;
  }
};

/*
        .reduce((accumulator, currentValue, currentIndex, sourceArray) => {
          if (!accumulator.find((a) => a.title === currentValue.title)) {
            accumulator.push(currentValue);
          }

          return accumulator;
        }, []),
        */
/*
      trackReleasesCleanTwo: releasesReduced,
      */

/* Première méthode pour "nettoyer" les releases
    const releasesReduced = [];
    const titleNotExist = (title) => {
      return releasesReduced.every((release) => {
        if (release.title === title) return false;
        return true;
      });
    };
    trackData["releases"].forEach((release) => {
      if (titleNotExist(release.title))
        releasesReduced.push({ id: release.id, title: release.title });
    });

    */
