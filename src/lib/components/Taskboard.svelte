<script lang="ts">
    import { onMount, tick } from "svelte";

    type TaskStatus = 'not-started' | 'in-progress' | 'complete';
    type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
    type TaskLabel = 'Event' | 'Organizational' | 'Web Dev' | 'Outreach' | 'Graphic Design';

    interface Task {
        id: string;
        title: string;
        description: string;
        status: TaskStatus;
        assignee: string;
        assigneeAvatar?: string;
        priority: TaskPriority;
        labels: TaskLabel[];
        dueDate?: string;
        estimation: number;
        createdAt: string;
    }

    const STATUSES: { id: TaskStatus; label: string; color: string }[] = [
        { id: 'not-started', label: 'Not Started', color: '#94a3b8' },
        { id: 'in-progress', label: 'In Progress', color: '#3b82f6' },
        { id: 'complete', label: 'Complete', color: '#10b981' }
    ];

    const PRIORITIES: { id: TaskPriority; label: string; color: string }[] = [
        { id: 'low', label: 'Low', color: '#94a3b8' },
        { id: 'medium', label: 'Medium', color: '#3b82f6' },
        { id: 'high', label: 'High', color: '#f59e0b' },
        { id: 'critical', label: 'Critical', color: '#ef4444' }
    ];

    const LABELS: { id: TaskLabel; label: string; color: string }[] = [
        { id: 'Event', label: 'Event', color: '#10b981' },
        { id: 'Web Dev', label: 'Web Dev', color: '#ef4444' },
        { id: 'Outreach', label: 'Outreach', color: '#3b82f6' },
        { id: 'Graphic Design', label: 'Graphic Design', color: '#f59e0b' },
        { id: 'Organizational', label: 'Organizational', color: '#8b5cf6' }
    ];

    let tasks: Task[] = $state([
        {
            id: '1',
            title: 'GBM 1',
            description: 'huaa yea this is gonna be a wesome.',
            status: 'not-started',
            assignee: 'Malik, Quentin',
            priority: 'medium',
            labels: ['Event'],
            dueDate: '2024-09-21',
            estimation: 3.0,
            createdAt: '2024-09-15'
        },
    ]);

    let draggedTask: Task | null = $state(null);
    let draggedOverColumn: TaskStatus | null = $state(null);
    let taskModal: HTMLDivElement | undefined = $state(undefined);
    let detailModal: HTMLDivElement | undefined = $state(undefined);
    let taskForm: HTMLFormElement | undefined = $state(undefined);
    let editingTask: Task | null = $state(null);
    let showModal = $state(false);
    let showDetailModal = $state(false);
    let selectedTask: Task | null = $state(null);

    let taskTitle: HTMLInputElement | undefined = $state(undefined);
    let taskDescription: HTMLTextAreaElement | undefined = $state(undefined);
    let taskAssigneeInput: HTMLInputElement | undefined = $state(undefined);
    let taskPriority: HTMLSelectElement | undefined = $state(undefined);
    let taskDueDate: HTMLInputElement | undefined = $state(undefined);
    let selectedLabels: TaskLabel[] = $state([]);
    
    let assigneeTags = $state<string[]>([]);
    let assigneeInputValue = $state('');

    function getTasksByStatus(status: TaskStatus): Task[] {
        return tasks.filter(task => task.status === status);
    }

    function openDetailModal(task: Task) {
        selectedTask = task;
        showDetailModal = true;
    }

    function closeDetailModal() {
        showDetailModal = false;
        selectedTask = null;
    }

    function handleDragStart(task: Task, e: DragEvent) {
        if (e.dataTransfer) {
            draggedTask = task;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', task.id);
            (e.target as HTMLElement).style.opacity = '0.5';
        }
    }

    function handleDragEnd(e: DragEvent) {
        (e.target as HTMLElement).style.opacity = '1';
        draggedTask = null;
        draggedOverColumn = null;
    }

    function handleDragOver(status: TaskStatus, e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'move';
            draggedOverColumn = status;
        }
    }

    function handleDragLeave() {
        draggedOverColumn = null;
    }

    function handleDrop(status: TaskStatus, e: DragEvent) {
        e.preventDefault();
        if (draggedTask && draggedTask.status !== status) {
            tasks = tasks.map(task =>
                task.id === draggedTask!.id ? { ...task, status } : task
            );
        }
        draggedTask = null;
        draggedOverColumn = null;
    }

    async function openTaskModal(task?: Task) {
        closeDetailModal();
        editingTask = task || null;
        showModal = true;
        await tick();
        
        if (task) {
            if (taskTitle) taskTitle.value = task.title;
            if (taskDescription) taskDescription.value = task.description;
            if (task.assignee) {
                assigneeTags = task.assignee.split(',').map(a => a.trim()).filter(a => a.length > 0);
            } else {
                assigneeTags = [];
            }
            assigneeInputValue = '';
            if (taskPriority) taskPriority.value = task.priority;
            if (taskDueDate) taskDueDate.value = task.dueDate || '';
            selectedLabels = [...task.labels];
        } else {
            if (taskTitle) taskTitle.value = '';
            if (taskDescription) taskDescription.value = '';
            assigneeTags = [];
            assigneeInputValue = '';
            if (taskPriority) taskPriority.value = 'medium';
            if (taskDueDate) taskDueDate.value = '';
            selectedLabels = [];
        }
        
        if (taskTitle) {
            taskTitle.focus();
        }
    }

    function closeTaskModal() {
        showModal = false;
        editingTask = null;
        selectedLabels = [];
        assigneeTags = [];
        assigneeInputValue = '';
    }

    function addAssigneeTag() {
        const trimmed = assigneeInputValue.trim();
        if (trimmed && !assigneeTags.includes(trimmed)) {
            assigneeTags = [...assigneeTags, trimmed];
            assigneeInputValue = '';
            if (taskAssigneeInput) {
                taskAssigneeInput.value = '';
            }
        }
    }

    function removeAssigneeTag(tagToRemove: string) {
        assigneeTags = assigneeTags.filter(tag => tag !== tagToRemove);
    }

    function handleAssigneeInputKeydown(e: KeyboardEvent) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            addAssigneeTag();
        } else if (e.key === 'Backspace' && assigneeInputValue === '' && assigneeTags.length > 0) {
            assigneeTags = assigneeTags.slice(0, -1);
        }
    }

    function toggleLabel(label: TaskLabel) {
        if (selectedLabels.includes(label)) {
            selectedLabels = selectedLabels.filter(l => l !== label);
        } else {
            selectedLabels = [...selectedLabels, label];
        }
    }

    function saveTask(e: SubmitEvent) {
        e.preventDefault();

        if (assigneeInputValue.trim()) {
            addAssigneeTag();
        }

        const assigneeString = assigneeTags.length > 0 ? assigneeTags.join(', ') : 'Unassigned';

        const taskData: Task = {
            id: editingTask?.id || Date.now().toString(),
            title: taskTitle?.value.trim() || '',
            description: taskDescription?.value.trim() || '',
            status: editingTask?.status || 'not-started',
            assignee: assigneeString,
            priority: taskPriority?.value as TaskPriority || 'medium',
            labels: selectedLabels,
            dueDate: taskDueDate?.value || undefined,
            estimation: 1.0,
            createdAt: editingTask?.createdAt || new Date().toISOString().split('T')[0]
        };

        if (editingTask) {
            tasks = tasks.map(task => task.id === editingTask!.id ? taskData : task);
        } else {
            tasks = [...tasks, taskData];
        }

        closeTaskModal();
    }

    function deleteTask(taskId: string) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(task => task.id !== taskId);
        }
    }

    function getInitials(name: string | undefined): string {
        if (!name || typeof name !== 'string') {
            return '??';
        }
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function isOverdue(dueDate?: string, taskId?: string): boolean {
        if (!dueDate) return false;
        const task = tasks.find(t => t.id === taskId);
        if (task?.status === 'complete') return false;
        return new Date(dueDate) < new Date();
    }


</script>

<div class="taskboard-container">
    <div class="taskboard-header">
        <h1>Project Taskboard</h1>
        <button class="btn btn-primary" onclick={() => openTaskModal()}>
            + Add Task
        </button>
    </div>

    <div class="kanban-board">
        {#each STATUSES as status}
            <div
                class="kanban-column"
                class:drag-over={draggedOverColumn === status.id}
                role="region"
                aria-label="{status.label} column"
                ondragover={(e) => handleDragOver(status.id, e)}
                ondragleave={handleDragLeave}
                ondrop={(e) => handleDrop(status.id, e)}
            >
                <div class="column-header" style="border-top-color: {status.color}">
                    <h2>{status.label}</h2>
                    <span class="task-count">{getTasksByStatus(status.id).length}</span>
                </div>
                <div class="column-content">
                    {#each getTasksByStatus(status.id) as task (task.id)}
                        <div
                            class="task-card"
                            role="button"
                            tabindex="0"
                            draggable="true"
                            ondragstart={(e) => handleDragStart(task, e)}
                            ondragend={handleDragEnd}
                            onclick={() => openDetailModal(task)}
                            onkeydown={(e) => e.key === 'Enter' && openDetailModal(task)}
                            aria-label="Task: {task.title}"
                        >
                            {#if task.labels.length > 0}
                                <div class="task-labels">
                                    {#each task.labels as label}
                                        {@const labelData = LABELS.find(l => l.id === label)}
                                        {#if labelData}
                                            <span class="task-label" style="background-color: {labelData.color}20; color: {labelData.color}; border-color: {labelData.color}40">
                                                {labelData.label}
                                            </span>
                                        {/if}
                                    {/each}
                                </div>
                            {/if}
                            
                            <h3 class="task-title">{task.title}</h3>

                            <div class="task-meta">
                                {#each PRIORITIES as priority}
                                    {#if priority.id === task.priority}
                                        <span class="task-priority" style="color: {priority.color}">
                                            {priority.label}
                                        </span>
                                    {/if}
                                {/each}
                                
                                {#if task.dueDate}
                                    <div class="task-due-date" class:overdue={isOverdue(task.dueDate, task.id)}>
                                        📅 {formatDate(task.dueDate)}
                                    </div>
                                {/if}
                            </div>

                            <div class="task-footer">
                                <div class="task-assignees">
                                    {#if task.assignee && task.assignee !== 'Unassigned'}
                                        {#each task.assignee.split(',').map(a => a.trim()) as assignee}
                                            <div class="assignee-avatar" title={assignee}>
                                                {getInitials(assignee)}
                                            </div>
                                        {/each}
                                    {:else}
                                        <div class="assignee-avatar unassigned" title="Unassigned">
                                            ?
                                        </div>
                                    {/if}
                                </div>
                                <button
                                    class="btn-delete"
                                    onclick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                    title="Delete task"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>

<!-- Task Detail Modal -->
{#if showDetailModal && selectedTask}
    <div 
        class="modal" 
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        onclick={(e) => e.target === detailModal && closeDetailModal()} 
        onkeydown={(e) => e.key === 'Escape' && closeDetailModal()}
        bind:this={detailModal}
    >
        <div class="modal-content detail-modal-content" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h3>{selectedTask.title}</h3>
                <button class="btn-close" onclick={closeDetailModal} aria-label="Close modal">×</button>
            </div>
            
            <div class="detail-body">
                {#if selectedTask.labels.length > 0}
                    <div class="detail-labels">
                        {#each selectedTask.labels as label}
                            {@const labelData = LABELS.find(l => l.id === label)}
                            {#if labelData}
                                <span class="detail-label" style="background-color: {labelData.color}20; color: {labelData.color}; border-color: {labelData.color}40">
                                    {labelData.label}
                                </span>
                            {/if}
                        {/each}
                    </div>
                {/if}

                {#if selectedTask.description}
                    <div class="detail-section">
                        <h4>Description</h4>
                        <p>{selectedTask.description}</p>
                    </div>
                {/if}

                <div class="detail-section">
                    <h4>Details</h4>
                    <div class="detail-grid">
                        <div>
                            <strong>Priority:</strong>
                            {#each PRIORITIES as priority}
                                {#if priority.id === selectedTask.priority}
                                    <span style="color: {priority.color}">{priority.label}</span>
                                {/if}
                            {/each}
                        </div>
                        {#if selectedTask.dueDate}
                            <div>
                                <strong>Due Date:</strong>
                                <span class:overdue={isOverdue(selectedTask.dueDate, selectedTask.id)}>📅 {formatDate(selectedTask.dueDate)}</span>
                            </div>
                        {/if}
                        <div>
                            <strong>Assignees:</strong>
                            <div class="detail-assignees">
                                {#if selectedTask.assignee && selectedTask.assignee !== 'Unassigned'}
                                    {#each selectedTask.assignee.split(',').map(a => a.trim()) as assignee}
                                        <div class="detail-assignee-avatar" title={assignee}>
                                            {getInitials(assignee)}
                                        </div>
                                        <span>{assignee}</span>
                                    {/each}
                                {:else}
                                    <span>Unassigned</span>
                                {/if}
                            </div>
                        </div>
                        <div>
                            <strong>Status:</strong>
                            {#each STATUSES as status}
                                {#if status.id === selectedTask.status}
                                    <span>{status.label}</span>
                                {/if}
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick={closeDetailModal}>
                    Close
                </button>
                <button type="button" class="btn btn-primary" onclick={() => openTaskModal(selectedTask || undefined)}>
                    Edit
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- Task Modal -->
{#if showModal}
    <div 
        class="modal" 
        role="dialog"
        tabindex="-1"
        aria-modal="true"
        aria-labelledby="modal-title"
        onclick={(e) => e.target === taskModal && closeTaskModal()} 
        onkeydown={(e) => e.key === 'Escape' && closeTaskModal()}
        bind:this={taskModal}
    >
        <div class="modal-content" role="presentation" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h3 id="modal-title">{editingTask ? 'Edit Task' : 'Create New Task'}</h3>
                <button class="btn-close" onclick={closeTaskModal} aria-label="Close modal">×</button>
            </div>
            <form bind:this={taskForm} onsubmit={saveTask}>
                <div class="form-group">
                    <label for="taskTitle">Title *</label>
                    <input
                        type="text"
                        id="taskTitle"
                        bind:this={taskTitle}
                        placeholder="Enter task title"
                        required
                    />
                </div>

                <div class="form-group">
                    <label for="taskDescription">Description</label>
                    <textarea
                        id="taskDescription"
                        bind:this={taskDescription}
                        placeholder="Enter task description"
                        rows="4"
                    ></textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="taskDueDate">Due Date</label>
                        <input
                            type="date"
                            id="taskDueDate"
                            bind:this={taskDueDate}
                        />
                    </div>

                    <div class="form-group">
                        <label for="taskPriority">Priority</label>
                        <select id="taskPriority" bind:this={taskPriority}>
                            {#each PRIORITIES as priority}
                                <option value={priority.id}>{priority.label}</option>
                            {/each}
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label for="taskAssignee">Assignees</label>
                    <div class="tag-input-container">
                        <div class="tag-input-wrapper">
                            {#each assigneeTags as tag}
                                <span class="assignee-tag">
                                    {tag}
                                    <button
                                        type="button"
                                        class="tag-remove"
                                        onclick={() => removeAssigneeTag(tag)}
                                        aria-label="Remove {tag}"
                                    >
                                        ×
                                    </button>
                                </span>
                            {/each}
                            <input
                                type="text"
                                id="taskAssignee"
                                class="tag-input"
                                bind:this={taskAssigneeInput}
                                bind:value={assigneeInputValue}
                                onkeydown={handleAssigneeInputKeydown}
                                placeholder={assigneeTags.length === 0 ? "Type name and press space or enter" : ""}
                            />
                        </div>
                    </div>
                    <small class="form-hint">Type a name and press space or enter to add</small>
                </div>

                <div class="form-group">
                    <fieldset>
                        <legend>Labels</legend>
                        <div class="label-selector">
                        {#each LABELS as label}
                            <button
                                type="button"
                                class="label-button"
                                class:selected={selectedLabels.includes(label.id)}
                                style="background-color: {selectedLabels.includes(label.id) ? label.color + '20' : 'transparent'}; border-color: {label.color}40; color: {label.color}"
                                onclick={() => toggleLabel(label.id)}
                            >
                                {label.label}
                            </button>
                        {/each}
                        </div>
                    </fieldset>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick={closeTaskModal}>
                        Cancel
                    </button>
                    <button type="submit" class="btn btn-primary">
                        {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .taskboard-container {
        max-width: 98dvw;
        margin: 0 auto;
        padding: 20px;
        margin-top: 6vmin;
    }

    .taskboard-header {
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

    .taskboard-header h1 {
        font-size: 24px;
        font-weight: 600;
        color: #0f172a;
        margin: 0;
    }

    .kanban-board {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 20px;
        align-items: start;
    }

    .kanban-column {
        background: #f8fafc;
        border-radius: 12px;
        padding: 16px;
        min-height: 400px;
        transition: background-color 0.2s ease;
    }

    .kanban-column.drag-over {
        background: #e0e7ff;
    }

    .column-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 12px;
        margin-bottom: 16px;
        border-top: 4px solid;
        padding-top: 12px;
    }

    .column-header h2 {
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .task-count {
        background: white;
        color: #64748b;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .column-content {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 100px;
    }

    .task-card {
        background: white;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        cursor: grab;
        transition: all 0.2s ease;
        border: 1px solid #e2e8f0;
        outline: none;
    }

    .task-card:active {
        cursor: grabbing;
    }

    .task-card:hover,
    .task-card:focus {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateY(-2px);
    }

    .task-card:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
    }

    .task-labels {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 6px;
    }

    .task-label {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 3px;
        border: 1px solid;
    }

    .task-title {
        font-size: 13px;
        font-weight: 600;
        color: #0f172a;
        margin: 0 0 6px 0;
        line-height: 1.3;
    }

    .task-meta {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 8px;
    }

    .task-priority {
        font-size: 11px;
        font-weight: 600;
    }

    .task-due-date {
        font-size: 11px;
        color: #64748b;
    }

    .task-due-date.overdue {
        color: #ef4444;
        font-weight: 600;
    }

    .task-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 8px;
        border-top: 1px solid #f1f5f9;
        gap: 8px;
    }

    .task-assignees {
        display: flex;
        align-items: center;
        gap: -8px;
        flex-wrap: wrap;
    }

    .assignee-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #3b82f6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        flex-shrink: 0;
        margin-right: -8px;
    }

    .assignee-avatar:last-child {
        margin-right: 0;
    }

    .assignee-avatar.unassigned {
        background: #cbd5e1;
        color: #64748b;
    }

    .btn-delete {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 4px 8px;
        border-radius: 4px;
        transition: all 0.2s ease;
        color: #ef4444;
        opacity: 0.6;
        font-weight: 600;
    }

    .btn-delete:hover {
        background: #fee2e2;
        opacity: 1;
        color: #dc2626;
    }

    .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        display: inline-flex;
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
    }

    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        z-index: 1000;
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    }

    .modal-content {
        background: white;
        border-radius: 12px;
        padding: 30px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
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

    .form-group {
        margin-bottom: 20px;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
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
        font-size: 14px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
        font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group textarea {
        resize: vertical;
    }

    .form-hint {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #64748b;
        font-style: italic;
    }

    .tag-input-container {
        width: 100%;
    }

    .tag-input-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        min-height: 42px;
        background: white;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .tag-input-wrapper:focus-within {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .assignee-tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background: #e0e7ff;
        color: #3730a3;
        border: 1px solid #c7d2fe;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
    }

    .tag-remove {
        background: transparent;
        border: none;
        color: #3730a3;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0;
        margin-left: 2px;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }

    .tag-remove:hover {
        background: #c7d2fe;
    }

    .tag-input {
        flex: 1;
        min-width: 120px;
        border: none;
        outline: none;
        padding: 0;
        font-size: 14px;
        background: transparent;
    }

    .tag-input::placeholder {
        color: #9ca3af;
    }

    .label-selector {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
    }

    .label-button {
        padding: 6px 12px;
        border: 1px solid;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
    }

    .label-button:hover {
        opacity: 0.8;
        transform: translateY(-1px);
    }

    .label-button.selected {
        opacity: 1;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        justify-content: flex-end;
    }

    .modal-actions .btn {
        min-width: 100px;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .taskboard-container {
            padding: 10px;
        }

        .kanban-board {
            grid-template-columns: 1fr;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .modal-content {
            padding: 20px;
        }
    }

    .detail-modal-content {
        max-width: 500px;
    }

    .detail-body {
        margin-bottom: 20px;
    }

    .detail-labels {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 16px;
    }

    .detail-label {
        font-size: 12px;
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid;
    }

    .detail-section {
        margin-bottom: 16px;
    }

    .detail-section h4 {
        margin: 0 0 8px 0;
        color: #374151;
        font-weight: 600;
        font-size: 14px;
    }

    .detail-section p {
        margin: 0;
        color: #64748b;
        line-height: 1.6;
    }

    .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .detail-grid > div {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .detail-grid strong {
        color: #374151;
        font-weight: 600;
        font-size: 13px;
    }

    .detail-grid span {
        color: #64748b;
        font-size: 14px;
    }

    .detail-assignees {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
    }

    .detail-assignee-avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #3b82f6;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
        flex-shrink: 0;
    }
</style>
