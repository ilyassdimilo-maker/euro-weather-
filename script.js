let currentUnit = 'C'; 
let cachedForecastData = null;

const citySelect = document.getElementById('citySelect');
const unitToggleBtn = document.getElementById('unitToggleBtn');
const weatherOutput = document.getElementById('weatherOutput');

// Map WMO weather codes from Open-Meteo to readable names & emojis
function getWeatherDetails(code) {
    if (code === 0) return { name: 'Clear Sky', emoji: '☀️' };
    if ([1, 2].includes(code)) return { name: 'Partly Cloudy', emoji: '⛅' };
    if (code === 3) return { name: 'Overcast', emoji: '☁️' };
    if ([45, 48].includes(code)) return { name: 'Foggy', emoji: '🌫️' };
    if ([51, 53, 55, 56, 57].includes(code)) return { name: 'Light Rain', emoji: '🌦️' };
    if ([61, 63, 66].includes(code)) return { name: 'Rain', emoji: '🌧️' };
    if ([65, 67, 80, 81, 82].includes(code)) return { name: 'Heavy Showers', emoji: '🌧️' };
    if ([71, 73, 75, 77].includes(code)) return { name: 'Snow', emoji: '❄️' };
    if ([95, 96, 99].includes(code)) return { name: 'Thunderstorm', emoji: '⚡' };
    return { name: 'Fair Weather', emoji: '🌤️' };
}

function cToF(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

function formatDate(dateStr) {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

async function fetchWeather() {
    const selectedOption = citySelect.options[citySelect.selectedIndex];
    const lon = selectedOption.getAttribute('data-lon');
    const lat = selectedOption.getAttribute('data-lat');

    weatherOutput.innerHTML = `<div class="loader">Fetching secure forecast... ⏳</div>`;

    try {
        // Open-Meteo secure HTTPS endpoint (works on GitHub Pages)
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&timezone=auto`);
const data = await response.json();

if (data && data.daily) {
    cachedForecastData = data.daily;
    window.cachedHourlyData = data.hourly;
    renderWeather();
} else {
    weatherOutput.innerHTML = `<div class="loader">⚠️ Could not load weather data.</div>`;
}

{
    } catch (error) {
        console.error(error);
        weatherOutput.innerHTML = `<div class="loader">❌ Network error. Check your connection.</div>`;
    }
}

function renderWeather() {
    if (!cachedForecastData) return;

    let html = '<div class="forecast-grid">';
    
    for (let i = 0; i < cachedForecastData.time.length; i++) {
        const dateFormatted = formatDate(cachedForecastData.time[i]);
        const weatherInfo = getWeatherDetails(cachedForecastData.weather_code[i]);
        
        let maxTemp = cachedForecastData.temperature_2m_max[i];
        let minTemp = cachedForecastData.temperature_2m_min[i];
        let unitSymbol = '°C';

        if (currentUnit === 'F') {
            maxTemp = cToF(maxTemp);
            minTemp = cToF(minTemp);
            unitSymbol = '°F';
        }

        html += `
            <div class="forecast-card">
                <div class="forecast-info">
                    <h4>${dateFormatted}</h4>
                    <div class="weather-desc">${weatherInfo.emoji} ${weatherInfo.name}</div>
                </div>
                <div class="forecast-temps">
                    <div class="temp-high">${maxTemp}${unitSymbol}</div>
                    <div class="temp-low">${minTemp}${unitSymbol}</div>
                </div>
            </div>
        `;
    }

    html += '</div>';
    weatherOutput.innerHTML = html;
}

citySelect.addEventListener('change', fetchWeather);

unitToggleBtn.addEventListener('click', () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    unitToggleBtn.textContent = currentUnit === 'C' ? 'Switch to °F 🌡️' : 'Switch to °C 🌡️';
    renderWeather();
});

fetchWeather(); 