const apiKey = "eb42460cb7msh979dce2f061536ap19bc68jsn947d13a476be";

async function loadTopSeries() {
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'imdb-top-100-movies.p.rapidapi.com',
            'x-rapidapi-key': apiKey
        }
    };

    try {
        const response = await fetch('https://imdb-top-100-movies.p.rapidapi.com/series', options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        const topSeriesPodium = document.getElementById("topSeriesPodium");
        const topSeriesList = document.getElementById("topSeriesList");

        // Clear existing content
        topSeriesPodium.innerHTML = "";
        topSeriesList.innerHTML = "";

        // Display top 3 series on the podium
        const podiumSeries = data.slice(0, 3);
        podiumSeries.forEach((series, index) => {
            const podiumItem = document.createElement("div");
            podiumItem.className = `podium-place podium-place-${index + 1}`;
            podiumItem.style.height = `${300 - index * 50}px`; // Adjust height dynamically
            podiumItem.innerHTML = `
                <img src="${series.image || 'default-image.png'}" alt="${series.title || 'Unknown Title'}" class="poster">
                <p class="title">${index + 1}. ${series.title || 'Unknown Title'}</p>
            `;
            topSeriesPodium.appendChild(podiumItem);
        });

        // Display remaining series in the list
        const remainingSeries = data.slice(3);
        remainingSeries.forEach((series, index) => {
            const listItem = document.createElement("div");
            listItem.className = "list-item";
            listItem.innerHTML = `
                <span>${index + 4}</span>
                <img src="${series.image || 'default-image.png'}" alt="${series.title || 'Unknown Title'}" width="50" class="poster">
                <p>${series.title || 'Unknown Title'}</p>
            `;
            topSeriesList.appendChild(listItem);
        });

    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadTopSeries);
