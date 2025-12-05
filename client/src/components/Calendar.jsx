// client/src/components/Calendar.jsx
/**
 * Calendar component for viewing interview schedules
 */
import { useState, useEffect } from "react";
import { getCalendarEvents, sendInterviewReminder } from "../api/jobsApi";

// Icons
const Icons = {
  ChevronLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Clock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Video: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  Phone: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  MapPin: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const Calendar = ({ onJobClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sendingReminder, setSendingReminder] = useState(null);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Fetch calendar events
  useEffect(() => {
    fetchEvents();
  }, [currentMonth, currentYear]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await getCalendarEvents(currentMonth + 1, currentYear);
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch calendar events:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday)
  const getFirstDayOfMonth = (month, year) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigate months
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toDateString());
  };

  // Get events for a specific date
  const getEventsForDate = (day) => {
    const dateStr = new Date(currentYear, currentMonth, day).toDateString();
    return events.filter((event) => {
      const eventDate = new Date(event.interview_date).toDateString();
      return eventDate === dateStr;
    });
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Check if date is selected
  const isSelected = (day) => {
    if (!selectedDate) return false;
    const dateStr = new Date(currentYear, currentMonth, day).toDateString();
    return dateStr === selectedDate;
  };

  // Send reminder
  const handleSendReminder = async (jobId) => {
    setSendingReminder(jobId);
    try {
      await sendInterviewReminder(jobId);
      alert("Reminder sent successfully!");
      fetchEvents(); // Refresh to update reminder_sent status
    } catch (err) {
      alert("Failed to send reminder: " + (err.response?.data?.detail || err.message));
    } finally {
      setSendingReminder(null);
    }
  };

  // Get interview type icon
  const getInterviewTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "video":
        return <Icons.Video />;
      case "phone":
        return <Icons.Phone />;
      case "onsite":
        return <Icons.MapPin />;
      default:
        return <Icons.Clock />;
    }
  };

  // Render calendar grid
  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const hasEvents = dayEvents.length > 0;

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday(day) ? "today" : ""} ${isSelected(day) ? "selected" : ""} ${hasEvents ? "has-events" : ""}`}
          onClick={() => setSelectedDate(new Date(currentYear, currentMonth, day).toDateString())}
        >
          <span className="day-number">{day}</span>
          {hasEvents && (
            <div className="event-dots">
              {dayEvents.slice(0, 3).map((_, i) => (
                <span key={i} className="event-dot" />
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  // Get selected date events
  const selectedDateEvents = selectedDate
    ? events.filter((event) => new Date(event.interview_date).toDateString() === selectedDate)
    : [];

  return (
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="btn btn-ghost btn-icon" onClick={prevMonth}>
            <Icons.ChevronLeft />
          </button>
          <h2 className="calendar-title">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button className="btn btn-ghost btn-icon" onClick={nextMonth}>
            <Icons.ChevronRight />
          </button>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={goToToday}>
          Today
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Day headers */}
        {DAYS.map((day) => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        {/* Calendar days */}
        {renderCalendarDays()}
      </div>

      {/* Selected Date Events */}
      {selectedDate && (
        <div className="calendar-events">
          <h3 className="events-title">
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {selectedDateEvents.length === 0 ? (
            <p className="text-muted">No interviews scheduled for this day.</p>
          ) : (
            <div className="events-list">
              {selectedDateEvents.map((event) => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <div className="event-company">
                      <h4>{event.company}</h4>
                      <span className="text-muted">{event.role}</span>
                    </div>
                    <span className={`status-tag ${event.status}`}>
                      <span className="status-dot" />
                      {event.status}
                    </span>
                  </div>
                  <div className="event-details">
                    <span className="event-detail">
                      <Icons.Clock />
                      {new Date(event.interview_date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {event.interview_type && (
                      <span className="event-detail">
                        {getInterviewTypeIcon(event.interview_type)}
                        {event.interview_type}
                      </span>
                    )}
                  </div>
                  {event.interview_notes && (
                    <p className="event-notes text-small text-muted">
                      {event.interview_notes}
                    </p>
                  )}
                  <div className="event-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onJobClick && onJobClick(event.job_id)}
                    >
                      View Job
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleSendReminder(event.job_id)}
                      disabled={sendingReminder === event.job_id || event.reminder_sent}
                    >
                      <Icons.Bell />
                      {event.reminder_sent
                        ? "Reminder Sent"
                        : sendingReminder === event.job_id
                        ? "Sending..."
                        : "Send Reminder"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Interviews Summary */}
      {!selectedDate && events.length > 0 && (
        <div className="calendar-events">
          <h3 className="events-title">Upcoming Interviews</h3>
          <div className="events-list">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="event-card compact">
                <div className="event-header">
                  <div className="event-company">
                    <h4>{event.company}</h4>
                    <span className="text-muted text-small">{event.role}</span>
                  </div>
                  <span className="event-date text-small">
                    {new Date(event.interview_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="calendar-loading">
          <p>Loading calendar...</p>
        </div>
      )}
    </div>
  );
};

export default Calendar;
