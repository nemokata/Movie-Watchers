const apiKey = "d7ce459cfemshf5f63fb82b614b2p1dcb16jsn675ce7ce534d";

async function loadTopSeries() {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com/series',  // Change this if the host for series is different
            'x-rapidapi-key': apiKey
        }
    };

    try {
        const response = await fetch('https://imdb-top-100-movies.p.rapidapi.com/series', options);  // Replace with series-specific endpoint if available
        const data = await response.json();

        const topSeriesPodium = document.getElementById("topSeriesPodium");
        const topSeriesList = document.getElementById("topSeriesList");

        topSeriesPodium.innerHTML = "";
        topSeriesList.innerHTML = "";

        // Display top 3 series on the podium
        const podiumSeries = data.slice(0, 3);
        podiumSeries.forEach((series, index) => {
            const podiumItem = document.createElement("div");
            podiumItem.className = `podium-place podium-place-${index + 1}`;
            podiumItem.innerHTML = `
                <img src="${series.image}" alt="${series.title}">
                <p>${index + 1} - ${series.title}</p>
            `;
            topSeriesPodium.appendChild(podiumItem);
        });

        // Display remaining series as a list
        const listSeries = data.slice(3, 10); // Top 4 to 10
        listSeries.forEach((series, index) => {
            const listItem = document.createElement("div");
            listItem.className = "list-item";
            listItem.innerHTML = `<span>#${index + 4}</span> ${series.title}`;
            topSeriesList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error fetching top series:', error);
    }
}

document.addEventListener("DOMContentLoaded", loadTopSeries);
