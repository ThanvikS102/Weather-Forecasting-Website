package com.example.weather.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.weather.model.WeatherResponse;

@Service
public class WeatherService {

    // RestTemplate is used to make HTTP requests to other services
    private final RestTemplate restTemplate;

    // Injecting values from application.properties
    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.url}")
    private String apiUrl;

    public WeatherService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public WeatherResponse getWeatherForCity(String city) {
        // Build the URL with query parameters for city, API key, and units
        // OpenWeatherMap uses 'appid' for the key parameter
        String urlWithParams = UriComponentsBuilder.fromHttpUrl(apiUrl)
                .queryParam("q", city)
                .queryParam("appid", apiKey)
                .queryParam("units", "metric") // Optional: for Celsius
                .toUriString();

        System.out.println("Fetching weather from URL: " + urlWithParams);

        try {
            // Make the API call and return the response
            return restTemplate.getForObject(urlWithParams, WeatherResponse.class);
        } catch (Exception e) {
            // Log the actual error to the console for debugging
            System.err.println("Error fetching weather data: " + e.getMessage());
            return null; // Return null if the API call fails
        }
    }
}