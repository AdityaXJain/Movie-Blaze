const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const YOUTUBE_SEARCH_URL = "https://www.youtube.com/results?search_query=";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

const showLoading = () => {
  main.innerHTML = '<div class="loading">Loading...</div>';
};

const getClassByRate = (vote) => {
  if (vote >= 8) return "green";
  else if (vote >= 7) return "lime";
  else if (vote >= 5) return "orange";
  else if (vote >= 3) return "red";
  else return "dark-red";
};

const showMovies = async (movies) => {
  if (!movies.length) {
    main.innerHTML = '<div class="no-results">No movies found</div>';
    return;
  }

  main.innerHTML = "";
  movies.forEach(async (movie) => {
    const { title, poster_path, vote_average, overview, id, release_date } = movie;
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie");

    const posterUrl = poster_path 
      ? IMG_PATH + poster_path 
      : 'placeholder-image.jpg';

    let movieDetails;
    try {
      movieDetails = await getMovieDetails(id);
    } catch (error) {
      console.error(`Error fetching details for ${title}:`, error);
      movieDetails = { providers: [] };
    }

    const trailerUrl = YOUTUBE_SEARCH_URL + encodeURIComponent(`${title} trailer`);
    const ottLinks = movieDetails.providers.map(provider => 
      `<p>${provider.link} ${provider.name}</p>`).join(" ");

    movieElement.innerHTML = `
    <img
      src="${posterUrl}"
      alt="${title}"
    />
    <div class="movie-info">
      <h3>${title}</h3>
      <span class="${getClassByRate(vote_average)}">⭐${vote_average.toFixed(1)}</span>
    </div>
    <div class="overview">
      <h3>Overview</h3>
      ${overview}
      <p><strong>Release Year:</strong> ${release_date.split("-")[0]}</p>
      <p><strong>Available on:</strong> ${ottLinks || "Not Available"}</p>
      <button class="trailer-btn" onclick="window.open('${trailerUrl}', '_blank')">Watch Trailer</button>
    </div>
  `;
    main.appendChild(movieElement);
  });
};

const getMovieDetails = async (movieId) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=watch/providers`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();

    const providers = (data['watch/providers']?.results?.IN?.flatrate || [])
      .map(provider => ({
        name: provider.provider_name,
        link: provider.provider_link || "#"
      }));

    return { providers };
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error);
    return { providers: [] };
  }
};

const getMovies = async (url) => {
  try {
    showLoading();
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    showMovies(data.results);
  } catch (error) {
    console.error('Error fetching movies:', error);
    main.innerHTML = '<div class="error">Failed to load movies. Please try again later.</div>';
  }
};

getMovies(API_URL);

let searchTimeout;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value.trim();
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (searchTerm) {
      getMovies(SEARCH_API + encodeURIComponent(searchTerm));
      search.value = "";
    } else {
      getMovies(API_URL);
    }
  }, 300);
});
