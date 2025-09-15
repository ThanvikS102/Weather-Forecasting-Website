package com.example.weather.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.weather.model.WeatherResponse;
import com.example.weather.service.WeatherService;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "*") // Allows requests from any frontend
public class WeatherController {

    private final WeatherService weatherService;

    public WeatherController(WeatherService weatherService) {
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<WeatherResponse> getWeather(@RequestParam String city) {
        WeatherResponse weatherData = weatherService.getWeatherForCity(city);
        if (weatherData != null) {
            return ResponseEntity.ok(weatherData);
        } else {
            // If the service returns null, it means there was an error
            return ResponseEntity.status(500).build();
        }
    }
}