"use client"

import useSWR from "swr"
import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import SearchForm, { type SearchValues } from "@/components/search-form"
import WeatherChart from "@/components/weather-chart"

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

export default function Page() {
  const { toast } = useToast()
  const [query, setQuery] = useState<{ city: string; apiKey?: string } | null>(null)

  const swrKey = useMemo(() => {
    if (!query?.city) return null
    const p = new URLSearchParams({ city: query.city })
    if (query.apiKey) p.set("key", query.apiKey)
    return `/api/weather?${p.toString()}`
  }, [query])

  const { data, error, isLoading, mutate } = useSWR<WeatherResponse>(swrKey, fetcher, {
    revalidateOnFocus: false,
  })

  const onSearch = (v: SearchValues) => {
    setQuery(v)
  }

  const lastErrorKeyRef = useRef<string | null>(null)
  useEffect(() => {
    if (!error) return
    const key = `${swrKey ?? "no-key"}|${error.message}`
    if (lastErrorKeyRef.current === key) return
    lastErrorKeyRef.current = key
    toast({ title: "Error fetching weather", description: error.message, variant: "destructive" })
  }, [error, toast, swrKey])

  const hasData = !!data && !error

  const currentIconUrl =
    hasData && data.current?.icon
      ? `https://openweathermap.org/img/wn/${data.current.icon}@2x.png`
      : "/generic-weather-icon.png"

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-balance text-2xl font-semibold">Weather Forecasting Application</h1>
        <p className="text-muted-foreground">Search for a city to view current conditions and a multi-day forecast.</p>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Enter a city name. Optionally provide an API key if not set as an environment variable.
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
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={currentIconUrl || "/placeholder.svg"}
                    alt="Weather icon"
                    width={80}
                    height={80}
                    className="h-20 w-20"
                  />
                  <div>
                    <p className="text-lg font-medium capitalize">{data.current.description || "—"}</p>
                    <p className="text-sm text-muted-foreground">Data source: {data.source}</p>
                  </div>
                </div>
                <Separator className="md:hidden" />
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Temperature</p>
                    <p className="text-xl font-semibold">
                      {data.current.temp != null ? `${data.current.temp.toFixed(1)} °C` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="text-xl font-semibold">
                      {data.current.humidity != null ? `${data.current.humidity} %` : "—"}
                    </p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm text-muted-foreground">Updated</p>
                    <p className="text-xl font-semibold">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
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

        {error ? (
          <div className="text-sm text-red-600">
            {error.message}
            <div className="mt-2">
              <Button variant="outline" onClick={() => mutate()} size="sm">
                Retry
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
