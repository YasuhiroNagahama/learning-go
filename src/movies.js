window.onload = function () {
  const pageId = "1";

  updateResult(pageId);
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
  </li>`;
}

function getPageButtonElement(pageNumber) {
  const page = String(pageNumber);

  return `<div class="page-button-wrapper" id="${page}">
            <button class="page-button">${page}</button>
          </div>`;
}

function updateResult(pageId) {
  fetch(`http://localhost:8000/api/movies?page=${pageId}`)
    .then((response) => response.json())
    .then((data) => {
      const list = document.getElementById("moviesList");
      list.innerHTML = ``;
      data.forEach((movie) => {
        list.innerHTML += getMovieElement(movie);
      });
    })
    .catch((error) => console.error("Error:", error));
}

async function createPagination() {
  const paginationWrapper = document.getElementById("pagination");
  paginationWrapper.innerHTML = ""; // ページネーションを再描画する前にクリア

  // 総ページ数を取得
  const totalPages = await getTotalPages();

  // 10個のページネーションを作成
  const maxButtons = 10;
  let startPage = 1;
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  const nextButtonWrapper = document.getElementById("nextButton");
  // 「次へ」ボタンを作成
  const nextPageButton = document.createElement("button");
  nextPageButton.classList.add("next-button");
  nextPageButton.textContent = ">";

  nextPageButton.addEventListener("click", () => {
    if (endPage < totalPages) {
      startPage = endPage + 1;
      endPage = Math.min(totalPages, startPage + maxButtons - 1);
      renderPagination(startPage, endPage);
      paginationHandler();
    }
  });

  nextButtonWrapper.appendChild(nextPageButton);

  // ページネーションを初回描画
  renderPagination(startPage, endPage);
  paginationHandler();
}

function renderPagination(startPage, endPage) {
  const paginationWrapper = document.getElementById("pagination");
  paginationWrapper.innerHTML = "";

  for (let i = startPage; i <= endPage; i++) {
    const pageButton = getPageButtonElement(i);
    paginationWrapper.innerHTML += pageButton;
  }
}

// ハンドラー

function searchButtonHandler() {
  const searchButton = document.getElementById("searchButton");

  searchButton.addEventListener("click", async () => {
    const searchBox = document.getElementById("searchBox");
    const inputValue = searchBox.value;
    console.log(inputValue);

    const totalPages = await getTotalPages();

    try {
      for (let i = 1; i <= totalPages; i++) {
        const pageNumber = String(i);

        fetch(`http://localhost:8000/api/movies?page=${pageNumber}`)
          .then((response) => response.json())
          .then((data) => {
            data.forEach((movie) => {
              const title = movie.title;

              // 現在のコードは、inputValueがアルファベットや英語の場合
              // 大文字小文字の区別を区別している => d != D
              if (title.includes(inputValue)) {
                console.log(
                  "タイトル:" + title + ", " + "ページ:" + pageNumber
                );
              }
            });
          })
          .catch((error) => console.error("Error:", error));
      }
    } catch (error) {
      console.error("Error fetching search:", error);
      return 0;
    }
  });
}

function paginationHandler() {
  console.log(1);
  const pageButtonWrappers = document.querySelectorAll(".page-button-wrapper");

  for (let i = 0; i < pageButtonWrappers.length; i++) {
    const pageButtonWrapper = pageButtonWrappers[i];

    pageButtonWrapper.addEventListener("click", () => {
      const pageId = pageButtonWrapper.id;

      updateResult(pageId);
    });
  }
}

createPagination();
searchButtonHandler();
