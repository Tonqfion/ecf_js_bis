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
export const searchResults = [];
