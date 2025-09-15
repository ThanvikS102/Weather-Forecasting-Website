// DOM Element References
const weatherForm = document.getElementById('weather-form');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');
const messageDisplay = document.getElementById('message-display');
const errorMessage = document.getElementById('error-message');

// Data Display Elements
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const feelsLike = document.getElementById('feels-like');
const humidity = document.getElementById('humidity');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const wind = document.getElementById('wind');
const pressure = document.getElementById('pressure');

// Event Listener for the form
weatherForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) {
        getWeather(city);
    }
});

// Function to fetch and display weather
function getWeather(city) {
    const apiUrl = `http://localhost:8080/api/weather?city=${city}`;

    // Show loading message
    messageDisplay.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
    errorMessage.textContent = `Fetching weather for ${city}...`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('City not found or network error.');
            }
            return response.json();
        })
        .then(data => {
            updateDashboard(data);
        })
        .catch(error => {
            errorMessage.textContent = error.message;
            messageDisplay.classList.remove('hidden');
            weatherDisplay.classList.add('hidden');
        });
}

// Function to update all dashboard elements
function updateDashboard(data) {
    // Hide message display and show weather data
    messageDisplay.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');

    // Main details
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    currentDate.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    temperature.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;
    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    // Secondary details
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;

    // Convert sunrise/sunset from UNIX timestamp to readable time
    sunrise.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    sunset.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}