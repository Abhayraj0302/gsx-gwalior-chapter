import type { Event } from '../data/content'

function icsStamp(iso: string): string {
  // UTC, basic format: 20261001T043000Z
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Builds a minimal RFC 5545 VCALENDAR for one event. */
export function buildIcs(event: Event, siteUrl: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GSX Gwalior Chapter//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.slug}@gsx-gwalior`,
    `DTSTAMP:${icsStamp(new Date().toISOString())}`,
    `DTSTART:${icsStamp(event.start)}`,
    `DTEND:${icsStamp(event.end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(`${event.description} Register: ${event.registerUrl}`)}`,
    `LOCATION:${escapeIcs(event.venue)}`,
    `URL:${siteUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.join('\r\n') + '\r\n'
}

/** A data: URL usable as an <a download> href (no blob lifecycle to manage). */
export function icsHref(event: Event, siteUrl: string): string {
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(event, siteUrl))}`
}
