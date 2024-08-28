document.addEventListener('DOMContentLoaded', function() {
    const soundSelect = document.getElementById('soundSelect');
    const soundPlayer = document.getElementById('soundPlayer');

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            const selectedSound = soundSelect.value;
            soundPlayer.src = `${selectedSound}`;
            soundPlayer.play();
        }
    });
});
