const apiKey = "eb42460cb7msh979dce2f061536ap19bc68jsn947d13a476be";

async function loadTopMovies() {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com',
            'x-rapidapi-key': apiKey
        }
    };

    try {
        const response = await fetch('https://imdb-top-100-movies.p.rapidapi.com/', options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        const topMoviesPodium = document.getElementById("topMoviesPodium");
        const topMoviesList = document.getElementById("topMoviesList");

        topMoviesPodium.innerHTML = "";
        topMoviesList.innerHTML = "";

        // Display top 3 movies on the podium
        const podiumMovies = data.slice(0, 3);
        podiumMovies.forEach((movies, index) => {
            const podiumItem = document.createElement("div");
            podiumItem.className = `podium-place podium-place-${index + 1}`;
            podiumItem.style.height = `${300 - index * 50}px`; // Adjust height dynamically
            podiumItem.innerHTML = `
                <img src="${movies.image || 'default-image.png'}" alt="${movies.title || 'Unknown Title'}" class="poster">
                <p class="title">${index + 1}. ${movies.title || 'Unknown Title'}</p>
            `;
            topMoviesPodium.appendChild(podiumItem);
        });

        // Display remaining movies as a list
        const remainingMovies = data.slice(3);
        remainingMovies.forEach((movies, index) => {
            const listItem = document.createElement("div");
            listItem.className = "list-item";
            listItem.innerHTML = `
                <span>${index + 4}</span>
                <img src="${movies.image || 'default-image.png'}" alt="${movies.title || 'Unknown Title'}" width="50" class="poster">
                <p>${movies.title || 'Unknown Title'}</p>
            `;
            topMoviesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching top movies:', error);
    }
}

document.addEventListener("DOMContentLoaded", loadTopMovies);
