"use client"

import useSWR from "swr"
import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import SearchForm, { type SearchValues } from "@/components/search-form"
import WeatherChart from "@/components/weather-chart"
import WeatherCard from "@/components/weather-card"

type WeatherResponse = {
  city: string
  country: string
  current: { temp: number | null; humidity: number | null; description: string; icon: string }
  forecast: { dt: number; temp: number | null }[]
  units: "metric"
  source: string
  error?: string
}

const fetcher = async (url: string) => {
  const res = await fetch(url)
  const data = (await res.json()) as any
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed: ${res.status}`
    throw new Error(msg)
  }
  return data
}

export default function WeatherPage() {
  const { toast } = useToast()
  const [query, setQuery] = useState<{ city: string; apiKey?: string } | null>({ city: "London" })

  const swrKey = useMemo(() => {
    if (!query?.city) return null
    const p = new URLSearchParams({ city: query.city })
    if (query.apiKey) p.set("key", query.apiKey)
    return `/api/weather?${p.toString()}`
  }, [query])

  const { data, error, isLoading, mutate } = useSWR<WeatherResponse>(swrKey, fetcher, {
    revalidateOnFocus: false,
  })

  const onSearch = (v: SearchValues) => setQuery(v)

  const lastErrorRef = useRef<string | null>(null)
  useEffect(() => {
    if (!error) return
    const msg = error.message || "Unknown error"
    if (lastErrorRef.current === msg) return
    lastErrorRef.current = msg
    toast({ title: "Error fetching weather", description: msg, variant: "destructive" })
  }, [error, toast])

  const hasData = !!data && !error
  const currentIconUrl =
    hasData && data.current?.icon
      ? `https://openweathermap.org/img/wn/${data.current.icon}@2x.png`
      : "/generic-weather-icon.png"

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-balance text-2xl font-semibold">Weather Forecasting Application</h1>
        <p className="text-muted-foreground">
          Search for a city to view current weather, humidity, and a multi-day forecast.
        </p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Enter a city name. Optionally provide an API key if it’s not set as an environment variable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchForm onSearch={onSearch} disabled={isLoading} initialCity="London" />
        </CardContent>
      </Card>

      <section className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-pretty">
              {hasData ? `${data.city}${data.country ? `, ${data.country}` : ""}` : "Current Weather"}
            </CardTitle>
            <CardDescription>Real-time conditions via OpenWeatherMap</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : hasData ? (
              <WeatherCard
                city={data.city}
                country={data.country}
                description={data.current.description}
                temp={data.current.temp}
                humidity={data.current.humidity}
                icon={data.current.icon}
                source={data.source}
              />
            ) : (
              <p className="text-muted-foreground">Enter a city and press Search to view weather.</p>
            )}
          </CardContent>
        </Card>

        <div>
          {isLoading ? (
            <Skeleton className="h-[420px] w-full" />
          ) : hasData ? (
            <WeatherChart data={data.forecast || []} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Forecast</CardTitle>
                <CardDescription>Trend visualization will appear here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">No data yet. Search for a city to see forecast trends.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  )
}
