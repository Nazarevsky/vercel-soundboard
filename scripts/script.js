const zarplataSoundName = 'sounds/zarplata';
const zarplataAudios = ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3', '7.mp3', '8.mp3', '9.mp3', '10.mp3'];
const zarplataSoundDelay = [300, 500]

let allowZarplataSound = true

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
            allowZarplataSound = false
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
            launchCommonSound(soundSelect.value)
        }
    }

    function launchZarplataSound() {
        allowZarplataSound = true
        const pool = [...zarplataAudios];

        function launchNext() {
            if (pool.length === 0 | !allowZarplataSound) {
                return
            } 

            const index = Math.floor(Math.random() * pool.length);
            const sound = pool.splice(index, 1)[0];

            launchCommonSound(zarplataSoundName + "/"+ sound)

            const delay = Math.random() * (zarplataSoundDelay[1] - zarplataSoundDelay[0]) + zarplataSoundDelay[0];
            setTimeout(launchNext, delay);
        }

        launchNext();
    }

    function launchCommonSound(selectedSound) {
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

