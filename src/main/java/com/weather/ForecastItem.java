package com.weather;

public class ForecastItem {
    private String date;
    private double temperature;
    private String description;
    
    public ForecastItem() {}
    
    public String getDate() {
        return date;
    }
    
    public void setDate(String date) {
        this.date = date;
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
    
    @Override
    public String toString() {
        return String.format("ForecastItem{date='%s', temp=%.1f°C, desc='%s'}", 
                date, temperature, description);
    }
}
