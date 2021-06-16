import { CONSTANTS } from "../config.js";
import { CONVERT_MILLIS_TO_MINS_SECONDS } from "../helpers.js";
import { GET_JSON } from "../helpers.js";
import { REMOVEDUPLICATES } from "../helpers.js";
import CoverView from "../view/coverView.js";
/*
https://musicbrainz.org/ws/2/recording/738920d3-c6e6-41c7-b504-57761bb625fd?inc=genres+artists+ratings+releases&fmt=json
loadTrackDetail("738920d3-c6e6-41c7-b504-57761bb625fd");
*/
export const details = {
  trackDetails: {},
  coverUrlArray: [],
  renderCoverArray: [],
  artistDetails: {},
};

export const loadTrackDetail = async function (id) {
  try {
    const trackData = await GET_JSON(
      encodeURI(
        `${CONSTANTS.API_URL}recording/${id}?inc=genres+artists+ratings+releases&fmt=json`
      )
    );
    details.coverUrlArray = [];
    details.renderCoverArray = [];
    details.trackDetails = {
      trackTitle:
        trackData.title ??
        `<span class="italic text-red-800">No title provided</span>`,
      trackID: trackData.id,
      trackReleaseDate:
        trackData["first-release-date"] ??
        `<span class="italic text-red-800">No date provided</span>`,
      trackLength: trackData.length
        ? CONVERT_MILLIS_TO_MINS_SECONDS(trackData.length)
        : `<span class="italic text-red-800">No duration provided</span>`,
      trackArtists: trackData["artist-credit"].length
        ? trackData["artist-credit"].map((artist) => artist.name).join(" / ")
        : `<span class="italic text-red-800">No information on artist</span>`,
      trackReleasesDisplay: trackData["releases"].length
        ? REMOVEDUPLICATES(
            trackData["releases"].map((release) => release.title)
          ).join(" / ")
        : `<span class="italic text-red-800">No information on releases</span>`,
      trackReleasesIdArray: trackData["releases"].length
        ? trackData["releases"].map((release) => release.id)
        : "no-release",
      trackGenres: trackData["genres"].length
        ? trackData["genres"].map((genre) => genre.name).join(" / ")
        : `<span class="italic text-red-800">No information on genres</span>`,
      trackRating: trackData.rating.value
        ? Math.round(Number(trackData.rating.value))
        : '<span class="italic text-red-800">No rating yet for this track</span>',
    };

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

//http://musicbrainz.org/ws/2/artist/f27ec8db-af05-4f36-916e-3d57f91ecf5e?inc=releases&fmt=json
export const loadArtistDetail = async function (id) {
  try {
    const artistData = await GET_JSON(
      encodeURI(`${CONSTANTS.API_URL}artist/${id}?inc=releases&fmt=json`)
    );
    let endDate = "";
    if (
      artistData["life-span"].endded == "true" &&
      artistData["life-span"].end
    ) {
      endDate = artistData["life-span"].end;
    } else if (
      artistData["life-span"].endded == "true" &&
      artistData["life-span"].end == null
    ) {
      endDate = "not-active";
    } else {
      endDate = "no-info";
    }

    details.artistDetails = {
      artistName: artistData.name ?? "No Name found",
      artistID: artistData.id,
      artistStartDate: artistData["life-span"].begin ?? "No date provided",
      artistEndDate: endDate,
      artistArea: artistData.area.name ?? "No info on area",
    };

    /*
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
    */
  } catch (err) {
    throw err;
  }
};
