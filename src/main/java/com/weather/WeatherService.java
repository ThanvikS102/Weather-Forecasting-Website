package com.weather;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class WeatherService {
    
    private static final String API_KEY = System.getenv("OWM_API_KEY");
    private static final String CURRENT_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
    private static final String FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    
    public WeatherService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
        
        if (API_KEY == null || API_KEY.trim().isEmpty()) {
            throw new IllegalStateException(
                "OpenWeatherMap API key not found. Please set the OWM_API_KEY environment variable."
            );
        }
    }
    
    public WeatherData getCurrentWeather(String city) throws IOException, InterruptedException {
        String encodedCity = URLEncoder.encode(city, StandardCharsets.UTF_8);
        String url = String.format("%s?q=%s&appid=%s&units=metric", 
                CURRENT_WEATHER_URL, encodedCity, API_KEY);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();
        
        HttpResponse<String> response = httpClient.send(request, 
                HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new IOException("HTTP " + response.statusCode() + ": Failed to fetch weather data");
        }
        
        JsonNode root = objectMapper.readTree(response.body());
        
        if (root.has("cod") && root.get("cod").asInt() != 200) {
            String message = root.path("message").asText("Unknown error");
            throw new IOException("API Error: " + message);
        }
        
        return parseWeatherData(root);
    }
    
    public ForecastData getForecast(String city) throws IOException, InterruptedException {
        String encodedCity = URLEncoder.encode(city, StandardCharsets.UTF_8);
        String url = String.format("%s?q=%s&appid=%s&units=metric", 
                FORECAST_URL, encodedCity, API_KEY);
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build();
        
        HttpResponse<String> response = httpClient.send(request, 
                HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() != 200) {
            throw new IOException("HTTP " + response.statusCode() + ": Failed to fetch forecast data");
        }
        
        JsonNode root = objectMapper.readTree(response.body());
        
        if (root.has("cod") && !root.get("cod").asText().equals("200")) {
            String message = root.path("message").asText("Unknown error");
            throw new IOException("API Error: " + message);
        }
        
        return parseForecastData(root);
    }
    
    private WeatherData parseWeatherData(JsonNode root) {
        WeatherData weather = new WeatherData();
        
        weather.setCityName(root.path("name").asText());
        weather.setCountry(root.path("sys").path("country").asText());
        weather.setTemperature(root.path("main").path("temp").asDouble());
        weather.setHumidity(root.path("main").path("humidity").asInt());
        weather.setWindSpeed(root.path("wind").path("speed").asDouble());
        
        JsonNode weatherArray = root.path("weather");
        if (weatherArray.isArray() && weatherArray.size() > 0) {
            weather.setDescription(weatherArray.get(0).path("description").asText());
        }
        
        return weather;
    }
    
    private ForecastData parseForecastData(JsonNode root) {
        ForecastData forecast = new ForecastData();
        List<ForecastItem> items = new ArrayList<>();
        
        JsonNode list = root.path("list");
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd");
        
        // Group by day and take the first forecast for each day (next 5 days)
        String lastDate = "";
        int dayCount = 0;
        
        for (JsonNode item : list) {
            if (dayCount >= 5) break;
            
            long timestamp = item.path("dt").asLong();
            LocalDate date = Instant.ofEpochSecond(timestamp)
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            
            String dateStr = date.format(formatter);
            
            if (!dateStr.equals(lastDate)) {
                ForecastItem forecastItem = new ForecastItem();
                forecastItem.setDate(dateStr);
                forecastItem.setTemperature(item.path("main").path("temp").asDouble());
                
                JsonNode weatherArray = item.path("weather");
                if (weatherArray.isArray() && weatherArray.size() > 0) {
                    forecastItem.setDescription(weatherArray.get(0).path("description").asText());
                }
                
                items.add(forecastItem);
                lastDate = dateStr;
                dayCount++;
            }
        }
        
        forecast.setItems(items);
        return forecast;
    }
}
