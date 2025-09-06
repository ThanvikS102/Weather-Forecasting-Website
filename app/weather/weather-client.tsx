"use client"

import { useState } from "react"
import { SearchForm } from "@/components/search-form"
import { WeatherCard } from "@/components/weather-card"
import { WeatherChart } from "@/components/weather-chart"

type WeatherResponse = {
  city: string
  current: { temp: number | null; humidity: number | null; description: string; icon: string | null }
  forecast: { time: string; temp: number | null }[]
  error?: string
}

export function WeatherClient() {
  const [data, setData] = useState<WeatherResponse | null>(null)

  return (
    <section className="space-y-6">
      <SearchForm onResult={(res) => setData(res)} />
      {data && (
        <div className="space-y-6">
          <WeatherCard
            city={data.city}
            description={data.current?.description ?? "—"}
            temp={data.current?.temp ?? null}
            humidity={data.current?.humidity ?? null}
            icon={data.current?.icon ?? null}
          />
          <div>
            <h2 className="text-xl font-medium mb-3">5-Day / 3-Hour Temperature Trend</h2>
            <WeatherChart data={data.forecast ?? []} />
          </div>
        </div>
      )}
    </section>
  )
}
