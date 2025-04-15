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

        const projects = [
            'Website Development',
            'App Design',
            'Marketing',
            'Research',
            'Client Meeting'
        ];

        const toggleProjectDropdown = (event) => {
            event.stopPropagation();
            showProjectDropdown.value = !showProjectDropdown.value;
        };

        const selectProject = (project) => {
            selectedProject.value = project;
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

        // Close project dropdown when clicking outside
        const handleClickOutside = (event) => {
            if (showProjectDropdown.value) {
                showProjectDropdown.value = false;
            }
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
            deleteEntry
        };
    }
}).mount('#app');

