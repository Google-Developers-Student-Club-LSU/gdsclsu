<script lang="ts">
    import { onMount, tick } from "svelte";
    import { authState } from "$lib/firebase/auth.svelte";
    import * as database from "$lib/firebase/database";
    import { collection, getDocs } from "firebase/firestore";
    
    type ViewType = 'week' | 'month';
    type Event = { 
        id: string;
        title: string;
        description?: string;
        date: string;
        startTime: string;
        endTime: string;
        color: string;
        pin?: string;
        featured?: boolean;
    }
    
    interface User {
        id: string;
        permissions: string;
        points: number;
        username: string;
    }
    
    let { user }: { user: User | null } = $props();

    let timeLabels: HTMLDivElement | undefined = $state(undefined);
    let calendarBody: HTMLDivElement | undefined = $state(undefined);
    let addEventBtn: HTMLButtonElement | undefined = $state(undefined);
    let todayBtn: HTMLButtonElement | undefined = $state(undefined);
    let cancelBtn: HTMLButtonElement | undefined = $state(undefined); 
    let saveBtn: HTMLButtonElement | undefined = $state(undefined);
    let eventForm: HTMLFormElement | undefined = $state(undefined);
    let eventModal: HTMLDivElement | undefined = $state(undefined);
    let modalTitle: HTMLHeadingElement | undefined = $state(undefined);
    let eventTitle: HTMLInputElement | undefined = $state(undefined);
    let eventDate: HTMLInputElement | undefined = $state(undefined);
    let eventStart: HTMLInputElement | undefined = $state(undefined);
    let eventEnd: HTMLInputElement | undefined = $state(undefined);
    let eventDescription: HTMLTextAreaElement | undefined = $state(undefined);
    let isFeatured = $state(false);
    let calendarContainer: HTMLDivElement | undefined = $state(undefined);
    let prevBtn: HTMLButtonElement | undefined = $state(undefined);
    let nextBtn: HTMLButtonElement | undefined = $state(undefined);
    let weekViewBtn: HTMLButtonElement | undefined = $state(undefined);
    let monthViewBtn: HTMLButtonElement | undefined = $state(undefined);
    let timeGrid: HTMLDivElement | undefined = $state(undefined);

    let events: Event[] = $state([]);
    let loadingEvents: boolean = $state(true);
    let editingEventId = $state<string | null>(null);
    let selectedEvent: Event | null = $state(null);
    let showDetailModal: boolean = $state(false);
    let eventModalOpen: boolean = $state(false);
    let currentView: ViewType = $state('week');
    let currentDate: Date = $state(new Date());
    let dateDisplay = $state("");
    let formColor = $state('blue');

    const EVENT_COLORS: { key: string; label: string; hex: string }[] = [
        { key: 'blue', label: 'Peacock', hex: '#039be5' },
        { key: 'green', label: 'Basil', hex: '#0b8043' },
        { key: 'purple', label: 'Grape', hex: '#8e24aa' },
        { key: 'orange', label: 'Tangerine', hex: '#f4511e' },
        { key: 'red', label: 'Tomato', hex: '#d50000' },
    ];

    function getColorMeta(key: string) {
        return EVENT_COLORS.find(c => c.key === key) ?? EVENT_COLORS[0];
    }

    let featuredEvent = $derived.by(() => {
        const todayStr = formatDate(new Date());
        const upcomingFeatured = events
            .filter(e => e.featured && e.date >= todayStr)
            .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));
        
        return upcomingFeatured.length > 0 ? upcomingFeatured[0] : null;
    });

    let upcomingEvents = $derived.by(() => {
        const todayStr = formatDate(new Date());
        return events
            .filter(e => e.date >= todayStr)
            .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
            .slice(0, 5);
    });

    function generateEventPin(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let pin = '';
        for (let i = 0; i < 4; i++) {
            pin += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return pin;
    } 

    function formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function parseDateOnly(dateString: string): Date {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    function formatDateDisplay(date: Date, view: ViewType): string {
        if (view === 'week') {
            const weekStart = getWeekStart(date);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }
    }

    const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    function getWeekStart(date: Date): Date {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        return new Date(d.setDate(diff));
    }

    function getWeekDays(date: Date): Date[] {
        const weekStart = getWeekStart(date);
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(weekStart);
            day.setDate(day.getDate() + i);
            days.push(day);
        }
        return days;
    }

    function getMonthDays(date: Date): Date[] {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        const days: Date[] = [];
        
        const prevMonth = new Date(year, month, 0);
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push(new Date(year, month - 1, prevMonth.getDate() - i));
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        
        const totalCells = 42;
        const remaining = totalCells - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push(new Date(year, month + 1, i));
        }
        
        return days;
    }

    function updateDateDisplay() {
        dateDisplay = formatDateDisplay(currentDate, currentView);
    }

    function navigateDate(direction: 'prev' | 'next') {
        const newDate = new Date(currentDate);
        if (currentView === 'week') {
            newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        } else {
            newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        }
        currentDate = newDate;
    }

    function goToToday() {
        currentDate = new Date();
    }

    function setView(view: ViewType) {
        currentView = view;
    }

    function openDetailModal(event: Event) {
        selectedEvent = event;
        showDetailModal = true;
    }

    function closeDetailModal() {
        showDetailModal = false;
        selectedEvent = null;
    }

    function generateWeekView() {
        if (!timeLabels || !calendarBody) {
            console.warn('DOM elements not ready for generateWeekView');
            return;
        }
        
        timeLabels.innerHTML = '';
        calendarBody.innerHTML = '';
        const weekDays = getWeekDays(currentDate);

        const headerRow = document.createElement('div');
        headerRow.className = 'week-header';
        weekDays.forEach(day => {
            const headerCell = document.createElement('div');
            headerCell.className = 'week-day-header';
            headerCell.innerHTML = `
                <div class="week-day-name">${WEEKDAY_NAMES[day.getDay()]}</div>
                <div class="week-day-number ${isToday(day) ? 'today' : ''}">${day.getDate()}</div>
            `;
            headerRow.appendChild(headerCell);
        });

        calendarBody.appendChild(headerRow);

        const timeSlotsContainer = document.createElement('div');
        timeSlotsContainer.className = 'week-time-slots';
        
        for (let hour = 0; hour < 24; hour++) {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = formatTime(hour);
            timeLabels.appendChild(timeLabel);

            weekDays.forEach((day) => {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.dataset.hour = String(hour);
                timeSlot.dataset.date = formatDate(day);
                timeSlot.addEventListener('click', () => openEventModal(hour, null, day));
                timeSlotsContainer.appendChild(timeSlot);
            });
        }
        
        calendarBody.appendChild(timeSlotsContainer);
    }

    function generateMonthView() {
        if (!calendarBody) {
            console.warn('DOM element not ready for generateMonthView');
            return;
        }
        
        calendarBody.innerHTML = '';
        const monthDays = getMonthDays(currentDate);
        
        const headerRow = document.createElement('div');
        headerRow.className = 'month-header';
        WEEKDAY_NAMES.forEach(name => {
            const headerCell = document.createElement('div');
            headerCell.className = 'month-day-header';
            headerCell.textContent = name;
            headerRow.appendChild(headerCell);
        });
        calendarBody.appendChild(headerRow);
        
        const grid = document.createElement('div');
        grid.className = 'month-grid';
        monthDays.forEach(day => {
            const cell = document.createElement('div');
            cell.className = `month-day-cell ${day.getMonth() !== currentDate.getMonth() ? 'other-month' : ''} ${isToday(day) ? 'today' : ''}`;
            cell.dataset.date = formatDate(day);
            cell.innerHTML = `<div class="month-day-number">${day.getDate()}</div><div class="month-day-events"></div>`;
            cell.addEventListener('click', (e) => {
                if ((e.target as HTMLElement).closest('.event')) return;
                currentDate = new Date(day);
                currentView = 'week';
            });
            grid.appendChild(cell);
        });
        calendarBody.appendChild(grid);
    }

    function isToday(date: Date): boolean {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    function formatTime(hour: number) {
        if(hour == 0) return '12 AM'
        if(hour < 12) return `${hour} AM`
        if(hour === 12) return '12 PM'
        return `${hour - 12} PM`
    }

    function formatTimeWithAmPm(timeString: string): string {
        const [hour, minute] = timeString.split(':');
        const hourNum = parseInt(hour, 10);
        const minNum = parseInt(minute, 10);
        const ampm = formatTime(hourNum);
        const minuteStr = minNum.toString().padStart(2, '0');
        return `${hourNum % 12 || 12}:${minuteStr} ${ampm.split(' ')[1]}`;
    }

    function setupEventListeners() {
        if (user) {
            addEventBtn?.addEventListener('click', () => openEventModal())
        }
        todayBtn?.addEventListener('click', goToToday)
        cancelBtn?.addEventListener('click', closeEventModal)
        prevBtn?.addEventListener('click', () => navigateDate('prev'))
        nextBtn?.addEventListener('click', () => navigateDate('next'))
        weekViewBtn?.addEventListener('click', () => setView('week'))
        monthViewBtn?.addEventListener('click', () => setView('month'))

        eventForm?.addEventListener('submit', saveEvent)

        eventModal?.addEventListener('click', (e) => {
            if(e.target && (e.target as HTMLElement).id === 'eventModal') closeEventModal()
        })
    }

    function openEventModal(hour: number | null = null, event: Event | null = null, date: Date | null = null) {
        closeDetailModal();
        if (!authState.isOfficer) {
            console.warn("Unauthorized: Only officers can create events.");
            return;
        } else {
            if (event) {
                if (modalTitle) modalTitle.textContent = 'Edit Event';
                if (eventTitle) eventTitle.value = event.title;
                if (eventDate) eventDate.value = event.date;
                if (eventStart) eventStart.value = event.startTime;
                if (eventEnd) eventEnd.value = event.endTime;
                if (eventDescription) eventDescription.value = event.description || '';
                isFeatured = event.featured || false;
                formColor = event.color;
                editingEventId = event.id;
            } else {
                if (modalTitle) modalTitle.textContent = 'Add New Event'
                if (eventTitle) eventTitle.value = '';
                if (eventDate) eventDate.value = date ? formatDate(date) : formatDate(currentDate);
                if (eventStart) eventStart.value = hour ? `${hour.toString().padStart(2, '0')}:00` : `09:00`
                if (eventEnd) eventEnd.value = hour ? `${(hour+1).toString().padStart(2, '0')}:00` : `10:00`
                if (eventDescription) eventDescription.value = '';
                isFeatured = false;
                formColor = 'blue';
                editingEventId = null;
            }

            eventModalOpen = true;
            if (eventTitle) eventTitle.focus();
        }

    }

    function closeEventModal() {
        eventModalOpen = false;
        editingEventId = null;
    }

    function handleGlobalKeydown(e: KeyboardEvent) {
        if (e.key !== 'Escape') return;
        if (eventModalOpen) closeEventModal();
        else if (showDetailModal) closeDetailModal();
    }

    async function saveEvent(e: SubmitEvent) {
        e.preventDefault();

        if (!authState.isOfficer) {
            alert("Unauthorized: only officers can create or modify events.")
            return;
        }

        const title = eventTitle?.value.trim() || '';
        const description = eventDescription?.value.trim() || '';
        const date = eventDate?.value || '';
        const startTime = eventStart?.value || '';
        const endTime = eventEnd?.value || '';
        const color = formColor || 'blue';
        const featured = isFeatured;

        if (!title || !date || !startTime || !endTime) {
            alert('Please fill in all required fields.')
            return;
        }

        if (startTime >= endTime) {
            alert('End time must be after start time.');
            return;
        }

        const eventData: Event = {
            id: editingEventId || Date.now().toString(),
            title,
            description: description || undefined,
            date,
            startTime,
            endTime,
            color,
            pin: editingEventId ? (events.find(e => e.id === editingEventId)?.pin) : generateEventPin(),
            featured
        }

        try {
            if(editingEventId) {
                await database.updateDocInFirebase(editingEventId, "events", eventData);
                const index = events.findIndex(event => event.id === editingEventId)
                if (index !== -1) {
                    events[index] = eventData;
                }
            } else {
                await database.addToFirebase(eventData, "events");
                events.push(eventData);
            }

            renderEvents();
            closeEventModal(); 
        } catch (error) {
            console.error("Failed to save event to Firestore: ", error);
        }
    }

    function renderEvents() {
        const existingEvents = document.querySelectorAll('.event')
        existingEvents.forEach(event => event.remove())

        if (currentView === 'week') {
            const weekDays = getWeekDays(currentDate);
            weekDays.forEach(day => {
                const dayEvents = events.filter(e => e.date === formatDate(day));
                dayEvents.forEach(event => renderWeekEvent(event, day));
            });
        } else {
            const monthDays = getMonthDays(currentDate);
            monthDays.forEach(day => {
                const dayEvents = events.filter(e => e.date === formatDate(day));
                dayEvents.forEach(event => renderMonthEvent(event, day));
            });
        }
    }

    function renderWeekEvent(event: Event, day: Date) {
        if (!calendarBody) return;

        const timeSlotsContainer = calendarBody.querySelector('.week-time-slots') as HTMLElement;
        const container = timeSlotsContainer || calendarBody;

        const weekDays = getWeekDays(currentDate);
        const dayIndex = weekDays.findIndex(d => formatDate(d) === formatDate(day));
        if (dayIndex === -1) return;

        const eventElement = document.createElement('div');
        eventElement.className = `event event-${event.color}`;
        const startTimeAmPm = formatTimeWithAmPm(event.startTime);
        const endTimeAmPm = formatTimeWithAmPm(event.endTime);
        eventElement.innerHTML = `<div class="event-title">${event.title}</div><div class="event-time">${startTimeAmPm} - ${endTimeAmPm}</div>`;
        eventElement.dataset.eventId = event.id;

        const startParts = event.startTime.split(':');
        const endParts = event.endTime.split(':');
        const startHour = parseInt(startParts[0], 10) || 0;
        const startMinute = parseInt(startParts[1], 10) || 0;
        const endHour = parseInt(endParts[0], 10) || 0;
        const endMinute = parseInt(endParts[1], 10) || 0;

        if (startHour < 0 || startHour >= 24) {
            return;
        }

        const pxPerHour = 60;
        const minutesFromMidnight = startHour * 60 + startMinute;
        const topPx = timeSlotsContainer ? minutesFromMidnight : minutesFromMidnight + 60;
        const durationMinutes = (endHour - startHour) * 60 + (endMinute - startMinute);
        const heightPx = Math.max(20, durationMinutes);

        const slotWidthPct = 100 / 7;
        eventElement.style.top = `${topPx}px`;
        eventElement.style.height = `${heightPx}px`;
        eventElement.style.left = `${dayIndex * slotWidthPct + 0.5}%`;
        eventElement.style.width = `${slotWidthPct - 1}%`;

        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailModal(event);
        });

        container.appendChild(eventElement);
    }

    function renderMonthEvent(event: Event, day: Date) {
        if (!calendarBody) return;
        
        const monthDays = getMonthDays(currentDate);
        const dayIndex = monthDays.findIndex(d => formatDate(d) === formatDate(day));
        if (dayIndex === -1) return;

        const cell = calendarBody.querySelector(`[data-date="${formatDate(day)}"]`);
        if (!cell) return;

        const eventsContainer = cell.querySelector('.month-day-events');
        if (!eventsContainer) return;

        const eventElement = document.createElement('div');
        eventElement.className = `event event-${event.color} month-event`;
        eventElement.textContent = event.title;
        eventElement.dataset.eventId = event.id;
        eventElement.title = `${event.title} (${event.startTime} – ${event.endTime})`;

        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            openDetailModal(event);
        });

        eventsContainer.appendChild(eventElement);
    }

    function renderCalendar() {
        if (currentView === 'month') {
            if (!calendarBody) {
                setTimeout(renderCalendar, 10);
                return;
            }
            generateMonthView();
            renderEvents();
            return;
        }

        if (!timeLabels || !calendarBody) {
            setTimeout(renderCalendar, 10);
            return;
        }

        generateWeekView();
        renderEvents();
        setTimeout(scrollToStartOfDay, 50);
    }

    $effect(() => {
        if (currentView && currentDate) {
            updateDateDisplay();
            tick().then(() => {
                if (currentView === 'week') {
                    const timeLabelsEl = document.getElementById('timeLabels') as HTMLDivElement;
                    const calendarBodyEl = document.getElementById('calendarBody') as HTMLDivElement;
                    if (timeLabelsEl) timeLabels = timeLabelsEl;
                    if (calendarBodyEl) calendarBody = calendarBodyEl;
                } else {
                    const calendarBodyEl = document.getElementById('calendarBody') as HTMLDivElement;
                    if (calendarBodyEl) calendarBody = calendarBodyEl;
                }
                renderCalendar();
            });
        }
    });

    function scrollToStartOfDay() {
    if (calendarContainer && currentView === 'week') {
        calendarContainer.scrollTop = 540; 
    }
}

    function handleTimeGridWheel(e: WheelEvent) {
        e.stopPropagation();
    }

    function handleTextareaWheel(e: WheelEvent) {
        e.stopPropagation();
    }

    async function handleDelete(event: Event) {
        if (!event) return;

        if (confirm("Are you sure you want to delete this event?")) {
            try {
                await database.deleteFromFirebase(event.id, "events");
                events = events.filter(evt => evt.id !== event.id);
                renderEvents();
                closeDetailModal();
            } catch (error) {
                console.error("Error deleting event:", error);
            }
        }
    }

    onMount(async () => {
        updateDateDisplay();
        setupEventListeners();

        try {
            const querySnapshot = await getDocs(collection(database.db, "events"));
            events = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title,
                    description: data.description,
                    date: data.date,
                    startTime: data.startTime,
                    endTime: data.endTime,
                    color: data.color,
                    pin: data.pin,
                    featured: data.featured || false 
                };
            }) as Event[];
        } catch (error) {
            console.error("Failed ot load events from database:", error);
        } finally {
            loadingEvents = false;
        }

        tick().then(() => {
            renderCalendar();
        });
    });

</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<div class="container">
    <div class="highlights">
        <div class="highlight-card upcoming-card">
            <div class="highlight-eyebrow">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                Upcoming Events
            </div>

            {#if loadingEvents}
                <p class="highlight-empty">Loading events…</p>
            {:else if upcomingEvents.length === 0}
                <p class="highlight-empty">Nothing on the calendar yet — check back soon.</p>
            {:else}
                <ul class="upcoming-list">
                    {#each upcomingEvents as ev (ev.id)}
                        <li>
                            <button type="button" class="upcoming-item" style="--swatch-color: {getColorMeta(ev.color).hex}" onclick={() => openDetailModal(ev)}>
                                <span class="upcoming-date-chip">
                                    <span class="upcoming-date-month">{parseDateOnly(ev.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span class="upcoming-date-day">{parseDateOnly(ev.date).getDate()}</span>
                                </span>
                                <span class="upcoming-info">
                                    <span class="upcoming-title">{ev.title}</span>
                                    <span class="upcoming-time">{formatTimeWithAmPm(ev.startTime)} – {formatTimeWithAmPm(ev.endTime)}</span>
                                </span>
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>

        <div class="highlight-card featured-card">
            <span class="featured-badge">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.7 6.9L12 17.3 5.7 20.8l1.7-6.9L2 9.2l7.1-.6L12 2z"/></svg>
                Featured
            </span>
            {#if featuredEvent}
                <h2 class="featured-title">{featuredEvent.title}</h2>
                <p class="featured-meta">{parseDateOnly(featuredEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <p class="featured-desc">{featuredEvent.description || 'Join us for this upcoming event!'}</p>
                <button type="button" class="featured-cta" onclick={() => openDetailModal(featuredEvent)} style="border:none; cursor:pointer; font-family:inherit;">
                    View details
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                </button>
            {:else}
                <h2 class="featured-title">No Featured Events</h2>
                <p class="featured-desc">Check back later for major upcoming events.</p>
            {/if}
        </div>
    </div>

    <div class="toolbar">
        <div class="toolbar-brand">
            <div class="cal-badge" aria-hidden="true">
                <div class="cal-badge-tabs">
                    <span class="tab tab-blue"></span>
                    <span class="tab tab-green"></span>
                    <span class="tab tab-yellow"></span>
                    <span class="tab tab-red"></span>
                </div>
                <div class="cal-badge-date">{new Date().getDate()}</div>
            </div>
            <div class="toolbar-titles">
                <h1>GDG Event Calendar</h1>
                <div class="date-display" id="dateDisplay">{dateDisplay}</div>
            </div>
        </div>

        <div class="toolbar-nav">
            <button class="btn btn-today" id="todayBtn" bind:this={todayBtn}>Today</button>
            <div class="nav-arrows">
                <button class="btn btn-nav" id="prevBtn" bind:this={prevBtn} aria-label="Previous {currentView}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button class="btn btn-nav" id="nextBtn" bind:this={nextBtn} aria-label="Next {currentView}">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
            </div>
        </div>

        <div class="toolbar-actions">
            <div class="view-switcher" role="group" aria-label="Calendar view">
                <button class="btn btn-view {currentView === 'week' ? 'active' : ''}" id="weekViewBtn" bind:this={weekViewBtn} aria-pressed={currentView === 'week'}>Week</button>
                <button class="btn btn-view {currentView === 'month' ? 'active' : ''}" id="monthViewBtn" bind:this={monthViewBtn} aria-pressed={currentView === 'month'}>Month</button>
            </div>
            {#if user}
                <button class="btn btn-create" id="addEventBtn" bind:this={addEventBtn}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                    <span>Create</span>
                </button>
            {/if}
        </div>
    </div>

    <div class="calendar-container {currentView === 'week' ? 'week-view' : ''}" bind:this={calendarContainer}>
        {#if currentView === 'week'}
            <div class="time-grid week-view" bind:this={timeGrid} onwheel={handleTimeGridWheel}>
                <div class="time-labels week-labels" id="timeLabels" bind:this={timeLabels}></div>
                <div class="calendar-body week-body" id="calendarBody" bind:this={calendarBody}></div>
            </div>
        {:else}
            <div class="month-container">
                <div class="calendar-body month-body" id="calendarBody" bind:this={calendarBody}></div>
            </div>
        {/if}
    </div>
</div>

{#if showDetailModal && selectedEvent}
    <div class="modal detail-modal" role="dialog" tabindex="-1" aria-modal="true" aria-labelledby="detailModalTitle" onclick={(e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('detail-modal')) closeDetailModal();
    }} onkeydown={(e) => {
        if (e.key === 'Escape') closeDetailModal();
    }}>
        <div class="modal-content detail-modal-content">
            <div class="modal-header">
                <h3 id="detailModalTitle">{selectedEvent.title}</h3>
                <button class="btn-close" onclick={closeDetailModal} aria-label="Close event details">×</button>
            </div>
            <div class="detail-body">
                <div class="detail-row">
                    <strong>Date:</strong>
                    <span>{parseDateOnly(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                    <strong>Time:</strong>
                    <span>{formatTimeWithAmPm(selectedEvent.startTime)} – {formatTimeWithAmPm(selectedEvent.endTime)}</span>
                </div>
                <div class="detail-row">
                    <div class="color-value">
                        <span class="detail-label">Color:</span>
                        <div class="color-dot" style="background-color: {getColorMeta(selectedEvent.color).hex};"></div> 
                        <span>{getColorMeta(selectedEvent.color).label}</span>
                    </div>
                </div>
                {#if selectedEvent.description}
                    <div class="detail-section">
                        <strong>Description</strong>
                        <p>{selectedEvent.description}</p>
                    </div>
                {/if}
            </div>
            <div class="modal-actions">
            {#if authState.isOfficer}<button type="button" class="btn btn-primary" onclick={() => selectedEvent && openEventModal(null, selectedEvent)}>Edit</button>
                <button type="button" class="btn btn-delete" onclick={() => selectedEvent && handleDelete(selectedEvent)}>Delete</button>
            {/if}
            </div>
        </div>
    </div>
{/if}

<div class="modal {eventModalOpen ? 'open' : ''}" id="eventModal" bind:this={eventModal} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-content">
        <h3 id="modalTitle" bind:this={modalTitle}>Add New Event</h3>
        <form id="eventForm" bind:this={eventForm}>
            <div class="form-group">
                <label for="eventTitle">Event Title</label>
                <input type="text" id="eventTitle" placeholder="Enter Event Title" bind:this={eventTitle} required>
            </div>
            
            <div class="form-group">
                <label for="eventDate">Date</label>
                <input type="date" id="eventDate" bind:this={eventDate} required>
            </div>
            
            <div class="form-group">
                <label for="eventStart">Start Time</label>
                <input type="time" id="eventStart" bind:this={eventStart} required>
            </div>
            
            <div class="form-group">
                <label for="eventEnd">End Time</label>
                <input type="time" id="eventEnd" bind:this={eventEnd} required>
            </div>

            <div class="form-group">
                <label for="eventDescription">Description</label>
                <textarea id="eventDescription" placeholder="Enter event description (optional)" bind:this={eventDescription} rows="4" onwheel={handleTextareaWheel}></textarea>
            </div>

            <div class="form-group checkbox-group">
                <input 
                    type="checkbox" 
                    id="eventFeatured" 
                    bind:checked={isFeatured}
                    style="appearance: auto; -webkit-appearance: checkbox;"
                >
                <label for="eventFeatured">Mark as featured event</label>
            </div>

            <div class="form-group">
                <span class="swatch-label" id="eventColorLabel">Event Color</span>
                <div class="swatch-row" role="radiogroup" aria-labelledby="eventColorLabel">
                    {#each EVENT_COLORS as c (c.key)}
                        <button
                            type="button"
                            class="color-swatch {formColor === c.key ? 'selected' : ''}"
                            style="--swatch-color: {c.hex}"
                            role="radio"
                            aria-checked={formColor === c.key}
                            aria-label={c.label}
                            title={c.label}
                            onclick={() => formColor = c.key}
                        >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        </button>
                    {/each}
                </div>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" id="cancelBtn" bind:this={cancelBtn}>Cancel</button>
                <button type="submit" class="btn btn-primary" id="saveBtn" bind:this={saveBtn}>Save Event</button>
            </div>
        </form>
    </div>
</div>

<style>
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :global(:root) {
        --gcal-surface: var(--color-background-secondary-light, #ffffff);
        --gcal-surface-muted: #f8f9fa;
        --gcal-outline: #e3e6ea;
        --gcal-outline-soft: #eef0f3;
        --gcal-text: var(--color-primary-text, #1c1b1d);
        --gcal-text-muted: #5f6368;
        --gcal-primary: var(--color-primary-color, #9f86ff);
        --gcal-primary-tint-1: rgba(159, 134, 255, 0.08);
        --gcal-primary-tint-2: rgba(159, 134, 255, 0.16);
        --gcal-primary-tint-3: rgba(159, 134, 255, 0.32);
        --gcal-shadow-1: 0 1px 2px rgba(60, 64, 67, 0.10), 0 1px 3px rgba(60, 64, 67, 0.12);
        --gcal-shadow-2: 0 2px 6px rgba(60, 64, 67, 0.14), 0 1px 2px rgba(60, 64, 67, 0.10);
        --gcal-shadow-3: 0 8px 24px rgba(60, 64, 67, 0.20), 0 2px 6px rgba(60, 64, 67, 0.12);
    }

    :global(.dark) {
        --gcal-surface: var(--color-background-secondary-dark, #373740);
        --gcal-surface-muted: rgba(255, 255, 255, 0.04);
        --gcal-outline: rgba(255, 255, 255, 0.12);
        --gcal-outline-soft: rgba(255, 255, 255, 0.07);
        --gcal-text: var(--color-primary-text-dark, #ffffff);
        --gcal-text-muted: #9aa0a6;
        --gcal-primary-tint-1: rgba(159, 134, 255, 0.14);
        --gcal-primary-tint-2: rgba(159, 134, 255, 0.24);
        --gcal-primary-tint-3: rgba(159, 134, 255, 0.4);
        --gcal-shadow-1: 0 1px 2px rgba(0, 0, 0, 0.3);
        --gcal-shadow-2: 0 2px 6px rgba(0, 0, 0, 0.4);
        --gcal-shadow-3: 0 8px 28px rgba(0, 0, 0, 0.55);
    }

    .container {
        max-width: 98dvw;
        margin: 0 auto;
        padding: 20px;
        margin-top: 6vmin;
        color: var(--gcal-text);
    }

    .highlights {
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
        align-items: stretch;
    }

    .highlight-card {
        background: var(--gcal-surface);
        border-radius: 20px;
        padding: 20px 22px;
        box-shadow: var(--gcal-shadow-1);
    }

    .highlight-eyebrow {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.02em;
        color: var(--gcal-text-muted);
        margin-bottom: 14px;
    }

    .highlight-empty {
        font-size: 14px;
        color: var(--gcal-text-muted);
        padding: 8px 0 4px;
    }

    .upcoming-list {
        list-style: none;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .upcoming-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 8px;
        border: none;
        background: transparent;
        border-radius: 12px;
        cursor: pointer;
        font-family: inherit;
        text-align: left;
        transition: background-color 0.15s ease;
    }

    .upcoming-item:hover {
        background: var(--gcal-surface-muted);
    }

    .upcoming-item:focus-visible {
        outline: 2px solid var(--gcal-primary);
        outline-offset: 2px;
    }

    .upcoming-date-chip {
        flex-shrink: 0;
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: var(--swatch-color);
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        line-height: 1.1;
    }

    .upcoming-date-month {
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        opacity: 0.9;
    }

    .upcoming-date-day {
        font-size: 16px;
        font-weight: 700;
    }

    .upcoming-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
    }

    .upcoming-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--gcal-text);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .upcoming-time {
        font-size: 12px;
        color: var(--gcal-text-muted);
    }

    .featured-card {
        display: flex;
        flex-direction: column;
        background: linear-gradient(155deg, var(--gcal-primary-tint-2), var(--gcal-surface) 55%);
        border: 1px solid var(--gcal-primary-tint-3);
    }

    .featured-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        align-self: flex-start;
        background: var(--gcal-primary);
        color: white;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        padding: 5px 12px;
        border-radius: 999px;
        margin-bottom: 12px;
    }

    .featured-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--gcal-text);
        letter-spacing: -0.01em;
        margin-bottom: 4px;
    }

    .featured-meta {
        font-size: 13px;
        font-weight: 500;
        color: var(--gcal-primary);
        margin-bottom: 10px;
    }

    .featured-desc {
        font-size: 13px;
        line-height: 1.5;
        color: var(--gcal-text-muted);
        margin-bottom: 16px;
        flex-grow: 1;
    }

    .featured-cta {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--gcal-primary);
        color: white;
        font-size: 13px;
        font-weight: 600;
        text-decoration: none;
        padding: 9px 16px;
        border-radius: 999px;
        box-shadow: var(--gcal-shadow-1);
        transition: box-shadow 0.15s ease, transform 0.1s ease;
    }

    .featured-cta:hover {
        box-shadow: var(--gcal-shadow-2);
        transform: translateY(-1px);
    }

    .featured-cta:focus-visible {
        outline: 2px solid var(--gcal-text);
        outline-offset: 2px;
    }

    /* ---------- Toolbar ---------- */

    .toolbar {
        background: var(--gcal-surface);
        border-radius: 20px;
        padding: 14px 20px;
        margin-bottom: 16px;
        box-shadow: var(--gcal-shadow-1);
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
    }

    .toolbar-brand {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-right: auto;
    }

    .cal-badge {
        width: 38px;
        height: 38px;
        border-radius: 9px;
        background: var(--gcal-surface);
        border: 1px solid var(--gcal-outline);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: var(--gcal-shadow-1);
    }

    .cal-badge-tabs {
        display: flex;
        height: 9px;
        flex-shrink: 0;
    }

    .cal-badge-tabs .tab {
        flex: 1;
    }

    .tab-blue { background: #4285f4; }
    .tab-green { background: #34a853; }
    .tab-yellow { background: #fbbc05; }
    .tab-red { background: #ea4335; }

    .cal-badge-date {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 700;
        color: #ea4335;
        line-height: 1;
    }

    .toolbar-titles {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .toolbar-titles h1 {
        font-size: 18px;
        font-weight: 600;
        color: var(--gcal-text);
        letter-spacing: -0.01em;
        line-height: 1.2;
    }

    .toolbar-nav {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .date-display {
        font-size: 13px;
        color: var(--gcal-text-muted);
        font-weight: 500;
    }

    .toolbar-titles .date-display {
        font-size: 13px;
    }

    .nav-arrows {
        display: flex;
        align-items: center;
        gap: 2px;
    }

    .toolbar-actions {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-left: auto;
    }

    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 999px;
        font-size: 14px;
        font-weight: 500;
        font-family: inherit;
        cursor: pointer;
        transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        white-space: nowrap;
    }

    .btn:focus-visible {
        outline: 2px solid var(--gcal-primary);
        outline-offset: 2px;
    }

    .btn-today {
        background: transparent;
        color: var(--gcal-text-muted);
        border: 1px solid var(--gcal-outline);
        padding: 7px 16px;
    }

    .btn-today:hover {
        background: var(--gcal-surface-muted);
        color: var(--gcal-text);
    }

    .btn-nav {
        background: transparent;
        border: none;
        border-radius: 50%;
        width: 34px;
        height: 34px;
        padding: 0;
        color: var(--gcal-text-muted);
    }

    .btn-nav:hover {
        background: var(--gcal-surface-muted);
        color: var(--gcal-text);
    }

    .view-switcher {
        display: flex;
        gap: 2px;
        background: var(--gcal-surface-muted);
        border: 1px solid var(--gcal-outline-soft);
        padding: 3px;
        border-radius: 999px;
    }

    .btn-view {
        padding: 6px 16px;
        background: transparent;
        border: none;
        border-radius: 999px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
        color: var(--gcal-text-muted);
    }

    .btn-view:hover {
        color: var(--gcal-text);
    }

    .btn-view.active {
        background-color: var(--gcal-surface);
        color: var(--gcal-primary);
        box-shadow: var(--gcal-shadow-1);
        font-weight: 600;
    }

    .btn-create {
        background-color: var(--gcal-primary);
        color: white;
        padding: 10px 20px 10px 16px;
        box-shadow: var(--gcal-shadow-2);
        font-weight: 600;
    }

    .btn-create:hover {
        box-shadow: var(--gcal-shadow-3);
        transform: translateY(-1px);
    }

    .btn-primary {
        background-color: var(--gcal-primary);
        color: white;
    }

    .btn-primary:hover {
        filter: brightness(1.06);
        transform: translateY(-1px);
    }

    .btn-secondary {
        background-color: var(--gcal-surface-muted);
        color: var(--gcal-text-muted);
        border: 1px solid var(--gcal-outline);
    }

    .btn-secondary:hover {
        background-color: var(--gcal-outline-soft);
    }

    .btn-delete {
        background-color: #d93025;
        color: white;
    }

    .btn-delete:hover {
        filter: brightness(1.08);
    }

    .calendar-container {
        background: var(--gcal-surface);
        border-radius: 20px;
        box-shadow: var(--gcal-shadow-1);
        overflow: hidden;
    }

    :global(.calendar-container.week-view) {
        position: relative;
        display: block !important;
        background: var(--gcal-surface);
        border: 1px solid var(--gcal-outline);
        box-sizing: border-box;
    }

    .time-grid {
        min-height: 600px;
    }

    :global(.time-grid.week-view) {
        display: flex !important;
        flex-direction: row;
        height: 70vh;
        overflow-y: auto;
        overflow-x: hidden;
        width: 100%;
        max-width: 100%;
        scrollbar-gutter: stable;
        min-height: 0 !important;
    }

    .time-labels {
        background-color: var(--gcal-surface);
        border-right: 1px solid var(--gcal-outline);
    }

    :global(.time-labels.week-labels) {
        padding-top: 60px;
        display: flex;
        flex-direction: column;
        width: 80px;
        min-width: 80px;
        flex-shrink: 0;
        height: 1500px !important;
    }

    :global(.time-label) {
        height: 60px;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        transform: translateY(-6px);
        font-size: 11px;
        color: var(--gcal-text-muted);
        font-weight: 500;
        flex-shrink: 0;
    }

    .calendar-body {
        position: relative;
        background: var(--gcal-surface);
    }

    :global(.calendar-body.week-body) {
        position: relative;
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        min-width: 0;
        height: 1500px;
    }

    :global(.week-header) {
        position: sticky;
        top: 0;
        z-index: 50;
        background: var(--gcal-surface);
        border-bottom: 1px solid var(--gcal-outline);
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        width: 100%;
        height: 60px;
        box-sizing: border-box;
    }

    :global(.week-time-slots) {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        position: relative;
        height: 1500px;
        background-image: repeating-linear-gradient(
            to bottom,
            var(--gcal-outline-soft) 0,
            var(--gcal-outline-soft) 1px,
            transparent 1px,
            transparent 60px
        );
    }

    :global(.week-day-header) {
        height: 60px;
        padding: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-right: 1px solid var(--gcal-outline-soft);
    }

    :global(.week-day-header:last-child) {
        border-right: none;
    }

    :global(.week-day-name) {
        font-size: 11px;
        color: var(--gcal-text-muted);
        font-weight: 600;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin-bottom: 4px;
    }

    :global(.week-day-number) {
        font-size: 16px;
        color: var(--gcal-text);
        font-weight: 500;
    }

    :global(.week-day-number.today) {
        background-color: var(--gcal-primary);
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
        font-weight: 700;
    }

    :global(.time-slot) {
        height: 60px;
        border-right: 1px solid var(--gcal-outline-soft);
        position: relative;
        cursor: pointer;
        transition: background-color 0.15s ease;
    }

    :global(.week-time-slots :global(.time-slot:nth-child(7n))) {
        border-right: none;
    }

    :global(.time-slot:hover) {
        background-color: var(--gcal-primary-tint-1);
    }

    .month-container {
        padding: 16px;
    }

    .month-body {
        display: flex;
        flex-direction: column;
    }

    :global(.month-header) {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        background: var(--gcal-surface);
        border-bottom: 1px solid var(--gcal-outline);
        position: sticky;
        top: 0;
        z-index: 20;
    }

    :global(.month-day-header) {
        padding: 10px;
        text-align: center;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.04em;
        color: var(--gcal-text-muted);
        text-transform: uppercase;
    }

    :global(.month-grid) {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: 1fr;
        gap: 1px;
        background: var(--gcal-outline-soft);
        border: 1px solid var(--gcal-outline-soft);
    }

    :global(.month-day-cell) {
        --cell-bg: var(--gcal-surface);
        background: var(--cell-bg);
        height: 100px;
        padding: 6px 6px 8px;
        cursor: pointer;
        transition: background-color 0.15s ease;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    :global(.month-day-cell:hover) {
        background: var(--gcal-primary-tint-1);
    }

    :global(.month-day-cell.other-month) {
        --cell-bg: var(--gcal-surface);
        background: var(--cell-bg);
        color: var(--gcal-text-muted);
        opacity: 0.5;
    }

    :global(.month-day-cell.today) {
        --cell-bg: var(--gcal-primary-tint-1);
        background: var(--cell-bg);
    }

    :global(.month-day-number) {
        font-size: 12px;
        font-weight: 600;
        color: var(--gcal-text);
        margin-bottom: 4px;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
    }

    :global(.month-day-events) {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
        position: relative;
    }

    :global(.month-day-events:has(.event:nth-child(n+4)))::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 24px;
        background: linear-gradient(to top, var(--cell-bg, var(--gcal-surface)), transparent);
        pointer-events: none;
        z-index: 5;
    }

    :global(.month-day-cell.other-month .month-day-number) {
        color: var(--gcal-text-muted);
    }

    :global(.month-day-cell.today .month-day-number) {
        background: var(--gcal-primary);
        color: white;
        font-weight: 700;
    }

    :global(.event) {
        border-radius: 4px;
        padding: 3px 7px;
        font-size: 11px;
        font-weight: 500;
        color: white;
        cursor: pointer;
        transition: filter 0.15s ease, box-shadow 0.15s ease;
        overflow: hidden;
        z-index: 10;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    :global(.event:not(.month-event)) {
        position: absolute;
        left: 4px;
        right: 4px;
        border-radius: 6px;
        padding: 4px 8px;
    }

    :global(.event:hover) {
        filter: brightness(1.08);
        box-shadow: var(--gcal-shadow-2);
    }

    :global(.event-blue) { background-color: #039be5; }
    :global(.event-green) { background-color: #0b8043; }
    :global(.event-purple) { background-color: #8e24aa; }
    :global(.event-orange) { background-color: #f4511e; }
    :global(.event-red) { background-color: #d50000; }

    :global(.month-event) {
        position: relative;
        flex-shrink: 0;
        padding: 3px 7px;
        font-size: 11px;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    :global(.event-title) {
        font-weight: 600;
        font-size: 11px;
    }

    :global(.event-time) {
        font-size: 10px;
        opacity: 0.9;
        margin-top: 1px;
    }

    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(32, 33, 36, 0.5);
        z-index: 1000;
        backdrop-filter: blur(3px);
    }

    .modal.open,
    .modal.detail-modal {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    @keyframes gcalScrimIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes gcalDialogIn {
        from { opacity: 0; transform: translateY(8px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .modal.open,
    .modal.detail-modal {
        animation: gcalScrimIn 0.15s ease;
    }

    .modal-content {
        position: relative;
        background: var(--gcal-surface);
        color: var(--gcal-text);
        border-radius: 24px;
        padding: 28px;
        width: 90%;
        max-width: 420px;
        box-shadow: var(--gcal-shadow-3);
        animation: gcalDialogIn 0.18s cubic-bezier(0.2, 0, 0, 1);
    }

    @media (prefers-reduced-motion: reduce) {
        .modal.open, .modal.detail-modal, .modal-content {
            animation: none;
        }
    }

    .modal h3 {
        margin-bottom: 20px;
        color: var(--gcal-text);
        font-size: 18px;
        font-weight: 600;
    }

    .form-group {
        margin-bottom: 16px;
    }

    .form-group label,
    .swatch-label {
        display: block;
        margin-bottom: 6px;
        color: var(--gcal-text-muted);
        font-weight: 500;
        font-size: 13px;
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid var(--gcal-outline);
        border-radius: 8px;
        font-size: 14px;
        font-family: inherit;
        color: var(--gcal-text);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        background-color: var(--gcal-surface);
    }

    .form-group textarea {
        overflow-y: auto;
        resize: vertical;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: var(--gcal-primary);
        box-shadow: 0 0 0 3px var(--gcal-primary-tint-2);
    }

    .swatch-row {
        display: flex;
        gap: 10px;
        padding-top: 2px;
    }

    .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: var(--swatch-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.12s ease, box-shadow 0.12s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .color-swatch svg {
        opacity: 0;
        transition: opacity 0.1s ease;
    }

    .color-swatch:hover {
        transform: scale(1.1);
    }

    .color-swatch.selected {
        box-shadow: 0 0 0 2px var(--gcal-surface), 0 0 0 4px var(--swatch-color);
    }

    .color-swatch.selected svg {
        opacity: 1;
    }

    .color-swatch:focus-visible {
        outline: 2px solid var(--gcal-primary);
        outline-offset: 3px;
    }

    .modal-actions {
        display: flex;
        gap: 10px;
        margin-top: 25px;
    }

    .modal-actions .btn {
        flex: 1;
        justify-content: center;
    }

    .detail-modal-content {
        max-width: 400px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        gap: 12px;
    }

    .modal-header h3 {
        margin: 0;
        color: var(--gcal-text);
        font-size: 20px;
        font-weight: 600;
    }

    .btn-close {
        background: transparent;
        border: none;
        font-size: 24px;
        line-height: 1;
        color: var(--gcal-text-muted);
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.15s ease;
    }

    .btn-close:hover {
        background: var(--gcal-surface-muted);
        color: var(--gcal-text);
    }

    .detail-body {
        margin-bottom: 20px;
    }

    .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 0;
        border-bottom: 1px solid var(--gcal-outline-soft);
    }

    .detail-row strong {
        color: var(--gcal-text-muted);
        font-weight: 600;
        font-size: 13px;
        margin-right: 20px;
        flex-shrink: 0;
    }

    .detail-row span {
        color: var(--gcal-text);
        font-size: 14px;
        flex: 1;
    }

    .detail-section {
        margin-top: 16px;
        padding-top: 0;
        border-top: none;
    }

    .detail-section strong {
        display: block;
        color: var(--gcal-text-muted);
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 13px;
    }

    .detail-section p {
        margin: 0;
        color: var(--gcal-text);
        line-height: 1.6;
        font-size: 14px;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: pre-wrap;
    }

    @media (width < 54rem) {
        .container {
            padding: 10px;
        }

        .highlights {
            grid-template-columns: 1fr;
        }

        .toolbar {
            margin-top: 45px;
            flex-direction: column;
            align-items: stretch;
            border-radius: 16px;
        }

        .toolbar-brand {
            margin-right: 0;
        }

        .toolbar-nav {
            justify-content: space-between;
        }

        .toolbar-actions {
            margin-left: 0;
            justify-content: space-between;
        }

        .view-switcher {
            flex: 1;
        }

        .btn-view {
            flex: 1;
        }

        .time-grid.week-view {
            display: flex;
            height: 1500px;
        }

        :global(.time-labels.week-labels) {
            width: 52px;
            min-width: 52px;
        }

        :global(.month-day-cell) {
            min-height: 60px;
        }

        .modal-content {
            padding: 20px;
            width: 95%;
            border-radius: 20px;
        }

        :global(.month-event) {
            width: 6px;
            height: 6px;
            min-width: 6px;
            min-height: 6px;
            padding: 0;
            border-radius: 999px;
            flex: 0 0 6px;
            text-indent: -9999px;
        }
    }

    .form-group.checkbox-group {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .form-group.checkbox-group label {
        margin-bottom: 0;
        cursor: pointer;
    }

    .form-group.checkbox-group input {
        width: 18px;
        height: 18px;
        cursor: pointer;
        margin: 0;
    }
    .color-value {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .color-dot {
        width: 16px; 
        height: 16px;
        border-radius: 50%; 
        flex-shrink: 0;
        display: block;
        margin-left: 20px;
    }
</style>