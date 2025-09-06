package com.weather;

import javafx.application.Application;
import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.chart.CategoryAxis;
import javafx.scene.chart.LineChart;
import javafx.scene.chart.NumberAxis;
import javafx.scene.chart.XYChart;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.scene.text.Font;
import javafx.scene.text.FontWeight;
import javafx.stage.Stage;

public class WeatherApp extends Application {
    
    private WeatherService weatherService;
    private TextField cityField;
    private Button searchButton;
    private Label cityLabel;
    private Label temperatureLabel;
    private Label descriptionLabel;
    private Label humidityLabel;
    private Label windLabel;
    private Label statusLabel;
    private LineChart<String, Number> temperatureChart;
    private ProgressIndicator loadingIndicator;

    @Override
    public void start(Stage primaryStage) {
        weatherService = new WeatherService();
        
        primaryStage.setTitle("Weather Forecasting Application ☀️");
        
        // Create main layout
        VBox root = new VBox(15);
        root.setPadding(new Insets(20));
        root.setStyle("-fx-background-color: linear-gradient(to bottom, #87CEEB, #E0F6FF);");
        
        // Title
        Label titleLabel = new Label("Weather Forecasting Application");
        titleLabel.setFont(Font.font("Arial", FontWeight.BOLD, 24));
        titleLabel.setStyle("-fx-text-fill: #2C3E50;");
        
        // Search section
        HBox searchBox = createSearchSection();
        
        // Current weather section
        VBox weatherInfo = createWeatherInfoSection();
        
        // Chart section
        VBox chartSection = createChartSection();
        
        // Status bar
        HBox statusBar = createStatusBar();
        
        root.getChildren().addAll(titleLabel, searchBox, weatherInfo, chartSection, statusBar);
        
        Scene scene = new Scene(root, 900, 700);
        primaryStage.setScene(scene);
        primaryStage.show();
        
        // Load default city
        Platform.runLater(() -> {
            cityField.setText("London");
            searchWeather();
        });
    }
    
    private HBox createSearchSection() {
        HBox searchBox = new HBox(10);
        searchBox.setAlignment(Pos.CENTER);
        searchBox.setPadding(new Insets(10));
        searchBox.setStyle("-fx-background-color: rgba(255, 255, 255, 0.8); -fx-background-radius: 10;");
        
        Label searchLabel = new Label("Enter City:");
        searchLabel.setFont(Font.font("Arial", FontWeight.BOLD, 14));
        
        cityField = new TextField();
        cityField.setPromptText("e.g., London, New York, Tokyo");
        cityField.setPrefWidth(250);
        cityField.setOnAction(e -> searchWeather());
        
        searchButton = new Button("Search Weather");
        searchButton.setStyle("-fx-background-color: #3498DB; -fx-text-fill: white; -fx-font-weight: bold;");
        searchButton.setOnAction(e -> searchWeather());
        
        loadingIndicator = new ProgressIndicator();
        loadingIndicator.setMaxSize(20, 20);
        loadingIndicator.setVisible(false);
        
        searchBox.getChildren().addAll(searchLabel, cityField, searchButton, loadingIndicator);
        return searchBox;
    }
    
    private VBox createWeatherInfoSection() {
        VBox weatherInfo = new VBox(10);
        weatherInfo.setPadding(new Insets(15));
        weatherInfo.setStyle("-fx-background-color: rgba(255, 255, 255, 0.9); -fx-background-radius: 10;");
        
        Label currentWeatherTitle = new Label("Current Weather");
        currentWeatherTitle.setFont(Font.font("Arial", FontWeight.BOLD, 18));
        currentWeatherTitle.setStyle("-fx-text-fill: #2C3E50;");
        
        GridPane weatherGrid = new GridPane();
        weatherGrid.setHgap(20);
        weatherGrid.setVgap(10);
        weatherGrid.setPadding(new Insets(10));
        
        // Weather info labels
        cityLabel = new Label("City: --");
        temperatureLabel = new Label("Temperature: --");
        descriptionLabel = new Label("Description: --");
        humidityLabel = new Label("Humidity: --");
        windLabel = new Label("Wind Speed: --");
        
        // Style labels
        Font labelFont = Font.font("Arial", 14);
        cityLabel.setFont(Font.font("Arial", FontWeight.BOLD, 16));
        temperatureLabel.setFont(Font.font("Arial", FontWeight.BOLD, 16));
        temperatureLabel.setStyle("-fx-text-fill: #E74C3C;");
        descriptionLabel.setFont(labelFont);
        humidityLabel.setFont(labelFont);
        windLabel.setFont(labelFont);
        
        weatherGrid.add(cityLabel, 0, 0, 2, 1);
        weatherGrid.add(temperatureLabel, 0, 1);
        weatherGrid.add(descriptionLabel, 1, 1);
        weatherGrid.add(humidityLabel, 0, 2);
        weatherGrid.add(windLabel, 1, 2);
        
        weatherInfo.getChildren().addAll(currentWeatherTitle, weatherGrid);
        return weatherInfo;
    }
    
    private VBox createChartSection() {
        VBox chartSection = new VBox(10);
        chartSection.setPadding(new Insets(15));
        chartSection.setStyle("-fx-background-color: rgba(255, 255, 255, 0.9); -fx-background-radius: 10;");
        
        Label chartTitle = new Label("5-Day Temperature Forecast");
        chartTitle.setFont(Font.font("Arial", FontWeight.BOLD, 18));
        chartTitle.setStyle("-fx-text-fill: #2C3E50;");
        
        CategoryAxis xAxis = new CategoryAxis();
        xAxis.setLabel("Date");
        NumberAxis yAxis = new NumberAxis();
        yAxis.setLabel("Temperature (°C)");
        
        temperatureChart = new LineChart<>(xAxis, yAxis);
        temperatureChart.setTitle("Temperature Trend");
        temperatureChart.setPrefHeight(300);
        temperatureChart.setLegendVisible(false);
        temperatureChart.setCreateSymbols(true);
        
        chartSection.getChildren().addAll(chartTitle, temperatureChart);
        return chartSection;
    }
    
    private HBox createStatusBar() {
        HBox statusBar = new HBox();
        statusBar.setPadding(new Insets(5));
        statusBar.setStyle("-fx-background-color: rgba(52, 73, 94, 0.8); -fx-background-radius: 5;");
        
        statusLabel = new Label("Ready - Enter a city name to get weather information");
        statusLabel.setStyle("-fx-text-fill: white;");
        statusLabel.setFont(Font.font("Arial", 12));
        
        statusBar.getChildren().add(statusLabel);
        return statusBar;
    }
    
    private void searchWeather() {
        String city = cityField.getText().trim();
        if (city.isEmpty()) {
            showAlert("Please enter a city name", Alert.AlertType.WARNING);
            return;
        }
        
        setLoading(true);
        statusLabel.setText("Fetching weather data for " + city + "...");
        
        Task<WeatherData> task = new Task<WeatherData>() {
            @Override
            protected WeatherData call() throws Exception {
                return weatherService.getCurrentWeather(city);
            }
        };
        
        task.setOnSucceeded(e -> {
            setLoading(false);
            WeatherData weather = task.getValue();
            updateWeatherDisplay(weather);
            loadForecast(city);
            statusLabel.setText("Weather data loaded successfully");
        });
        
        task.setOnFailed(e -> {
            setLoading(false);
            Throwable exception = task.getException();
            String message = exception.getMessage();
            showAlert("Failed to fetch weather data: " + message, Alert.AlertType.ERROR);
            statusLabel.setText("Failed to load weather data");
        });
        
        new Thread(task).start();
    }
    
    private void loadForecast(String city) {
        Task<ForecastData> forecastTask = new Task<ForecastData>() {
            @Override
            protected ForecastData call() throws Exception {
                return weatherService.getForecast(city);
            }
        };
        
        forecastTask.setOnSucceeded(e -> {
            ForecastData forecast = forecastTask.getValue();
            updateChart(forecast);
        });
        
        forecastTask.setOnFailed(e -> {
            System.err.println("Failed to load forecast: " + e.getSource().getException().getMessage());
        });
        
        new Thread(forecastTask).start();
    }
    
    private void updateWeatherDisplay(WeatherData weather) {
        cityLabel.setText("City: " + weather.getCityName() + ", " + weather.getCountry());
        temperatureLabel.setText(String.format("Temperature: %.1f°C", weather.getTemperature()));
        descriptionLabel.setText("Description: " + capitalizeFirst(weather.getDescription()));
        humidityLabel.setText("Humidity: " + weather.getHumidity() + "%");
        windLabel.setText(String.format("Wind Speed: %.1f m/s", weather.getWindSpeed()));
    }
    
    private void updateChart(ForecastData forecast) {
        temperatureChart.getData().clear();
        
        XYChart.Series<String, Number> series = new XYChart.Series<>();
        series.setName("Temperature");
        
        for (ForecastItem item : forecast.getItems()) {
            series.getData().add(new XYChart.Data<>(item.getDate(), item.getTemperature()));
        }
        
        temperatureChart.getData().add(series);
    }
    
    private void setLoading(boolean loading) {
        searchButton.setDisable(loading);
        cityField.setDisable(loading);
        loadingIndicator.setVisible(loading);
    }
    
    private void showAlert(String message, Alert.AlertType type) {
        Platform.runLater(() -> {
            Alert alert = new Alert(type);
            alert.setTitle("Weather App");
            alert.setHeaderText(null);
            alert.setContentText(message);
            alert.showAndWait();
        });
    }
    
    private String capitalizeFirst(String text) {
        if (text == null || text.isEmpty()) return text;
        return text.substring(0, 1).toUpperCase() + text.substring(1);
    }
    
    public static void main(String[] args) {
        launch(args);
    }
}
