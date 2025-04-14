"use client";
import { useCalendarApp, ScheduleXCalendar } from "@schedule-x/react";
import {
  createViewMonthAgenda,
  createViewMonthGrid,
  createViewDay,
  createViewWeek,
} from "@schedule-x/calendar";
import "@schedule-x/theme-shadcn/dist/index.css";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

import {
  createEventRecurrencePlugin,
  createEventsServicePlugin,
} from "@schedule-x/event-recurrence";

export function UserCalendar() {
  // console.log(events); // Keep or remove as needed for debugging
  const eventsService = useState(() => createEventsServicePlugin())[0];
  const recurrencePlugin = useState(() => createEventRecurrencePlugin())[0];
  const { resolvedTheme } = useTheme();

  const events = [
    {
      id: "1",
      title: "Out of office",
      start: "2024-03-18",
      end: "2024-03-18",
      rrule: "FREQ=WEEKLY;BYDAY=TU",
    },
  ];
  const backgroundEvents = [
    {
      id: "2",
      title: "Out of office",
      start: "2025-04-04 10:00",
      end: "2025-04-04 12:30",
      style: {
        background: "linear-gradient(45deg, #f91c45, #1c7df9)",
        opacity: 0.5,
      },
      rrule: "FREQ=WEEKLY;BYDAY=TU",
    },
  ];

  const calendar = useCalendarApp({
    isDark: resolvedTheme === "dark",
    theme: "shadcn",
    views: [createViewWeek(), createViewDay()],
    plugins: [eventsService, recurrencePlugin],
  });

  // Effect to update theme
  useEffect(() => {
    if (calendar) {
      calendar.setTheme(resolvedTheme);
    }
  }, [resolvedTheme, calendar]);

  // Effect to update events when props change
  useEffect(() => {
    if (calendar) {
      calendar.eventsService.setBackgroundEvents(backgroundEvents);
      calendar.eventsService.set(events);
    }
  }, [events, backgroundEvents, calendar]);

  return (
    <div>
      <style jsx>{`
        :global(.sx-react-calendar-wrapper) {
          max-width: 100vw;
          height: 800px;
          max-height: 90vh;
        }
      `}</style>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  );
}
