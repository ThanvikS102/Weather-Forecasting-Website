"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export type ForecastPoint = { dt: number; temp: number | null }

function formatLabel(dtSec: number) {
  const d = new Date(dtSec * 1000)
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

export default function WeatherChart({ data }: { data: ForecastPoint[] }) {
  const chartData = (data || []).map((p) => ({ time: formatLabel(p.dt), temp: p.temp }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-pretty">Temperature Trend</CardTitle>
        <CardDescription>Next several days (3-hour intervals)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            temp: { label: "Temperature (°C)", color: "hsl(var(--chart-1))" },
          }}
          className="h-[360px] w-full"
        >
          <LineChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" minTickGap={24} />
            <YAxis unit="°C" />
            <ChartTooltip content={<ChartTooltipContent label="temp" />} />
            <Line
              type="monotone"
              dataKey="temp"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2} // make line more visible
              name="Temperature"
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
              connectNulls
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { WeatherChart }
