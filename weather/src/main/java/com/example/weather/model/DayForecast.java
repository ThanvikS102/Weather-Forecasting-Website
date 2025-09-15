// backend/src/main/java/com/example/weather/model/DayForecast.java
package com.example.weather.model;

public class DayForecast {
    private long dt;        // unix timestamp (seconds)
    private int humidity;   // percent
    private double rainPct; // 0..100

    public DayForecast() {}

    public DayForecast(long dt, int humidity, double rainPct) {
        this.dt = dt;
        this.humidity = humidity;
        this.rainPct = rainPct;
    }

    public long getDt() { return dt; }
    public void setDt(long dt) { this.dt = dt; }

    public int getHumidity() { return humidity; }
    public void setHumidity(int humidity) { this.humidity = humidity; }

    public double getRainPct() { return rainPct; }
    public void setRainPct(double rainPct) { this.rainPct = rainPct; }
}
