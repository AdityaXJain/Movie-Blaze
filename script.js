const API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c";
const API_URL = `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}&page=1`;
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=`;
const YOUTUBE_SEARCH_URL = "https://www.youtube.com/results?search_query=";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");
const suggestionsList = document.getElementById("suggestions");

const getClassByRate = (vote) => {
  if (vote >= 7.5) return "green";
  else if (vote >= 7) return "orange";
  else return "red";
};

const showMovies = (movies) => {
  main.innerHTML = "";
  movies.forEach((movie) => {
    const { title, poster_path, vote_average, overview } = movie;
    const movieElement = document.createElement("div");
    movieElement.classList.add("movie");

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
    </div>
  `;
    main.appendChild(movieElement);
  });
};

const getMovies = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  showMovies(data.results);
};

const displaySuggestions = (movies) => {
  suggestionsList.innerHTML = "";
  movies.slice(0, 5).forEach((movie) => {
    const suggestionItem = document.createElement("li");
    suggestionItem.textContent = movie.title;
    suggestionItem.addEventListener("click", () => {
      search.value = movie.title; // Autofill search input
      suggestionsList.innerHTML = ""; // Clear suggestions
      getMovies(SEARCH_API + movie.title); // Fetch movie details
    });
    suggestionsList.appendChild(suggestionItem);
  });
};

search.addEventListener("input", async (e) => {
  const query = e.target.value.trim();

  if (query.length > 2) {
    const res = await fetch(SEARCH_API + query);
    const data = await res.json();
    displaySuggestions(data.results);
  } else {
    suggestionsList.innerHTML = ""; // Clear suggestions
  }
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const searchTerm = search.value;
  if (searchTerm && searchTerm !== "") {
    getMovies(SEARCH_API + searchTerm);
    search.value = "";
    suggestionsList.innerHTML = ""; // Clear suggestions
  }
});

getMovies(API_URL);
