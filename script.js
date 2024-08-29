document.addEventListener('DOMContentLoaded', function() {
    const soundSelect = document.getElementById('soundSelect');
    const soundPlayer = document.getElementById('soundPlayer');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const volumeSlider = document.getElementById('volumeSlider');

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            playSound();
        }
    });

    startButton.addEventListener('click', playSound);

    stopButton.addEventListener('click', function() {
        soundPlayer.pause();
        soundPlayer.currentTime = 0;
    });

    volumeSlider.addEventListener('input', function() {
        soundPlayer.volume = volumeSlider.value;
    });

    function playSound() {
        const selectedSound = soundSelect.value;
        soundPlayer.src = `${selectedSound}`;
        soundPlayer.play();
    }
});
