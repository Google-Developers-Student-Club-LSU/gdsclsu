<script lang="ts">
    import { onMount, tick } from "svelte";
    
    type ViewType = 'week' | 'month';
    type Event = { id: string; title: string; description?: string; date: string; startTime: string; endTime: string; color: string; }

    let timeLabels: HTMLDivElement | undefined = $state(undefined);
    let calendarBody: HTMLDivElement | undefined = $state(undefined);
    let addEventBtn: HTMLButtonElement | undefined = $state(undefined);
    let todayBtn: HTMLButtonElement | undefined = $state(undefined);
    let clearBtn: HTMLButtonElement | undefined = $state(undefined);
    let cancelBtn: HTMLButtonElement | undefined = $state(undefined);
    let saveBtn: HTMLButtonElement | undefined = $state(undefined);
    let eventForm: HTMLFormElement | undefined = $state(undefined);
    let eventModal: HTMLDivElement | undefined = $state(undefined);
    let detailModal: HTMLDivElement | undefined = $state(undefined);
    let modalTitle: HTMLHeadingElement | undefined = $state(undefined);
    let eventTitle: HTMLInputElement | undefined = $state(undefined);
    let eventDate: HTMLInputElement | undefined = $state(undefined);
    let eventStart: HTMLInputElement | undefined = $state(undefined);
    let eventEnd: HTMLInputElement | undefined = $state(undefined);
    let eventDescription: HTMLTextAreaElement | undefined = $state(undefined);
    let eventColor: HTMLSelectElement | undefined = $state(undefined);
    let calendarContainer: HTMLDivElement | undefined = $state(undefined);
    let prevBtn: HTMLButtonElement | undefined = $state(undefined);
    let nextBtn: HTMLButtonElement | undefined = $state(undefined);
    let weekViewBtn: HTMLButtonElement | undefined = $state(undefined);
    let monthViewBtn: HTMLButtonElement | undefined = $state(undefined);
    let timeGrid: HTMLDivElement | undefined = $state(undefined);

    let events: Event[] = []
    let editingEventId: string | null = null;
    let selectedEvent: Event | null = $state(null);
    let showDetailModal: boolean = $state(false);
    let currentView: ViewType = $state('week');
    let currentDate: Date = $state(new Date());
    let dateDisplay = $state("");

    function formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
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
        addEventBtn?.addEventListener('click', () => openEventModal())
        todayBtn?.addEventListener('click', goToToday)
        clearBtn?.addEventListener('click', clearAllEvents)
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
        if (event) {
            if (modalTitle) modalTitle.textContent = 'Edit Event';
            if (eventTitle) eventTitle.value = event.title;
            if (eventDate) eventDate.value = event.date;
            if (eventStart) eventStart.value = event.startTime;
            if (eventEnd) eventEnd.value = event.endTime;
            if (eventDescription) eventDescription.value = event.description || '';
            if (eventColor) eventColor.value = event.color;
            editingEventId = event.id;
        } else {
            if (modalTitle) modalTitle.textContent = 'Add New Event'
            if (eventTitle) eventTitle.value = '';
            if (eventDate) eventDate.value = date ? formatDate(date) : formatDate(currentDate);
            if (eventStart) eventStart.value = hour ? `${hour.toString().padStart(2, '0')}:00` : `09:00`
            if (eventEnd) eventEnd.value = hour ? `${(hour+1).toString().padStart(2, '0')}:00` : `10:00`
            if (eventDescription) eventDescription.value = '';
            if (eventColor) eventColor.value = 'blue';
            editingEventId = null;
        }

        if (eventModal) {
            eventModal.style.display = 'flex';
            eventModal.style.alignItems = 'center';
            eventModal.style.justifyContent = 'center';
        }
        if (eventTitle) eventTitle.focus();
    }

    function closeEventModal() {
        if (eventModal) eventModal.style.display = 'none';
        editingEventId = null;
    }

    function saveEvent(e: SubmitEvent) {
        e.preventDefault();

        const title = eventTitle?.value.trim() || '';
        const description = eventDescription?.value.trim() || '';
        const date = eventDate?.value || '';
        const startTime = eventStart?.value || '';
        const endTime = eventEnd?.value || '';
        const color = eventColor?.value || 'blue';

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
            color
        }

        if(editingEventId) {
            const index = events.findIndex(event => event.id === editingEventId)
            if (index !== -1) {
                events[index] = eventData;
            }
        } else {
            events.push(eventData);
        }

        renderEvents();
        closeEventModal();
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

        eventElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${event.title}"?`)) {
                deleteEvent(event.id);
            }
        });

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

        eventElement.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            if (confirm(`Delete "${event.title}"?`)) {
                deleteEvent(event.id);
            }
        });

        eventsContainer.appendChild(eventElement);
    }

    function deleteEvent(eventId: string) {
        events = events.filter(event => event.id !== eventId);
        renderEvents();
    }

    function clearAllEvents() {
        if (events.length > 0 && confirm('Are you sure you want to clear all events?')) {
            events = [];
            renderEvents();
        }
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

    onMount(() => {
        updateDateDisplay();
        setupEventListeners();
        tick().then(() => {
            renderCalendar();
        });
    });

</script>

<div class="container">
    <div class="header">
        <h1>GDSC Event Calendar</h1>
        <div class="header-controls">
            <div class="view-switcher">
                <button class="btn btn-view {currentView === 'week' ? 'active' : ''}" id="weekViewBtn" bind:this={weekViewBtn}>Week</button>
                <button class="btn btn-view {currentView === 'month' ? 'active' : ''}" id="monthViewBtn" bind:this={monthViewBtn}>Month</button>
            </div>
            <div class="date-navigation">
                <button class="btn btn-nav" id="prevBtn" bind:this={prevBtn}>‹</button>
                <div class="date-display" id="dateDisplay">{dateDisplay}</div>
                <button class="btn btn-nav" id="nextBtn" bind:this={nextBtn}>›</button>
            </div>
        </div>
    </div>

    <div class="controls">
        <button class="btn btn-primary" id="addEventBtn" bind:this={addEventBtn}>+ Add Event</button>
        <button class="btn btn-primary" id="todayBtn" bind:this={todayBtn}>Today</button>
        <button class="btn btn-primary" id="clearBtn" bind:this={clearBtn}>Clear All</button>
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
                    <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div class="detail-row">
                    <strong>Time:</strong>
                    <span>{selectedEvent.startTime} – {selectedEvent.endTime}</span>
                </div>
                <div class="detail-row">
                    <strong>Color:</strong>
                    <span>
                        {selectedEvent.color}
                    </span>
                </div>
                {#if selectedEvent.description}
                    <div class="detail-section">
                        <strong>Description</strong>
                        <p>{selectedEvent.description}</p>
                    </div>
                {/if}
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick={closeDetailModal}>Close</button>
                <button type="button" class="btn btn-primary" onclick={() => openEventModal(null, selectedEvent)}>Edit</button>
            </div>
        </div>
    </div>
{/if}

<div class="modal" id="eventModal" bind:this={eventModal}>
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

            <div class="form-group">
                <label for="eventColor">Event Color</label>
                <select id="eventColor" bind:this={eventColor}>
                    <option value="red">Red</option>
                    <option value="orange">Orange</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="purple">Purple</option>
                </select>
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

    .container {
        max-width: 98dvw;
        margin: 0 auto;
        padding: 20px;
        margin-top: 6vmin;
    }

    .header {
        background: white;
        border-radius: 12px;
        padding: 20px 30px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
    }

    .header h1 {
        font-size: 24px;
        font-weight: 600;
        color: #0f172a;
    }

    .header-controls {
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
    }

    .view-switcher {
        display: flex;
        gap: 5px;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 8px;
    }

    .btn-view {
        padding: 6px 16px;
        background: transparent;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #64748b;
    }

    .btn-view:hover {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
    }

    .btn-view.active {
        background: #3b82f6;
        color: white;
    }

    .date-navigation {
        display: flex;
        align-items: center;
        gap: 15px;
    }

    .btn-nav {
        padding: 6px 12px;
        background: #f1f5f9;
        border: none;
        border-radius: 6px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #475569;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .btn-nav:hover {
        background: #e2e8f0;
        color: #0f172a;
    }

    .date-display {
        font-size: 16px;
        color: #64748b;
        font-weight: 500;
        min-width: 200px;
        text-align: center;
    }

    .controls {
        background: white;
        border-radius: 12px;
        padding: 20px 30px;
        margin-bottom: 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
    }

    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .btn-primary {
        background-color: #3b82f6;
        color: white;
    }

    .btn-primary:hover {
        background-color: #2563eb;
        transform: translateY(-1px);
    }

    .btn-secondary {
        background-color: #f1f5f9;
        color: #475569;
        border: 1px solid #e2e8f0;
    }

    .btn-secondary:hover {
        background-color: #e2e8f0;
        transform: translateY(-1px);
    }

    .calendar-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    :global(.calendar-container.week-view) {
        position: relative;
        display: block !important;
        background: white;
        border: 1px solid #e2e8f0;
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
        background-color: #f8fafc;
        border-right: 1px solid #e2e8f0;
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
        align-items: center;
        justify-content: center;
        font-size: 12px;
        color: #64748b;
        font-weight: 500;
        border-bottom: 1px solid #f1f5f9;
        flex-shrink: 0;
    }

    .calendar-body {
        position: relative;
        background: white;
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
        background: #f8fafc;
        border-bottom: 2px solid #e2e8f0;
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
    }

    :global(.week-day-header) {
        height: 60px;
        padding: 0; 
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-right: 1px solid #e2e8f0;
    }

    :global(.week-day-header:last-child) {
        border-right: none;
    }

    :global(.week-day-name) {
        font-size: 12px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        margin-bottom: 4px;
    }

    :global(.week-day-number) {
        font-size: 18px;
        color: #0f172a;
        font-weight: 600;
    }

    :global(.week-day-number.today) {
        background: #3b82f6;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto;
    }

    :global(.time-slot) {
        height: 60px;
        border-bottom: 1px solid #f1f5f9;
        border-right: 1px solid #f1f5f9;
        position: relative;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }

    :global(.week-time-slots :global(.time-slot:nth-child(7n))) {
        border-right: none;
    }

    :global(.time-slot:hover) {
        background-color: #f8fafc;
    }

    .month-container {
        padding: 20px;
    }

    .month-body {
        display: flex;
        flex-direction: column;
    }

    :global(.month-header) {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        background: #f8fafc;
        border-bottom: 2px solid #e2e8f0;
        position: sticky;
        top: 0;
        z-index: 20;
    }

    :global(.month-day-header) {
        padding: 12px;
        text-align: center;
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        text-transform: uppercase;
        border-right: 1px solid #e2e8f0;
    }

    :global(.month-day-header:last-child) {
        border-right: none;
    }

    :global(.month-grid) {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        grid-auto-rows: 1fr;
        gap: 1px;
        background: #e2e8f0;
    }

    :global(.month-day-cell) {
        --cell-bg: white;
        background: var(--cell-bg);
        height: 100px;
        padding: 8px;
        cursor: pointer;
        transition: background-color 0.2s ease;
        position: relative;
        display: flex;
        flex-direction: column;
    }

    :global(.month-day-cell:hover) {
        background: #f8fafc;
    }

    :global(.month-day-cell.other-month) {
        --cell-bg: #f8fafc;
        background: var(--cell-bg);
        color: #94a3b8;
    }

    :global(.month-day-cell.today) {
        --cell-bg: #dbeafe;
        background: var(--cell-bg);
    }

    :global(.month-day-number) {
        font-size: 14px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 4px;
        flex-shrink: 0;
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
        background: linear-gradient(to top, var(--cell-bg, white), transparent);
        pointer-events: none;
        z-index: 5;
    }

    :global(.month-day-cell.other-month .month-day-number) {
        color: #94a3b8;
    }

    :global(.month-day-cell.today .month-day-number) {
        color: #3b82f6;
        font-weight: 700;
    }

    :global(.event) {
        border-radius: 4px;
        padding: 4px 8px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        overflow: hidden;
        z-index: 10;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    :global(.event:not(.month-event)) {
        position: absolute;
        left: 4px;
        right: 4px;
    }

    :global(.event:hover) {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    :global(.event-blue) {
        background-color: #dbeafe;
        color: #1e40af;
        border-left: 3px solid #3b82f6;
    }

    :global(.event-green) {
        background-color: #d1fae5;
        color: #065f46;
        border-left: 3px solid #10b981;
    }

    :global(.event-purple) {
        background-color: #e9d5ff;
        color: #6b21a8;
        border-left: 3px solid #8b5cf6;
    }

    :global(.event-orange) {
        background-color: #fed7aa;
        color: #c2410c;
        border-left: 3px solid #f97316;
    }

    :global(.event-red) {
        background-color: #fecaca;
        color: #b91c1c;
        border-left: 3px solid #ef4444;
    }

    :global(.month-event) {
        position: relative;
        flex-shrink: 0;
        padding: 4px 8px;
        font-size: 11px;
        border-radius: 4px;
        width: 100%;
        box-sizing: border-box;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        backdrop-filter: blur(4px);
    }

    .modal.detail-modal {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .modal-content {
        position: relative;
        background: white;
        border-radius: 12px;
        padding: 30px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal h3 {
        margin-bottom: 20px;
        color: #0f172a;
        font-size: 18px;
        font-weight: 600;
    }

    .form-group {
        margin-bottom: 15px;
    }

    .form-group label {
        display: block;
        margin-bottom: 6px;
        color: #374151;
        font-weight: 500;
        font-size: 14px;
    }

    .form-group input,
    .form-group textarea,
    .form-group select {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;font-family: inherit;
        color: inherit;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        color: inherit;
        background-color: white;
    }

    .form-group textarea {
        overflow-y: scroll;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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

    @media (max-width: 768px) {
        .container {
            padding: 10px;
        }

        .header {
            flex-direction: column;
            align-items: flex-start;
        }

        .header-controls {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
        }

        .view-switcher {
            width: 100%;
            justify-content: stretch;
        }

        .btn-view {
            flex: 1;
        }

        .date-navigation {
            width: 100%;
            justify-content: space-between;
        }

        .header,
        .controls {
            padding: 15px 20px;
        }

        .controls {
            flex-direction: column;
            align-items: stretch;
        }

        .controls .btn {
            width: 100%;
            justify-content: center;
        }

        .time-grid.week-view {
            display: flex;
            height: 1500px;
        }

        :global(.time-labels.week-labels) {
            width: 60px;
            min-width: 60px;
        }

        :global(.month-day-cell) {
            min-height: 60px;
        }

        .modal-content {
            padding: 20px;
            width: 95%;
        }
    }

    .detail-modal-content {
        max-width: 400px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
    }

    .modal-header h3 {
        margin: 0;
        color: #0f172a;
        font-size: 20px;
        font-weight: 600;
    }

    .btn-close {
        background: transparent;
        border: none;
        font-size: 28px;
        color: #64748b;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s ease;
    }

    .btn-close:hover {
        background: #f1f5f9;
        color: #0f172a;
    }

    .detail-body {
        margin-bottom: 20px;
    }

    .detail-row {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #e2e8f0;
    }

    .detail-row strong {
        color: #374151;
        font-weight: 600;
        font-size: 14px;
        margin-right: 20px;
    }

    .detail-row span {
        color: #64748b;
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
        color: #374151;
        font-weight: 600;
        margin-bottom: 8px;
        font-size: 14px;
    }

    .detail-section p {
        margin: 0;
        color: #64748b;
        line-height: 1.6;
        font-size: 14px;
        word-wrap: break-word;
        overflow-wrap: break-word;
        white-space: pre-wrap;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .modal-actions .btn {
        min-width: 100px;
        justify-content: center;
    }

    :global(.event-title) {
        font-weight: 600;
        font-size: 11px;
    }

    :global(.event-time) {
        font-size: 10px;
        opacity: 0.9;
        margin-top: 2px;
    }
</style>