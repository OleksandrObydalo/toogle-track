import { createApp, ref, computed, onMounted, onUnmounted } from 'vue';

createApp({
    setup() {
        const description = ref('');
        const selectedProject = ref('');
        const showProjectDropdown = ref(false);
        const isTimerRunning = ref(false);
        const elapsedTime = ref(0);
        const startTime = ref(null);
        const timerInterval = ref(null);
        const timeEntries = ref([]);
        
        // Manual time entry modal
        const showManualEntryModal = ref(false);
        const showProjectInModal = ref(false);
        const manualEntry = ref({
            description: '',
            project: '',
            hours: 0,
            minutes: 0,
            seconds: 0
        });

        // New state for users and projects management
        const showNewUserModal = ref(false);
        const showNewProjectModal = ref(false);
        const newUser = ref({
            name: '',
            email: '',
            role: ''
        });
        const newProject = ref({
            name: '',
            client: '',
            color: '#' + Math.floor(Math.random()*16777215).toString(16)
        });
        const users = ref([
            { name: 'John Doe', email: 'john@example.com', role: 'Member' }
        ]);

        // Modify existing projects to include more details
        const projects = ref([
            { 
                name: 'Website Development', 
                client: 'ABC Corp',
                color: '#e57cd8'
            },
            { 
                name: 'App Design', 
                client: 'XYZ Inc',
                color: '#2c1338'
            },
            { 
                name: 'Marketing', 
                client: 'Marketing Agency',
                color: '#412a4c'
            }
        ]);

        const toggleProjectDropdown = (event) => {
            event.stopPropagation();
            showProjectDropdown.value = !showProjectDropdown.value;
        };

        const selectProject = (project) => {
            selectedProject.value = project.name;
            showProjectDropdown.value = false;
        };

        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const secs = seconds % 60;
            
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        };

        const toggleTimer = () => {
            if (isTimerRunning.value) {
                // Stop timer
                clearInterval(timerInterval.value);
                if (elapsedTime.value > 0) {
                    // Add time entry
                    timeEntries.value.unshift({
                        description: description.value || 'Untitled',
                        project: selectedProject.value,
                        duration: elapsedTime.value,
                        startTime: startTime.value,
                        endTime: new Date()
                    });
                }
                // Reset timer
                elapsedTime.value = 0;
                description.value = '';
                selectedProject.value = '';
            } else {
                // Start timer
                startTime.value = new Date();
                timerInterval.value = setInterval(() => {
                    elapsedTime.value++;
                }, 1000);
            }
            isTimerRunning.value = !isTimerRunning.value;
        };

        const resumeEntry = (index) => {
            if (isTimerRunning.value) {
                // Stop current timer first
                toggleTimer();
            }
            
            const entry = timeEntries.value[index];
            description.value = entry.description;
            selectedProject.value = entry.project;
            elapsedTime.value = 0; // Start fresh
            
            // Remove the entry as we're resuming it
            timeEntries.value.splice(index, 1);
            
            // Start timer
            toggleTimer();
        };

        const deleteEntry = (index) => {
            timeEntries.value.splice(index, 1);
        };

        const totalTime = computed(() => {
            return timeEntries.value.reduce((total, entry) => total + entry.duration, 0);
        });

        const toggleProjectInModal = (event) => {
            event.stopPropagation();
            showProjectInModal.value = !showProjectInModal.value;
        };

        const selectProjectInModal = (project) => {
            manualEntry.value.project = project.name;
            showProjectInModal.value = false;
        };

        const closeManualEntryModal = () => {
            showManualEntryModal.value = false;
            resetManualEntry();
        };

        const resetManualEntry = () => {
            manualEntry.value = {
                description: '',
                project: '',
                hours: 0,
                minutes: 0,
                seconds: 0
            };
        };

        const saveManualEntry = () => {
            if (!manualEntry.value.description) {
                manualEntry.value.description = 'Untitled';
            }
            
            // Calculate duration in seconds
            const totalSeconds = 
                (parseInt(manualEntry.value.hours) || 0) * 3600 + 
                (parseInt(manualEntry.value.minutes) || 0) * 60 + 
                (parseInt(manualEntry.value.seconds) || 0);
            
            if (totalSeconds > 0) {
                timeEntries.value.unshift({
                    description: manualEntry.value.description,
                    project: manualEntry.value.project,
                    duration: totalSeconds,
                    startTime: new Date(new Date().getTime() - (totalSeconds * 1000)),
                    endTime: new Date()
                });
                closeManualEntryModal();
            }
        };

        const closeNewUserModal = () => {
            showNewUserModal.value = false;
            newUser.value = {
                name: '',
                email: '',
                role: ''
            };
        };

        const saveNewUser = () => {
            if (newUser.value.name && newUser.value.email) {
                users.value.push({
                    name: newUser.value.name,
                    email: newUser.value.email,
                    role: newUser.value.role || 'Member'
                });
                closeNewUserModal();
            }
        };

        const closeNewProjectModal = () => {
            showNewProjectModal.value = false;
            newProject.value = {
                name: '',
                client: '',
                color: '#' + Math.floor(Math.random()*16777215).toString(16)
            };
        };

        const saveNewProject = () => {
            if (newProject.value.name) {
                projects.value.push({
                    name: newProject.value.name,
                    client: newProject.value.client,
                    color: newProject.value.color
                });
                closeNewProjectModal();
            }
        };

        const currentUser = ref(null);
        const showUserDropdown = ref(false);

        const toggleUserDropdown = (event) => {
            event.stopPropagation();
            showUserDropdown.value = !showUserDropdown.value;
        };

        const selectUser = (user) => {
            currentUser.value = user;
            showUserDropdown.value = false;
        };

        const handleClickOutside = (event) => {
            if (showProjectDropdown.value) {
                showProjectDropdown.value = false;
            }
            if (showProjectInModal.value) {
                showProjectInModal.value = false;
            }
            if (showUserDropdown.value) {
                showUserDropdown.value = false;
            }
        };

        const currentTab = ref('Timer');
        const reportsTimeframe = ref('thisWeek');
        const reportsView = ref('summary');

        const filteredEntries = computed(() => {
            const now = new Date();
            const entries = timeEntries.value;

            switch (reportsTimeframe.value) {
                case 'thisWeek':
                    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                    return entries.filter(entry => new Date(entry.startTime) >= weekStart);
                case 'lastWeek':
                    const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
                    const lastWeekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                    return entries.filter(entry => {
                        const entryDate = new Date(entry.startTime);
                        return entryDate >= lastWeekStart && entryDate < lastWeekEnd;
                    });
                case 'thisMonth':
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    return entries.filter(entry => new Date(entry.startTime) >= monthStart);
                default:
                    return entries;
            }
        });

        const summaryByDay = computed(() => {
            const summary = {};
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            
            filteredEntries.value.forEach(entry => {
                const day = days[new Date(entry.startTime).getDay()];
                summary[day] = (summary[day] || 0) + entry.duration;
            });
            
            return summary;
        });

        const summaryByProject = computed(() => {
            const summary = {};
            
            filteredEntries.value.forEach(entry => {
                const project = entry.project || 'No Project';
                summary[project] = (summary[project] || 0) + entry.duration;
            });
            
            return summary;
        });

        const filteredDetailedEntries = computed(() => {
            return filteredEntries.value.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        });

        const calculateBarHeight = (duration) => {
            const maxDuration = Math.max(...Object.values(summaryByDay.value));
            return (duration / maxDuration) * 100;
        };

        const formatDate = (date) => {
            return new Date(date).toLocaleDateString();
        };

        onMounted(() => {
            document.addEventListener('click', handleClickOutside);
        });

        onUnmounted(() => {
            document.removeEventListener('click', handleClickOutside);
            if (timerInterval.value) {
                clearInterval(timerInterval.value);
            }
        });

        return {
            description,
            selectedProject,
            showProjectDropdown,
            projects,
            isTimerRunning,
            elapsedTime,
            timeEntries,
            totalTime,
            toggleProjectDropdown,
            selectProject,
            formatTime,
            toggleTimer,
            resumeEntry,
            deleteEntry,
            // Manual time entry properties and methods
            showManualEntryModal,
            manualEntry,
            showProjectInModal,
            toggleProjectInModal,
            selectProjectInModal,
            closeManualEntryModal,
            saveManualEntry,
            // New modal and management related returns
            showNewUserModal,
            showNewProjectModal,
            newUser,
            newProject,
            users,
            closeNewUserModal,
            saveNewUser,
            closeNewProjectModal,
            saveNewProject,
            // New user dropdown properties and methods
            currentUser,
            showUserDropdown,
            toggleUserDropdown,
            selectUser,
            currentTab,
            reportsTimeframe,
            reportsView,
            filteredEntries,
            summaryByDay,
            summaryByProject,
            filteredDetailedEntries,
            calculateBarHeight,
            formatDate
        };
    }
}).mount('#app');