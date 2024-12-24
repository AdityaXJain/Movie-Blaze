const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const YOUTUBE_SEARCH_URL = "https://www.youtube.com/results?search_query=";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

const getClassByRate = (vote) => {
  if (vote >= 7.5) return "green";
  else if (vote >= 7) return "orange";
  else return "red";
};

const showMovies = (movies) => {
  main.innerHTML = "";
  movies.forEach(async (movie) => {
    const { title, poster_path, vote_average, overview, id, release_date } = movie;
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie");

    // Fetch additional movie details (e.g., streaming platforms, trailer)
    const movieDetails = await getMovieDetails(id);
    const trailerUrl = YOUTUBE_SEARCH_URL + encodeURIComponent(`${title} trailer`);
    const ottLinks = movieDetails.providers.map(provider => 
      `<p>${provider.link} ${provider.name}</p>`).join(" ");

    movieElement.innerHTML = `
    <img
      src="${IMG_PATH + poster_path}"
      alt="${title}"
    />
    <div class="movie-info">
      <h3>${title}</h3>
      <span class="${getClassByRate(vote_average)}">${vote_average}</span>
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

// Fetch movie details including OTT providers and trailer info
const getMovieDetails = async (movieId) => {
  const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=watch/providers`);
  const data = await res.json();
  const providers = (data['watch/providers'].results?.IN?.flatrate || []).map(provider => ({
    name: provider.provider_name,
    link: provider.provider_link || "#"
  }));
  return { providers };
};

const getMovies = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  showMovies(data.results);
};

getMovies(API_URL);

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  if (searchTerm && searchTerm !== "") {
    getMovies(SEARCH_API + searchTerm);
    search.value = "";
  } else {
    history.go(0);
  }
});
