// Hardcoded API keys
const omdbApiKey = "c3c3f653"; // OMDb API Key
const youtubeApiKey = "AIzaSyDGFfLTuEF4JI8WE_r-EamorgYoMf6y8wQ"; // Dein YouTube API Key
const watchmodeApiKey = "cCM78ZapODoimlJ0EAgtvX6grxffTEtGBj9BgYZT";

// Function to initiate screen and set up session
function startScreen() {
    sessionStorage.setItem('omdbApiKey', omdbApiKey);

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

// Toggle Movie Details Display in a Modal with Embedded YouTube Trailer
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
        <div id="trailerContainer">Loading trailer...</div>
        <div id="streamingLinksContainer">Loading streaming links...</div>
        <button onclick="document.getElementById('detailsContainer').remove();">Close</button>
    `;
    document.body.appendChild(detailsContainer);

    // Trigger animation by adding the 'show' class
    setTimeout(() => {
        detailsContainer.classList.add('show');
    }, 10);

    // Fetch and embed the YouTube trailer
    fetchTrailerOnYouTube(movieData.Title);

    // Fetch streaming links using Watchmode API
    fetchWatchmodeLinks(movieData.Title);
}
// Function to fetch the YouTube video ID and embed the trailer
function fetchTrailerOnYouTube(title) {
    const trailerContainer = document.getElementById('trailerContainer');
    const query = `${title} official trailer`;
    const youtubeApiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${youtubeApiKey}&type=video&maxResults=1`;

    fetch(youtubeApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const videoId = data.items[0].id.videoId;
                trailerContainer.innerHTML = `
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
                `;
            } else {
                trailerContainer.innerHTML = "<p>Trailer not found.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching trailer:", error);
            trailerContainer.innerHTML = "<p>Error loading trailer.</p>";
        });
}

function fetchWatchmodeLinks(title) {
    const streamingLinksContainer = document.getElementById('streamingLinksContainer');
    const watchmodeApiUrl = `https://api.watchmode.com/v1/search/?apiKey=${watchmodeApiKey}&search_field=name&search_value=${encodeURIComponent(title)}`;

    fetch(watchmodeApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.title_results && data.title_results.length > 0) {
                const titleId = data.title_results[0].id;

                // Fetch details about where to watch
                fetch(`https://api.watchmode.com/v1/title/${titleId}/sources/?apiKey=${watchmodeApiKey}`)
                    .then(response => response.json())
                    .then(sources => {
                        if (sources.length > 0) {
                            streamingLinksContainer.innerHTML = `<h3>Streaming Links:</h3>`;
                            sources.forEach(source => {
                                const link = document.createElement('a');
                                link.href = source.web_url;
                                link.target = "_blank";
                                link.textContent = `${source.name} (${source.type})`;
                                streamingLinksContainer.appendChild(link);
                                streamingLinksContainer.appendChild(document.createElement('br'));
                            });
                        } else {
                            streamingLinksContainer.innerHTML = "<p>No streaming links found.</p>";
                        }
                    })
                    .catch(error => {
                        console.error("Error fetching Watchmode sources:", error);
                        streamingLinksContainer.innerHTML = "<p>Error loading streaming links.</p>";
                    });
            } else {
                streamingLinksContainer.innerHTML = "<p>No results found on Watchmode.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching Watchmode data:", error);
            streamingLinksContainer.innerHTML = "<p>Error fetching data from Watchmode.</p>";
        });
}

document.getElementById('topMoviesButton').addEventListener('click', () => {
    loadTopMovies();
});
