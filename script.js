document.addEventListener('DOMContentLoaded', function() {
    const soundSelect = document.getElementById('soundSelect');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const volumeSlider = document.getElementById('volumeSlider');
    let currentSounds = [];

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            launchSound();
        }
    });

    startButton.addEventListener('click', launchSound);

    stopButton.addEventListener('click', function() {
        currentSounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
        currentSounds = [];
    });

    volumeSlider.addEventListener('input', function() {
        currentSounds.forEach(sound => {
            sound.volume = volumeSlider.value;
        });
    });

    function launchSound() {
        const selectedSound = soundSelect.value;
        const newSound = new Audio(`${selectedSound}`);
        newSound.volume = volumeSlider.value;
        newSound.play();
        currentSounds.push(newSound);

        // Clean up the array when a sound ends
        newSound.addEventListener('ended', function() {
            currentSounds = currentSounds.filter(sound => sound !== newSound);
        });
    }
});
