"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type SearchValues = { city: string; apiKey?: string }

export default function SearchForm({
  onSearch,
  disabled,
  initialCity,
}: {
  onSearch: (v: SearchValues) => void
  disabled?: boolean
  initialCity?: string
}) {
  const [city, setCity] = useState(initialCity || "")
  const [adv, setAdv] = useState(false)
  const [apiKey, setApiKey] = useState("")

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!city.trim()) return
        onSearch({ city: city.trim(), apiKey: adv ? apiKey.trim() : undefined })
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="city">City</Label>
        <div className="flex items-center gap-2">
          <Input
            id="city"
            placeholder="e.g., London, Paris, New York"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={disabled}
          />
          <Button type="submit" disabled={disabled || !city.trim()}>
            Search
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="adv" checked={adv} onCheckedChange={setAdv} disabled={disabled} />
        <Label htmlFor="adv">Provide API key (if env not set)</Label>
      </div>

      <div className={cn("grid grid-cols-1 gap-2", !adv && "hidden")}>
        <Label htmlFor="apiKey">OpenWeatherMap API Key</Label>
        <Input
          id="apiKey"
          placeholder="Your OWM API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          Prefer setting OWM_API_KEY as an Environment Variable for production.
        </p>
      </div>
    </form>
  )
}

export { SearchForm }
