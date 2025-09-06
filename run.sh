#!/bin/bash
echo "Setting up OpenWeatherMap API Key..."
echo "Please set your OWM_API_KEY environment variable before running."
echo ""
echo "Example: export OWM_API_KEY=your_api_key_here"
echo ""
echo "Starting Weather Application..."
mvn clean javafx:run
