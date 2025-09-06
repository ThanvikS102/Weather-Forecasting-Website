package com.weather;

import java.util.List;

public class ForecastData {
    private List<ForecastItem> items;
    
    public ForecastData() {}
    
    public List<ForecastItem> getItems() {
        return items;
    }
    
    public void setItems(List<ForecastItem> items) {
        this.items = items;
    }
}
