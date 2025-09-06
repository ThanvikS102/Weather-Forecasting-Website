"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"

type Props = {
  city: string
  country?: string
  description: string
  temp: number | null
  humidity: number | null
  icon?: string | null
  source?: string
}

export default function WeatherCard({ city, country, description, temp, humidity, icon, source }: Props) {
  const place = country ? `${city}, ${country}` : city
  const iconUrl = icon ? `https://openweathermap.org/img/wn/${icon}@2x.png` : "/generic-weather-icon.png"

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div>
          <CardTitle className="text-pretty">{place || "Current Weather"}</CardTitle>
          <CardDescription>{source ? `Real-time conditions via ${source}` : "Real-time conditions"}</CardDescription>
        </div>
        <Image
          src={iconUrl || "/placeholder.svg"}
          alt={description ? `Icon showing ${description}` : "Weather icon"}
          width={80}
          height={80}
          className="h-20 w-20"
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-medium capitalize">{description || "—"}</p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Temperature</p>
              <p className="text-xl font-semibold">
                {temp != null && Number.isFinite(temp) ? `${temp.toFixed(1)} °C` : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Humidity</p>
              <p className="text-xl font-semibold">
                {humidity != null && Number.isFinite(humidity) ? `${humidity} %` : "—"}
              </p>
            </div>
            <div className="col-span-2 md:col-span-1">
              <p className="text-sm text-muted-foreground">Updated</p>
              <p className="text-xl font-semibold">{new Date().toLocaleTimeString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export { WeatherCard }
