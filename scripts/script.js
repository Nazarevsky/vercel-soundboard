const zarplataSoundName = 'sounds/zarplata';
const zarplataAudios = ['1.mp3', '2.mp3', '3.mp3', '4.mp3', '5.mp3', '6.mp3', '7.mp3', '8.mp3', '9.mp3', '10.mp3'];
const zarplataSoundDelay = [300, 500]

let allowZarplataSound = true

const sounds = [
    { label: "Дааа, ебать его в рот", file: "da-ebat-ego-v-rot-blia.mp3" },
    { label: "Та пошел ты на хуй", file:"da-poshiol-ty-nakhui.mp3"},
    { label: "Орел", file:"eagle-earrape.mp3"},
    { label: "За донбасс", file:"tha_donbass.mp3"},
    { label: "Арабский навал", file:"arabskiy-naval.mp3"},
    { label: "Where is my mind", file:"where-is-my-mind.mp3"},
    { label: "Гл гл гл гл", file:"gulp-gulp-gulp.mp3"},
    { label: "Уровень нахрюка максимальный", file:"uroven-nahryuka.mpeg"},
    { label: "Вставай шенг цу", file:"vstavai-shang-tsu.mp3"},
    { label: "Зрада тотальна", file:"zrada-totalna.mp3"},
    { label: "Крик зеленый слоник", file:"green-elephant-scream.mp3"},
    { label: "Ам ам ам", file:"am-am-am.mp3"},
    { label: "За монолит", file:"za-monolit.mp3"},
    { label: "За монолит фулл", file:"za-monolit-full.mp3"},
    { label: "Oh my god, wow", file:"omg-wow.mp3"},
    { label: "Mr. Bombastic", file:"bombastic.mp3"},
    { label: "Ебаный рот этого казино", file:"casino.mp3"},
    { label: "Ты кто такой, сука", file:"ti-kto-takoy.mp3"},
    { label: "Житель \"та завали ты свое...\"", file:"zavali.mp3"},
    { label: "Ярік, блять", file:"yarik-blyat.mp3"},
    { label: "Бачок потік", file:"bachok-potik.mp3"},
    { label: "На приеме у уролога", file:"urolog.mp3"},
    { label: "Woman", file:"woman.mp4"},
    { label: "Сирена", file:"sirena-stony.mp3"},
    { label: "Макс Верстаппен", file:"tu-tu-tu-du-max-verstappen.mp3"},
    { label: "Зрозумій суко ми українці", file:"zrozumii-suko-mi-ukrayintsi.mp3"},
    { label: "Zarplata", file:"zarplata"},
]

sounds.sort((a, b) => a.label.localeCompare(b.label));

document.addEventListener('DOMContentLoaded', function() {
    const soundSelect = document.getElementById('soundSelect');
    sounds.forEach(({ label, file }) => {
        const option = document.createElement('option');
        option.value = `sounds/${file}`;
        option.textContent = label;
        soundSelect.appendChild(option);
    });
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const randomButton = document.getElementById('randomButton');
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

    randomButton.addEventListener('click', function() {
        const randomIndex = Math.floor(Math.random() * sounds.length);
        soundSelect.value = `sounds/${sounds[randomIndex].file}`;
        handleSound();
    })

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

