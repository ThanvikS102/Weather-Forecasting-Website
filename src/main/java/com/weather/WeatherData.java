package com.weather;

public class WeatherData {
    private String cityName;
    private String country;
    private double temperature;
    private String description;
    private int humidity;
    private double windSpeed;
    
    // Constructors
    public WeatherData() {}
    
    // Getters and Setters
    public String getCityName() {
        return cityName;
    }
    
    public void setCityName(String cityName) {
        this.cityName = cityName;
    }
    
    public String getCountry() {
        return country;
    }
    
    public void setCityName(String country) {
        this.country = country;
    }
    
    public double getTemperature() {
        return temperature;
    }
    
    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public int getHumidity() {
        return humidity;
    }
    
    public void setHumidity(int humidity) {
        this.humidity = humidity;
    }
    
    public double getWindSpeed() {
        return windSpeed;
    }
    
    public void setWindSpeed(double windSpeed) {
        this.windSpeed = windSpeed;
    }
    
    @Override
    public String toString() {
        return String.format("WeatherData{city='%s', country='%s', temp=%.1f°C, desc='%s', humidity=%d%%, wind=%.1f m/s}",
                cityName, country, temperature, description, humidity, windSpeed);
    }
}
