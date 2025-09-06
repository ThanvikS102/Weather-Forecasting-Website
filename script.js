class WeatherApp {
  constructor() {
    this.chart = null
    this.currentQuery = null
    this.initializeEventListeners()
  }

  initializeEventListeners() {
    const searchForm = document.getElementById("search-form")
    const retryBtn = document.getElementById("retry-btn")

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleSearch()
    })

    retryBtn.addEventListener("click", () => {
      if (this.currentQuery) {
        this.fetchWeather(this.currentQuery.city, this.currentQuery.apiKey)
      }
    })
  }

  handleSearch() {
    const cityInput = document.getElementById("city-input")
    const apiKeyInput = document.getElementById("api-key-input")

    const city = cityInput.value.trim()
    const apiKey = apiKeyInput.value.trim()

    if (!city) {
      this.showError("Please enter a city name.")
      return
    }

    this.currentQuery = { city, apiKey: apiKey || undefined }
    this.fetchWeather(city, apiKey || undefined)
  }

  async fetchWeather(city, apiKey) {
    this.showLoading()
    this.hideError()

    if (!apiKey) {
      this.showError("API key is required. Get one from openweathermap.org")
      this.hideLoading()
      return
    }

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      )
      const currentData = await currentResponse.json()

      if (!currentResponse.ok) {
        throw new Error(currentData.message || `Weather API error: ${currentResponse.status}`)
      }

      // Fetch 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`,
      )
      const forecastData = await forecastResponse.json()

      if (!forecastResponse.ok) {
        throw new Error(forecastData.message || `Forecast API error: ${forecastResponse.status}`)
      }

      // Transform data to match expected format
      const transformedData = {
        city: currentData.name,
        country: currentData.sys.country,
        current: {
          temp: currentData.main.temp,
          humidity: currentData.main.humidity,
          description: currentData.weather[0].description,
          icon: currentData.weather[0].icon,
        },
        forecast: forecastData.list.map((item) => ({
          dt: item.dt,
          temp: item.main.temp,
        })),
        source: "OpenWeatherMap",
      }

      this.displayWeatherData(transformedData)
      this.displayForecastChart(transformedData.forecast || [])
    } catch (error) {
      this.showError(error.message)
      this.hideLoading()
    }
  }

  showLoading() {
    document.getElementById("loading").classList.remove("hidden")
    document.getElementById("chart-loading").classList.remove("hidden")
    document.getElementById("weather-data").classList.add("hidden")
    document.getElementById("no-data").classList.add("hidden")
    document.getElementById("forecast-chart").classList.add("hidden")
    document.getElementById("no-chart-data").classList.add("hidden")
    document.getElementById("search-btn").disabled = true
  }

  hideLoading() {
    document.getElementById("loading").classList.add("hidden")
    document.getElementById("chart-loading").classList.add("hidden")
    document.getElementById("search-btn").disabled = false
  }

  displayWeatherData(data) {
    this.hideLoading()

    // Update title
    const title = data.city && data.country ? `${data.city}, ${data.country}` : data.city || "Current Weather"
    document.getElementById("weather-title").textContent = title

    const weatherIcon = document.getElementById("weather-icon")
    if (data.current?.icon) {
      const iconUrl = `https://openweathermap.org/img/wn/${data.current.icon}@2x.png`
      weatherIcon.src = iconUrl
      weatherIcon.onerror = () => {
        weatherIcon.src =
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzAiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0iTTQwIDIwVjEwTTQwIDcwVjYwTTIwIDQwSDEwTTcwIDQwSDYwTTI3LjMyIDI3LjMyTDIwLjcxIDIwLjcxTTU5LjI5IDIwLjcxTDUyLjY4IDI3LjMyTTUyLjY4IDUyLjY4TDU5LjI5IDU5LjI5TTIwLjcxIDU5LjI5TDI3LjMyIDUyLjY4IiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo="
      }
    } else {
      weatherIcon.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzAiIGZpbGw9IiNGRkQ3MDAiLz4KPHBhdGggZD0iTTQwIDIwVjEwTTQwIDcwVjYwTTIwIDQwSDEwTTcwIDQwSDYwTTI3LjMyIDI3LjMyTDIwLjcxIDIwLjcxTTU5LjI5IDIwLjcxTDUyLjY4IDI3LjMyTTUyLjY4IDUyLjY4TDU5LjI5IDU5LjI5TTIwLjcxIDU5LjI5TDI3LjMyIDUyLjY4IiBzdHJva2U9IiNGRkQ3MDAiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo="
    }

    // Update weather info
    document.getElementById("weather-description").textContent = data.current?.description || "—"
    document.getElementById("weather-source").textContent = `Data source: ${data.source || "—"}`

    // Update stats
    document.getElementById("temperature").textContent =
      data.current?.temp != null ? `${data.current.temp.toFixed(1)} °C` : "—"
    document.getElementById("humidity").textContent =
      data.current?.humidity != null ? `${data.current.humidity} %` : "—"
    document.getElementById("updated-time").textContent = new Date().toLocaleTimeString()

    // Show weather data
    document.getElementById("weather-data").classList.remove("hidden")
    document.getElementById("no-data").classList.add("hidden")
  }

  displayForecastChart(forecastData) {
    if (!forecastData || forecastData.length === 0) {
      document.getElementById("no-chart-data").classList.remove("hidden")
      return
    }

    const labels = forecastData.map((item) => {
      const date = new Date(item.dt * 1000)
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
        hour: "2-digit",
      })
    })

    const temperatures = forecastData.map((item) => item.temp)

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy()
    }

    // Create new chart
    const ctx = document.getElementById("forecast-chart").getContext("2d")
    this.chart = new window.Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: temperatures,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: "Temperature (°C)",
            },
          },
          x: {
            title: {
              display: true,
              text: "Time",
            },
          },
        },
      },
    })

    document.getElementById("forecast-chart").classList.remove("hidden")
    document.getElementById("no-chart-data").classList.add("hidden")
  }

  showError(message) {
    document.getElementById("error-text").textContent = message
    document.getElementById("error-message").classList.remove("hidden")
  }

  hideError() {
    document.getElementById("error-message").classList.add("hidden")
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new WeatherApp()
})
