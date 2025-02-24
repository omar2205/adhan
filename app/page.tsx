'use client'

import { Clock, MapPin, Moon, Sun } from 'lucide-react'
import { Playfair_Display } from 'next/font/google'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  getCurrentLocation,
  getNextPrayer,
  getTimes,
  getTimeUntilNextPrayer,
} from '@/lib/adhan'
import type { Prayer, PrayerTimes } from './types'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function Home() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null)
  const [nextPrayer, setNextPrayer] = useState<{
    name: string
    time: Date
  } | null>(null)
  const [timeUntilNext, setTimeUntilNext] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [location, setLocation] = useState<[number, number] | null>(null)
  const [locationStatus, setLocationStatus] = useState<
    'idle' | 'loading' | 'error' | 'success'
  >('loading')

  const requestLocation = async () => {
    setLocationStatus('loading')
    try {
      const coords = await getCurrentLocation()
      setLocation(coords)
      setLocationStatus('success')
    } catch (error) {
      console.error('Error getting location:', error)
      setLocationStatus('error')
      setError(
        'Unable to get your location. Please allow location access and try again.',
      )
    }
  }

  useEffect(() => {
    if (!location) return

    try {
      const times = getTimes(location)
      setPrayerTimes(times)
      setError(null)
    } catch (error) {
      console.error('Error getting prayer times:', error)
      setError('Unable to load prayer times. Please try again later.')
    }
  }, [location])

  useEffect(() => {
    if (!prayerTimes) return

    const updateNextPrayer = () => {
      const next = getNextPrayer(prayerTimes)
      setNextPrayer(next)
      setTimeUntilNext(getTimeUntilNextPrayer(next))
    }

    updateNextPrayer()
    const interval = setInterval(updateNextPrayer, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [prayerTimes])

  useEffect(() => {
    try {
      requestLocation()
    } catch (error) {
      return
    }
  }, [])

  if (locationStatus === 'idle') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center gap-4 p-8">
        <Card className="bg-white/10 backdrop-blur-lg border-0 p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Prayer Times</h2>
          <p className="text-slate-300 mb-6">
            To show prayer times for your location, we need access to your
            location.
          </p>
          <Button
            onClick={requestLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white">
            <MapPin className="w-4 h-4 mr-2" />
            Share Location
          </Button>
        </Card>
      </div>
    )
  }

  if (locationStatus === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-xl text-slate-400">Getting your location...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center p-8">
        <Card className="bg-white/10 backdrop-blur-lg border-0 p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button
            onClick={requestLocation}
            className="bg-blue-500 hover:bg-blue-600 text-white">
            Try Again
          </Button>
        </Card>
      </div>
    )
  }

  if (!prayerTimes || !nextPrayer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-xl text-slate-400">Loading prayer times...</div>
      </div>
    )
  }

  const prayers: Prayer[] = [
    { name: 'Fajr', time: prayerTimes.fajr, icon: Moon },
    { name: 'Sunrise', time: prayerTimes.sunrise, icon: Sun },
    { name: 'Dhuhr', time: prayerTimes.dhuhr, icon: Sun },
    { name: 'Asr', time: prayerTimes.asr, icon: Sun },
    { name: 'Maghrib', time: prayerTimes.maghrib, icon: Sun },
    { name: 'Isha', time: prayerTimes.isha, icon: Moon },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Prayer Times</h1>
          <p className="text-slate-400 flex items-center justify-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            Uses your location to display the prayer times
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-lg border-0 p-6">
          <div className="text-center space-y-2">
            <p className="text-slate-400">Next Prayer</p>
            <h2
              className={`text-4xl font-bold text-white ${playfair.className}`}>
              {nextPrayer.name}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              <p className="text-xl text-gray-200">{timeUntilNext}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4">
          {prayers.map((prayer) => {
            const Icon = prayer.icon
            const isNext = prayer.name === nextPrayer.name
            const isPast = prayer.time < new Date()

            return (
              <Card
                key={prayer.name}
                className={`
                  p-4 flex items-center justify-between
                  ${
                    isNext
                      ? 'bg-blue-500/20 border-blue-500'
                      : 'bg-white/5 border-transparent'
                  }
                  ${isPast && !isNext ? 'opacity-50' : ''}
                  backdrop-blur-lg
                `}>
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-full ${
                      isNext ? 'bg-blue-500/20' : 'bg-white/10'
                    }`}>
                    <Icon
                      className={`w-5 h-5 ${
                        isNext ? 'text-blue-400' : 'text-slate-400'
                      }`}
                    />
                  </div>
                  <span className="font-medium text-white">{prayer.name}</span>
                </div>
                <span className="text-white">
                  {prayer.time.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
