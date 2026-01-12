const zarplataSoundName = 'sounds/zarplata';

document.addEventListener('DOMContentLoaded', function() {
    const soundSelect = document.getElementById('soundSelect');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const volumeSlider = document.getElementById('volumeSlider');
    let currentSounds = [];

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            handleSound();
        }
    });

    startButton.addEventListener('click', handleSound);

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

    function handleSound() {
        if (soundSelect.value === zarplataSoundName) {
            launchZarplataSound()
        } else {
            launchCommonSound()
        }
    }

    function launchZarplataSound() {
        console.log("Zarplata sound triggered");
    }

    function launchCommonSound() {
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
