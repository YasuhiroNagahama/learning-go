window.onload = function () {
  const pageId = "1";

  renderPageData(pageId);
};

async function getTotalPages() {
  try {
    const response = await fetch("http://localhost:8000/api/total_pages");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching total pages:", error);
    return 0;
  }
}

async function getPageData(pageId) {
  try {
    fetch(`http://localhost:8000/api/movies?page=${pageId}`)
      .then((response) => response.json())
      .then((data) => {
        return data;
      });
  } catch (error) {
    console.error("Error:", error);
  }
}

function getMovieInfoUrl(id, originalTitle) {
  const formattedTitle = originalTitle.toLowerCase().replaceAll(" ", "-");

  return `https://www.themoviedb.org/movie/${id}-${formattedTitle}?language=ja`;
}

function getMovieImage(path) {
  return `https://image.tmdb.org/t/p/w300${path}`;
}

function getMovieElement(movie) {
  const movieInfoUrl = getMovieInfoUrl(movie.id, movie.original_title);
  const movieImageUrl = getMovieImage(movie.poster_path);

  return `<li class="movie-item">
    <a href="${movieInfoUrl}" class="movie-info-url" target="_blank">
      <div class="movie-elements-wrapper">
        <div class="movie-image-wrapper">
          <img src="${movieImageUrl}" alt="${movie.title}" class="movie-image">
        </div>
        <div class="movie-title-wrapper">
          <p class="movie-title">${movie.title}</p>
        </div>
        <div class="movie-release-date-wrapper">
          <p class="movie-release-date">${movie.release_date}</p>
        </div>
      </div>
    </a>
  </li>`;
}

function getPageButtonElement(pageNumber) {
  const page = String(pageNumber);

  return `<div class="page-button-wrapper" id="${page}">
            <button class="page-button">${page}</button>
          </div>`;
}

function getNextButton() {
  return `<button class="move-button next-button">></button>`;
}

function getBackButton() {
  return `<button class="move-button next-button"><</button>`;
}

async function createPagination() {
  const totalPages = await getTotalPages(); // すべてのページを取得
  const maxButtons = 10; // ボタンの最大数を定義

  const startPage = 1;
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);

  // ページネーションを初回描画
  renderPagination(startPage, endPage);
  paginationHandler();

  renderBackButton();
  renderNextButton();
  moveButtonHandler(startPage, endPage, totalPages, maxButtons);
}

// レンダー

async function renderPageData(pageId) {
  const pageData = await getPageData(pageId);

  const list = document.getElementById("moviesList");
  list.innerHTML = ``;
  pageData.forEach((movie) => {
    list.innerHTML += getMovieElement(movie);
  });
}

function renderPagination(startPage, endPage) {
  const paginationWrapper = document.getElementById("pagination");
  paginationWrapper.innerHTML = "";

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = getPageButtonElement(i);
    paginationWrapper.innerHTML += pageButton;
  }
}

function renderNextButton() {
  const nextButtonWrapper = document.getElementById("nextButton");
  const nextButton = getNextButton();

  nextButtonWrapper.innerHTML = nextButton;
}

function renderBackButton() {
  const backButtonWrapper = document.getElementById("backButton");
  const backButton = getBackButton();

  backButtonWrapper.innerHTML = backButton;
}

// ハンドラー

async function searchButtonHandler() {
  const searchButton = document.getElementById("searchButton");

  searchButton.addEventListener("click", async () => {
    const searchBox = document.getElementById("searchBox");
    const searchContent = searchBox.value.toLowerCase();
    const totalPages = await getTotalPages();

    const searchList = document.getElementById("searchList");
    searchList.innerHTML = ``;

    try {
      for (let i = 1; i <= totalPages; i++) {
        const pageNumber = String(i);
        const pageData = await getPageData(i);

        pageData.forEach((movie) => {
          const formattedTitle = movie.title.toLowerCase();

          if (formattedTitle.includes(searchContent)) {
            searchList.innerHTML += getMovieElement(movie);
            console.log(
              "タイトル:" + movie.title + ", " + "ページ:" + pageNumber
            );
          }
        });
      }
    } catch (error) {
      console.error("Error fetching search:", error);
      return 0;
    }
  });
}

function paginationHandler() {
  const pageButtonWrappers = document.querySelectorAll(".page-button-wrapper");

  for (let i = 0; i < pageButtonWrappers.length; i++) {
    const pageButtonWrapper = pageButtonWrappers[i];

    pageButtonWrapper.addEventListener("click", () => {
      const pageId = pageButtonWrapper.id;

      renderPageData(pageId);
    });
  }
}

function moveButtonHandler(start, end, totalPages, maxButtons) {
  let startPage = start;
  let endPage = end;

  const backButtonWrapper = document.getElementById("backButton");
  const nextButtonWrapper = document.getElementById("nextButton");

  backButtonWrapper.addEventListener("click", () => {
    if (startPage > 1) {
      endPage = startPage - 1;
      startPage = Math.max(1, endPage - maxButtons + 1);
      renderPagination(startPage, endPage);
      paginationHandler();
    } else {
      console.log("最初のページです。");
    }
  });

  nextButtonWrapper.addEventListener("click", () => {
    if (endPage < totalPages) {
      startPage = endPage + 1;
      endPage = Math.min(totalPages, startPage + maxButtons - 1);
      renderPagination(startPage, endPage);
      paginationHandler();
    } else {
      console.log("最後のページです。");
    }
  });
}

createPagination();
searchButtonHandler();
console.log(1);
