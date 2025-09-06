export const dynamic = "force-dynamic"

type OWCurrent = {
  main?: { temp?: number; humidity?: number }
  weather?: { description?: string; icon?: string }[]
  sys?: { country?: string }
  name?: string
  cod?: number | string
  message?: string
}

type OWForecast = {
  list?: { dt: number; main?: { temp?: number } }[]
  city?: { name?: string; country?: string }
  cod?: string
  message?: string
}

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init?.headers || {}) },
  })
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const city = url.searchParams.get("city")?.trim()
    const providedKey = url.searchParams.get("key")?.trim()
    const apiKey = process.env.OWM_API_KEY || providedKey

    if (!city) return json({ error: "Missing 'city' query parameter." }, { status: 400 })
    if (!apiKey) {
      return json(
        {
          error: "Missing API key. Add OWM_API_KEY as an Environment Variable or pass ?key=YOUR_KEY for testing.",
        },
        { status: 400 },
      )
    }

    const encodedCity = encodeURIComponent(city)
    const base = "https://api.openweathermap.org/data/2.5"
    const currentUrl = `${base}/weather?q=${encodedCity}&appid=${apiKey}&units=metric`
    const forecastUrl = `${base}/forecast?q=${encodedCity}&appid=${apiKey}&units=metric`

    const [curRes, forRes] = await Promise.all([fetch(currentUrl), fetch(forecastUrl)])

    const curJson = (await curRes.json()) as OWCurrent
    const forJson = (await forRes.json()) as OWForecast

    // OpenWeatherMap uses string "200" for forecast cod; current may use number 200.
    const currentOk = (curRes.ok && curJson?.cod === 200) || curRes.ok
    const forecastOk = (forRes.ok && forJson?.cod === "200") || forRes.ok

    if (!currentOk) {
      return json({ error: curJson?.message || "Failed to fetch current weather." }, { status: curRes.status || 502 })
    }
    if (!forecastOk) {
      return json({ error: forJson?.message || "Failed to fetch forecast." }, { status: forRes.status || 502 })
    }

    const cityName = curJson?.name || forJson?.city?.name || city
    const country = curJson?.sys?.country || forJson?.city?.country || ""

    const current = {
      temp: curJson?.main?.temp ?? null,
      humidity: curJson?.main?.humidity ?? null,
      description: curJson?.weather?.[0]?.description ?? "",
      icon: curJson?.weather?.[0]?.icon ?? "01d",
    }

    // Limit to ~32 points (~4 days) to keep chart readable
    const forecast = (forJson?.list || []).slice(0, 32).map((pt) => ({ dt: pt.dt, temp: pt.main?.temp ?? null })) || []

    return json({
      city: cityName,
      country,
      current,
      forecast,
      units: "metric",
      source: "openweathermap.org",
    })
  } catch (error: any) {
    return json({ error: error?.message || "Unexpected server error." }, { status: 500 })
  }
}
