const API_BASE = "/api/now-playing";
const IMAGE_BASE = "https://image.tmdb.org/t/p/";

const movieGrid = document.querySelector("#movie-grid");
const statusMessage = document.querySelector("#status-message");
const searchInput = document.querySelector("#search-input");
const heroTitle = document.querySelector("#hero-title");
const heroOverview = document.querySelector("#hero-overview");
const heroBackdrop = document.querySelector("#hero-backdrop");

let movies = [];

function imageUrl(path, size) {
  return path ? `${IMAGE_BASE}${size}${path}` : "";
}

function formatDate(date) {
  if (!date) return "개봉일 미정";
  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return "개봉일 미정";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
  }).format(parsedDate);
}

function renderMovies(items) {
  movieGrid.replaceChildren();

  if (items.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "empty-state";
    emptyMessage.textContent = movies.length
      ? "검색 결과가 없습니다. 다른 제목을 입력해 보세요."
      : "표시할 영화가 없습니다.";
    movieGrid.append(emptyMessage);
    return;
  }

  const fragment = document.createDocumentFragment();

  for (const movie of items) {
    const card = document.createElement("article");
    card.className = "movie-card";

    const posterWrap = document.createElement("div");
    posterWrap.className = "poster-wrap";

    const poster = document.createElement("img");
    poster.src = imageUrl(movie.poster_path, "w500");
    poster.alt = `${movie.title} 포스터`;
    poster.loading = "lazy";
    poster.decoding = "async";
    poster.addEventListener(
      "error",
      () => {
        poster.hidden = true;
      },
      { once: true },
    );

    const rating = document.createElement("span");
    rating.className = "rating";
    rating.textContent = `★ ${Number(movie.vote_average || 0).toFixed(1)}`;

    const title = document.createElement("h3");
    title.className = "movie-title";
    title.textContent = movie.title || "제목 미정";
    title.title = movie.title || "";

    const date = document.createElement("p");
    date.className = "movie-meta";
    date.textContent = formatDate(movie.release_date);

    posterWrap.append(poster, rating);
    card.append(posterWrap, title, date);
    fragment.append(card);
  }

  movieGrid.append(fragment);
}

function updateHero(movie) {
  if (!movie) return;

  heroTitle.textContent = movie.title || "현재 상영작";
  heroOverview.textContent =
    movie.overview || "지금 극장에서 상영 중인 영화입니다. 자세한 정보는 TMDB에서 확인해 보세요.";

  if (movie.backdrop_path) {
    const backdrop = imageUrl(movie.backdrop_path, "original");
    const image = new Image();
    image.onload = () => {
      heroBackdrop.style.backgroundImage = `url("${backdrop}")`;
      heroBackdrop.classList.add("ready");
    };
    image.src = backdrop;
  }
}

async function fetchNowPlaying() {
  statusMessage.classList.remove("error");
  statusMessage.textContent = "영화 정보를 불러오고 있어요...";

  try {
    const pages = await Promise.all(
      [1, 2, 3].map(async (page) => {
        const response = await fetch(`${API_BASE}?page=${page}`);

        if (!response.ok) {
          throw new Error(`영화 정보 요청 실패 (${response.status})`);
        }

        return response.json();
      }),
    );

    movies = pages.flatMap((page) => page.results || []);
    movies = movies.filter((movie) => movie.poster_path);
    statusMessage.textContent = movies.length
      ? `대한민국 현재 상영작 ${movies.length}편`
      : "현재 상영 중인 영화를 찾을 수 없습니다.";
    updateHero(movies[0]);
    renderMovies(movies);
  } catch (error) {
    console.error("현재 상영작을 불러오지 못했습니다:", error);
    statusMessage.classList.add("error");
    statusMessage.textContent =
      "영화 정보를 불러오지 못했습니다. Vercel 배포 설정과 네트워크 연결을 확인한 뒤 새로고침해 주세요.";
    movieGrid.replaceChildren();
    heroTitle.textContent = "영화 정보를 불러오지 못했어요";
    heroOverview.textContent = "잠시 후 다시 시도해 주세요.";
  }
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLocaleLowerCase("ko");
  const filteredMovies = movies.filter((movie) =>
    (movie.title || "").toLocaleLowerCase("ko").includes(query),
  );
  renderMovies(filteredMovies);
});

document.querySelector("#scroll-left").addEventListener("click", () => {
  movieGrid.scrollBy({ left: -movieGrid.clientWidth * 0.8, behavior: "smooth" });
});

document.querySelector("#scroll-right").addEventListener("click", () => {
  movieGrid.scrollBy({ left: movieGrid.clientWidth * 0.8, behavior: "smooth" });
});

fetchNowPlaying();
