let currentUnit = 'C'; // 'C' or 'F'
let cachedForecastData = null;

const citySelect = document.getElementById('citySelect');
const unitToggleBtn = document.getElementById('unitToggleBtn');
const weatherOutput = document.getElementById('weatherOutput');

function getWeatherDetails(weatherCode) {
    const map = {
        'clear': { name: 'Clear Sky', emoji: '☀️' },
        'pcloudy': { name: 'Partly Cloudy', emoji: '⛅' },
        'mcloudy': { name: 'Mostly Cloudy', emoji: '☁️' },
        'cloudy': { name: 'Overcast', emoji: '☁️' },
        'humid': { name: 'Humid & Foggy', emoji: '🌫️' },
        'lightrain': { name: 'Light Rain', emoji: '🌦️' },
        'oshower': { name: 'Rain Showers', emoji: '🌧️' },
        'ishower': { name: 'Isolated Showers', emoji: '🌧️' },
        'rain': { name: 'Rain', emoji: '🌧️' },
        'snow': { name: 'Snow', emoji: '❄️' },
        'ts': { name: 'Thunderstorm', emoji: '⚡' },
        'ignite': { name: 'Thunderstorm Risk', emoji: '⚡' }
    };
    return map[weatherCode] || { name: weatherCode, emoji: '🌤️' };
}

function cToF(celsius) {
    return Math.round((celsius * 9/5) + 32);
}

function formatDate(dateStr) {
    const str = String(dateStr);
    const year = str.substring(0, 4);
    const month = str.substring(4, 6);
    const day = str.substring(6, 8);
    const dateObj = new Date(`${year}-${month}-${day}`);
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

async function fetchWeather() {
    const selectedOption = citySelect.options[citySelect.selectedIndex];
    const lon = selectedOption.getAttribute('data-lon');
    const lat = selectedOption.getAttribute('data-lat');

    weatherOutput.innerHTML = `<div class="loader">Fetching forecast... ⏳</div>`;

    try {
        const response = await fetch(`https://www.7timer.info/bin/api.pl?lon=${lon}&lat=${lat}&product=civillight&output=json`);
        const data = await response.json();

        if (data && data.dataseries) {
            cachedForecastData = data.dataseries;
            renderWeather();
        } else {
            weatherOutput.innerHTML = `<div class="loader">⚠️ Could not load weather data.</div>`;
        }
    } catch (error) {
        console.error(error);
        weatherOutput.innerHTML = `<div class="loader">❌ Network error. Check your connection.</div>`;
    }
}

function renderWeather() {
    if (!cachedForecastData) return;

    let html = '<div class="forecast-grid">';
    
    cachedForecastData.forEach(day => {
        const weatherInfo = getWeatherDetails(day.weather);
        const dateFormatted = formatDate(day.date);
        
        let maxTemp = day.temp2m.max;
        let minTemp = day.temp2m.min;
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
    });

    html += '</div>';
    weatherOutput.innerHTML = html;
}

citySelect.addEventListener('change', fetchWeather);

unitToggleBtn.addEventListener('click', () => {
    currentUnit = currentUnit === 'C' ? 'F' : 'C';
    unitToggleBtn.textContent = currentUnit === 'C' ? 'Switch to °F 🌡️' : 'Switch to °C 🌡️';
    renderWeather();
} );

fetchWeather();
