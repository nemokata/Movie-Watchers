// Hardcoded API key
const apiKey = "c3c3f653";

// Function to initiate screen and set up session
function startScreen() {
    sessionStorage.setItem('omdbApiKey', apiKey);

    // Check if 'topContainer' already exists before creating it
    let topContainer = document.getElementById("topContainer");
    if (!topContainer) {
        topContainer = document.createElement("div");
        topContainer.id = "topContainer";
        document.body.appendChild(topContainer);
    }

    // Check if 'resultContainer' already exists before creating it
    let resultContainer = document.getElementById("resultContainer");
    if (!resultContainer) {
        resultContainer = document.createElement("div");
        resultContainer.id = "resultContainer";
        document.body.appendChild(resultContainer);
    }

    // Adding logo and search bar to 'topContainer'
    const img = document.createElement("img");
    img.src = "image/Logo.png";
    img.style.width = "10%";
    img.style.margin = "5px";
    topContainer.appendChild(img);

    const searchArea = document.createElement("div");
    searchArea.id = "searchArea";
    topContainer.appendChild(searchArea);

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search for movies or series...";
    searchInput.id = "searchInput";
    searchInput.oninput = () => searchOMDb(searchInput.value, true);
    searchArea.appendChild(searchInput);

    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.id = "suggestionsContainer";
    suggestionsContainer.className = "suggestions-container";
    searchArea.appendChild(suggestionsContainer);

    // Handle Enter key for search
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchOMDb(query);
            }
        }
    });

    // Handle input for auto-suggestions
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        if (query) {
            searchOMDb(query, true);
        } else {
            displaySuggestions([]); // Clear suggestions if input is empty
        }
    });

    loadTopMovies();
    loadTopSeries();
}

// Call startScreen only once on DOMContentLoaded
document.addEventListener("DOMContentLoaded", startScreen);

// Toggle dark mode function
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
}

// OMDb Search Function
function searchOMDb(query, showSuggestions = false) {
    const apiKey = sessionStorage.getItem('omdbApiKey');
    const apiUrl = `http://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(query)}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (showSuggestions) {
                displaySuggestions(data.Search || []);
                return;
            }

            const resultContainer = document.getElementById("resultContainer");
            resultContainer.innerHTML = "";

            if (data.Search && data.Search.length > 0) {
                data.Search.slice(0, 8).forEach(movie => {
                    const imdbID = movie.imdbID;
                    fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`)
                        .then(response => response.json())
                        .then(movieData => {
                            const resultImage = document.createElement("img");
                            resultImage.src = movieData.Poster;
                            resultImage.classList.add("movie-poster");
                            resultImage.onclick = () => toggleMovieDetails(movieData);
                            resultContainer.appendChild(resultImage);
                        })
                        .catch(error => console.error('Error fetching movie details:', error));
                });
            }
        })
        .catch(error => console.error('Error fetching search results:', error));
}

// Display movie suggestions
function displaySuggestions(suggestions) {
    const suggestionsContainer = document.getElementById("suggestionsContainer");
    suggestionsContainer.innerHTML = "";

    suggestions.forEach(movie => {
        const suggestionItem = document.createElement("div");
        suggestionItem.className = "suggestion-item";
        suggestionItem.textContent = movie.Title;
        suggestionItem.onclick = () => {
            document.getElementById("searchInput").value = movie.Title;
            searchOMDb(movie.Title);
            suggestionsContainer.innerHTML = "";
        };
        suggestionsContainer.appendChild(suggestionItem);
    });
}

// Toggle Movie Details Display in a Modal with Transition
function toggleMovieDetails(movieData) {
    const existingModal = document.getElementById('detailsContainer');
    if (existingModal) {
        existingModal.remove();
    }

    const detailsContainer = document.createElement('div');
    detailsContainer.id = 'detailsContainer';
    detailsContainer.innerHTML = `
        <img src="${movieData.Poster}" alt="${movieData.Title}">
        <h2>${movieData.Title}</h2>
        <p><strong>Year:</strong> ${movieData.Year}</p>
        <p><strong>Rated:</strong> ${movieData.Rated}</p>
        <p><strong>Released:</strong> ${movieData.Released}</p>
        <p><strong>Plot:</strong> ${movieData.Plot}</p>
        <button onclick="document.getElementById('detailsContainer').remove();">Close</button>
    `;
    document.body.appendChild(detailsContainer);

    // Trigger animation by adding the 'show' class
    setTimeout(() => {
        detailsContainer.classList.add('show');
    }, 10);
}

// Function to load top-rated movies and display in podium and list format
async function loadTopMovies() {
    const apiKey = sessionStorage.getItem('omdbApiKey'); // Use stored API key
    const topMoviesPodium = document.getElementById("topMoviesPodium");
    const topMoviesList = document.getElementById("topMoviesList");
    topMoviesPodium.innerHTML = "";
    topMoviesList.innerHTML = "";

    let movies = [];
    const searchQueries = "abcdefghijklmnopqrstuvwxyz".split(""); // A-Z searches
    const maxPages = 2; // Limit the pages to avoid too many requests

    // Fetch movies for each search query
    for (const char of searchQueries) {
        for (let page = 1; page <= maxPages; page++) {
            const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${char}&type=movie&page=${page}`);
            const data = await response.json();

            if (data.Search) {
                movies = movies.concat(data.Search);
            }
        }
    }

    // Fetch detailed data and filter by IMDb rating
    const detailedMovies = [];
    for (const movie of movies) {
        const movieResponse = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`);
        const movieDetails = await movieResponse.json();

        if (movieDetails.imdbRating && parseFloat(movieDetails.imdbRating) >= 8) {
            detailedMovies.push(movieDetails);
        }
    }

    // Sort movies by IMDb rating in descending order
    detailedMovies.sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));

    // Display top 3 movies on the podium
    const podiumMovies = detailedMovies.slice(0, 3);
    podiumMovies.forEach((movie, index) => {
        const podiumItem = document.createElement("div");
        podiumItem.className = `podium-place podium-place-${index + 1}`;
        podiumItem.innerHTML = `
            <img src="${movie.Poster}" alt="${movie.Title}">
            <p>${index + 1} - ${movie.Title} (${movie.imdbRating})</p>
        `;
        topMoviesPodium.appendChild(podiumItem);
    });

    // Display remaining movies as a list
    const listMovies = detailedMovies.slice(3, 10); // Top 4 to 10
    listMovies.forEach((movie, index) => {
        const listItem = document.createElement("div");
        listItem.className = "list-item";
        listItem.innerHTML = `<span>#${index + 4}</span> ${movie.Title} (${movie.imdbRating})`;
        topMoviesList.appendChild(listItem);
    });
}



// Function to load top-rated series and display in podium and list format
async function loadTopSeries() {
    const topSeriesPodium = document.getElementById("topSeriesPodium");
    const topSeriesList = document.getElementById("topSeriesList");
    topSeriesPodium.innerHTML = "";
    topSeriesList.innerHTML = "";

    let series = [];
    let page = 1;
    const maxPages = 5; // Adjust as needed; OMDb returns 10 results per page

    while (page <= maxPages) {
        const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=series&page=${page}`);
        const data = await response.json();

        if (data.Search) {
            series = series.concat(data.Search);
        } else {
            break;
        }
        page++;
    }

    const highRatedSeries = [];
    for (const item of series) {
        const seriesDetailsResponse = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&i=${item.imdbID}`);
        const seriesData = await seriesDetailsResponse.json();

        if (seriesData.imdbRating && parseFloat(seriesData.imdbRating) >= 8) {
            highRatedSeries.push(seriesData);
        }

        if (highRatedSeries.length >= 10) break; // Stop once we have the top 10 series
    }

    // Display top 3 series on the podium
    const podiumSeries = highRatedSeries.slice(0, 3);
    podiumSeries.forEach((series, index) => {
        const podiumItem = document.createElement("div");
        podiumItem.className = `podium-place podium-place-${index + 1}`;
        podiumItem.innerHTML = `
            <img src="${series.Poster}" alt="${series.Title}">
            <p>${index + 1} - ${series.Title} (${series.imdbRating})</p>
        `;
        topSeriesPodium.appendChild(podiumItem);
    });

    // Display remaining series as a list
    const listSeries = highRatedSeries.slice(3, 10);
    listSeries.forEach((series, index) => {
        const listItem = document.createElement("div");
        listItem.className = "list-item";
        listItem.innerHTML = `<span>#${index + 4}</span> ${series.Title} (${series.imdbRating})`;
        topSeriesList.appendChild(listItem);
    });
}

document.getElementById('topMoviesButton').addEventListener('click', () => {
    loadTopMovies();
});

