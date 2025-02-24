import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan'

import type { PrayerTimes as IPrayerTimes } from '@/app/types'

export async function getCurrentLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve([position.coords.longitude, position.coords.latitude])
      },
      (error) => {
        reject(error)
      },
    )
  })
}

export function getTimes(location: [number, number]) {
  try {
    const coordinates = new Coordinates(location[1], location[0])
    const date = new Date()
    const params = CalculationMethod.Egyptian()
    const prayerTimes = new PrayerTimes(coordinates, date, params)

    return {
      fajr: prayerTimes.fajr,
      sunrise: prayerTimes.sunrise,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
    }
  } catch (error) {
    console.error('Error in getTimes:', error)
    throw error
  }
}

export function getNextPrayer(times: IPrayerTimes) {
  const now = new Date()
  const prayers = [
    { name: 'Fajr', time: times.fajr },
    { name: 'Sunrise', time: times.sunrise },
    { name: 'Dhuhr', time: times.dhuhr },
    { name: 'Asr', time: times.asr },
    { name: 'Maghrib', time: times.maghrib },
    { name: 'Isha', time: times.isha },
  ]

  const nextPrayer = prayers.find((prayer) => prayer.time > now)
  return (
    nextPrayer || {
      ...prayers[0],
      time: new Date(prayers[0].time.getTime() + 24 * 60 * 60 * 1000),
    }
  )
}

export function getTimeUntilNextPrayer(nextPrayer: { time: Date }) {
  const now = new Date()
  const diff = nextPrayer.time.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
}
