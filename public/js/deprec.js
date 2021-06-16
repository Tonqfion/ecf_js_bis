/*        .reduce((accumulator, currentValue, currentIndex, sourceArray) => {
          if (!accumulator.find((a) => a.title === currentValue.title)) {
            accumulator.push(currentValue);
          }

          return accumulator;
        }, []),

      trackReleasesCleanTwo: releasesReduced,


Première méthode pour "nettoyer" les releases
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


Promise.all(
  details.coverUrlArray.map((url) => fetch(url).then((res) => res.json()))
)
  .then((results) => {
    console.log(results);
    results.forEach((release) => {
      release.images.forEach((image) => {
        details.renderCoverArray.push({
          thumbnailUrl: image.thumbnails.small,
          originalUrl: image.image,
        });
      });
      // use results here
    });
    CoverView.render;
    console.log(details.renderCoverArray);
    CoverView.renderCovers(details.renderCoverArray);
  })
  .catch(console.log("error"));


const unqReleaseCoversUrl = async function (mbid) {
  try {
    const coverData = await GET_JSON(
      encodeURI(`${CONSTANTS.COVER_API_URL}${mbid}`)
    );
    console.log(coverData.images);
    coverData.images.forEach((image) => {
      image.thumbnails.large
        ? details.coverUrlArray.push({
            thumbnailUrl: image.thumbnails.small,
            originalUrl: image.image,
          })
        : null;
    });
  } catch (err) {
    throw err;
  }
};

export const fetchCovers = async function (urlArray) {
  Promise.all(urlArray.map((url) => fetch(url).then((res) => res.json())))
    .then((results) => {
      console.log(results);
      results.forEach((release) => {
        release.images.forEach((image) => {
          details.renderCoverArray.push({
            thumbnailUrl: image.thumbnails.small,
            originalUrl: image.image,
          });
        });
        // use results here
      });
      console.log(details.renderCoverArray);
      CoverView.renderCovers(details.renderCoverArray);
    })
    .catch(console.log("error"));
};


    details.trackDetails.trackReleasesIdArray.forEach((id) => {
      unqReleaseCoversUrl(id);
    });
   
    CoverView.renderCovers(details.coverUrlArray);
    console.log(details.coverUrlArray);



    details.coverUrlArray.forEach(async function (url) {
      try {
        const uniqueRelease = await GET_JSON(url);
        console.log(uniqueRelease);
      } catch (err) {
        console.log(err);
      }
    });

    .catch(function (err) {
      console.log("A promised failed to resolve ...", err);
      return details.coverUrlArray.map((url) =>
        fetch(url).then((res) => res.json())
      );
    })

*/
// Test controlCovers
/*
const controlCovers = async function (trackID) {
  try {
    CoverView.renderSpinner();

    await detailsModel.loadCovers(trackID);

    CoverView.renderCovers(detailsModel.details.coverUrlArray);
  } catch (err) {
    console.log(err);
  }
};*/

/*
    const trackDetailsBtn = document.querySelectorAll(".view-track-details");
    trackDetailsBtn.forEach(function (trackDetailBtn) {
      trackDetailBtn.addEventListener("click", function () {
        const trackToShow = trackDetailBtn.id;
        controlTrackDetail(trackToShow);
      });
    });

    const artistDetailsBtn = document.querySelectorAll(".view-artist-details");
    artistDetailsBtn.forEach(function (artistDetailsBtn) {
      artistDetailsBtn.addEventListener("click", function () {
        const artistToShow = artistDetailsBtn.id;
        controlArtistDetail(artistToShow);
      });
    });
    

    const artistDetailsBtn = document.querySelectorAll(".view-artist-details");
    artistDetailsBtn.forEach(function (artistDetailsBtn) {
      artistDetailsBtn.addEventListener("click", function () {
        const artistToShow = artistDetailsBtn.id;
        controlArtistDetail(artistToShow);
      });
    });
*/
