const apiKey = "d7ce459cfemshf5f63fb82b614b2p1dcb16jsn675ce7ce534d";

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
        const data = await response.json();

        const topMoviesPodium = document.getElementById("topMoviesPodium");
        const topMoviesList = document.getElementById("topMoviesList");

        topMoviesPodium.innerHTML = "";
        topMoviesList.innerHTML = "";

        // Display top 3 movies on the podium
        const podiumMovies = data.slice(0, 3);
        podiumMovies.forEach((movie, index) => {
            const podiumItem = document.createElement("div");
            podiumItem.className = `podium-place podium-place-${index + 1}`;
            podiumItem.innerHTML = `
                <img src="${movie.image}" alt="${movie.title}">
                <p>${index + 1} - ${movie.title}</p>
            `;
            topMoviesPodium.appendChild(podiumItem);
        });

        // Display remaining movies as a list
        const listMovies = data.slice(3, 10); // Top 4 to 10
        listMovies.forEach((movie, index) => {
            const listItem = document.createElement("div");
            listItem.className = "list-item";
            listItem.innerHTML = `<span>#${index + 4}</span> ${movie.title}`;
            topMoviesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching top movies:', error);
    }
}

document.addEventListener("DOMContentLoaded", loadTopMovies);
