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

document.getElementById('topMoviesButton').addEventListener('click', () => {
    loadTopMovies();
});

