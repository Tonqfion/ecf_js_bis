import { CONSTANTS } from "../config.js";
import { CONVERT_MILLIS_TO_MINS_SECONDS } from "../helpers.js";
import { GET_JSON } from "../helpers.js";
import CoverView from "../view/coverView.js";
import { SHORTEN_STRING } from "../helpers.js";
import { CONSTRUCT_URL_PART } from "../helpers.js";
/*
https://musicbrainz.org/ws/2/recording/738920d3-c6e6-41c7-b504-57761bb625fd?inc=genres+artists+ratings+releases&fmt=json
loadTrackDetail("738920d3-c6e6-41c7-b504-57761bb625fd");
*/
export const details = {
  trackDetails: {},
  artistDetails: {},
  releaseDetails: {},
  coverUrlArray: [],
  renderCoverArray: [],
};

export const loadTrackDetail = async function (id) {
  try {
    const trackData = await GET_JSON(
      encodeURI(
        `${CONSTANTS.API_URL}${id}?inc=genres+artists+ratings+releases&fmt=json`
      )
    );
    details.coverUrlArray = [];
    details.renderCoverArray = [];
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
    console.log(details.trackDetails.trackReleasesIdArray);

    if (Array.isArray(details.trackDetails.trackReleasesIdArray)) {
      details.coverUrlArray = details.trackDetails.trackReleasesIdArray.map(
        (id) => encodeURI(`${CONSTANTS.COVER_API_URL}${id}`)
      );
    }

    if (details.coverUrlArray.length > 0) {
      Promise.allSettled(
        details.coverUrlArray.map((url) => fetch(url).then((res) => res.json()))
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
              details.renderCoverArray.push({
                thumbnailUrl: image.thumbnails.small,
                originalUrl: image.image,
              });
            });
          });
          console.log(details.renderCoverArray);
          CoverView.renderCovers(details.renderCoverArray);
        })
        .catch(function (err) {
          console.log("Woups, tu t'es raté !", err);
        });
    } else {
      CoverView.renderCovers(details.trackDetails.trackReleasesIdArray);
    }
  } catch (err) {
    throw err;
  }
};
