// Function to initiate screen and set up session
function startScreen(apiKey) {
    sessionStorage.setItem('omdbApiKey', apiKey);
    document.getElementById("container").style.display = "none";

    const topContainer = document.createElement("div");
    topContainer.id = "topContainer";
    document.body.appendChild(topContainer);

    const resultContainer = document.createElement("div");
    resultContainer.id = "resultContainer";
    document.body.appendChild(resultContainer);

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
    searchInput.placeholder = "Search for movies...";
    searchInput.id = "searchInput";
    searchInput.oninput = () => searchOMDb(searchInput.value, true);
    searchArea.appendChild(searchInput);

    const searchButton = document.createElement("button");
    searchButton.innerHTML = "Search";
    searchButton.onclick = () => searchOMDb(searchInput.value);
    searchArea.appendChild(searchButton);

    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.id = "suggestionsContainer";
    suggestionsContainer.className = "suggestions-container";
    searchArea.appendChild(suggestionsContainer);

    loadTopMovies();
    loadTopSeries();
}

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
function loadTopMovies() {
    const apiKey = sessionStorage.getItem('omdbApiKey');
    fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=top&type=movie`)
        .then(response => response.json())
        .then(data => {
            const topMoviesPodium = document.getElementById("topMoviesPodium");
            const topMoviesList = document.getElementById("topMoviesList");
            topMoviesPodium.innerHTML = "";
            topMoviesList.innerHTML = "";

            // Display top 3 movies on the podium
            const podiumMovies = data.Search.slice(0, 3);
            podiumMovies.forEach((movie, index) => {
                const podiumItem = document.createElement("div");
                podiumItem.className = `podium-place podium-place-${index + 1}`;
                podiumItem.innerHTML = `
                    <img src="${movie.Poster}" alt="${movie.Title}">
                    <p>${index + 1} - ${movie.Title}</p>
                `;
                topMoviesPodium.appendChild(podiumItem);
            });

            // Display remaining movies as a list
            const listMovies = data.Search.slice(3, 10);  // Top 4 to 10
            listMovies.forEach((movie, index) => {
                const listItem = document.createElement("div");
                listItem.className = "list-item";
                listItem.innerHTML = `<span>#${index + 4}</span> ${movie.Title}`;
                topMoviesList.appendChild(listItem);
            });
        });
}

// Function to load top-rated series and display in podium and list format
function loadTopSeries() {
    const apiKey = sessionStorage.getItem('omdbApiKey');
    fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=chart=toptv`)
        .then(response => response.json())
        .then(data => {
            const topSeriesPodium = document.getElementById("topSeriesPodium");
            const topSeriesList = document.getElementById("topSeriesList");
            topSeriesPodium.innerHTML = "";
            topSeriesList.innerHTML = "";

            // Display top 3 series on the podium
            const podiumSeries = data.Search.slice(0, 3);
            podiumSeries.forEach((series, index) => {
                const podiumItem = document.createElement("div");
                podiumItem.className = `podium-place podium-place-${index + 1}`;
                podiumItem.innerHTML = `
                    <img src="${series.Poster}" alt="${series.Title}">
                    <p>${index + 1} - ${series.Title}</p>
                `;
                topSeriesPodium.appendChild(podiumItem);
            });

            // Display remaining series as a list
            const listSeries = data.Search.slice(3, 10);  // Top 4 to 10
            listSeries.forEach((series, index) => {
                const listItem = document.createElement("div");
                listItem.className = "list-item";
                listItem.innerHTML = `<span>#${index + 4}</span> ${series.Title}`;
                topSeriesList.appendChild(listItem);
            });
        });
}

// Function to display the selected section and hide others
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.add('hidden'); // Hide all sections
    });
    document.getElementById(sectionId).classList.remove('hidden'); // Show the selected section

    // Optional: Load content if needed for Top Movies or Top Series
    if (sectionId === 'top-movies') {
        loadTopMovies();
    } else if (sectionId === 'top-series') {
        loadTopSeries();
    }
}
