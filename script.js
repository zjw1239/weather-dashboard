// set global variables
const weatherUrl = 'https://api.openweathermap.org/data/2.5/forecast';
const apiKey = '4f797650c0a9720157f58e414ed4004d';

// element variables
const elements = {
    form: document.getElementById('weather-form'),
    input: document.getElementById('location-input'),
    todayCont: document.getElementById('today-weather'),
    forecastCont: document.getElementById('forecast'),
    historyCont: document.getElementById('search-history'),
};

// fetch weather data
function fetchWeather(city) {
    const apiUrl = `${weatherUrl}?q=${city}&appid=${apiKey}`;

    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Received weather data:', data);
            return data;
        })
        .catch(error => console.error('Error fetching data', error));
}

// display current weather on page
function displayWeather(city, weatherData) {
    console.log('Displaying weather data:', weatherData);

    if (!weatherData || !weatherData.list || weatherData.list.length === 0) {
        console.error('Weather data is not available or in an unexpected format:', weatherData);
        return;
    }

    const date = new Date().toLocaleDateString();
    const { temp, humidity, wind } = weatherData.list[0].main; // Adjusted for the list structure
    const iconUrl = `https://openweathermap.org/img/w/${weatherData.list[0].weather[0].icon}.png`; // Adjusted for the list structure

    let html = `
        <h2>${city} (${date})</h2>
        <img src="${iconUrl}" alt="Weather Icon">
        <p>Temperature: ${temp} °F</p>
        <p>Humidity: ${humidity} %</p>`;

    if (wind) {
        const windSpeed = wind.speed;
        html += `<p>Wind Speed: ${windSpeed} MPH</p>`;
    }

    elements.todayCont.innerHTML = html;

    // Call displayForecast only once with the correct data
    displayForecast(weatherData.list);

    // Update search history after displaying current weather and forecast
    searchHistory(city);
}

// display forecast on page
function displayForecast(forecastList) {
    elements.forecastCont.innerHTML = ''; // Clear the container before adding new content
    let previousDate = null;

    forecastList.forEach(forecast => {
        const currentDate = new Date(forecast.dt_txt).toLocaleDateString();

        // Only display one data point per day
        if (currentDate !== previousDate) {
            const { temp, humidity, wind } = forecast.main;
            const iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;

            let html = `
                <div class="forecast-card">
                    <h5>${currentDate}</h5>
                    <img src="${iconUrl}" alt="Weather Icon">
                    <p>Temperature: ${temp} °F</p>
                    <p>Humidity: ${humidity} %</p>`;

            if (wind) {
                const windSpeed = wind.speed;
                html += `<p>Wind Speed: ${windSpeed} MPH</p>`;
            }

            html += `</div>`;

            elements.forecastCont.innerHTML += html;
        }

        previousDate = currentDate;
    });
}

// search history save and recall
function searchHistory(city) {
    const history = JSON.parse(localStorage.getItem('search-history')) || [];
    history.push(city); // Add the current city to the history
    localStorage.setItem('search-history', JSON.stringify(history)); // Save updated history

    elements.historyCont.innerHTML = '';

    history.forEach(city => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = city;
        button.addEventListener('click', () => {
            elements.input.value = city;
            elements.form.dispatchEvent(new Event('submit'));
        });

        elements.historyCont.appendChild(button);
    });
}

function weatherDashboard() {
    if (!localStorage.getItem('search-history-loaded')) {
        searchHistory();
        localStorage.setItem('search-history-loaded', 'true');
    }
    searchHistory();
}

window.addEventListener('beforeunload', function () {
    this.localStorage.removeItem('search-history-loaded');
})

elements.form.addEventListener('submit', function (event) {
    event.preventDefault();
    const city = elements.input.value.trim();

    if (city) {
        fetchWeather(city)
            .then(weatherData => {
                displayWeather(city, weatherData);
            })
            .catch(error => console.error('Error fetching weather data', error));
    }
});

// call to initiate
weatherDashboard();
