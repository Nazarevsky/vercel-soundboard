import { AudioEffectsEngine } from './audio-effects.js';

const SOUND_ROOT = 'sounds';
const SOUND_MODES = {
    randomClip: 'randomClip',
    shuffledSequence: 'shuffledSequence',
};

const SPECIAL_SOUND_CONFIG = {
    vanya: {
        mode: SOUND_MODES.randomClip,
        directory: 'vanya',
        files: [
            '1.m4a',
            '2.m4a',
            '3.m4a',
            '4.m4a',
            '5.m4a',
            '6.m4a',
            '7.m4a',
            '8.m4a',
            '9.m4a',
            '10.m4a',
            '11.m4a',
            '12.m4a',
            '13.m4a',
            '14.m4a',
            '15.m4a',
            '16.m4a',
            '17.m4a',
            '18.m4a',
            '19.m4a',
            '20.m4a',
        ],
    },
    zarplata: {
        mode: SOUND_MODES.shuffledSequence,
        directory: 'zarplata',
        files: [
            '1.mp3',
            '2.mp3',
            '3.mp3',
            '4.mp3',
            '5.mp3',
            '6.mp3',
            '7.mp3',
            '8.mp3',
            '9.mp3',
            '10.mp3',
        ],
        delayRangeMs: [300, 500],
    },
};

const sounds = [
    { label: 'Vanya', file: 'vanya' },
    { label: 'Minecraft Damage', file: 'minecraft-damage.mp3' },
    { label: 'Дааа, ебать его в рот', file: 'da-ebat-ego-v-rot-blia.mp3' },
    { label: 'Та пошел ты на хуй', file: 'da-poshiol-ty-nakhui.mp3' },
    { label: 'Орел', file: 'eagle-earrape.mp3' },
    { label: 'За донбасс', file: 'tha_donbass.mp3' },
    { label: 'Арабский навал', file: 'arabskiy-naval.mp3' },
    { label: 'Where is my mind', file: 'where-is-my-mind.mp3' },
    { label: 'Гл гл гл гл', file: 'gulp-gulp-gulp.mp3' },
    { label: 'Уровень нахрюка максимальный', file: 'uroven-nahryuka.mpeg' },
    { label: 'Вставай шенг цу', file: 'vstavai-shang-tsu.mp3' },
    { label: 'Зрада тотальна', file: 'zrada-totalna.mp3' },
    { label: 'Крик зеленый слоник', file: 'green-elephant-scream.mp3' },
    { label: 'Ам ам ам', file: 'am-am-am.mp3' },
    { label: 'За монолит', file: 'za-monolit.mp3' },
    { label: 'За монолит фулл', file: 'za-monolit-full.mp3' },
    { label: 'Oh my god, wow', file: 'omg-wow.mp3' },
    { label: 'Mr. Bombastic', file: 'bombastic.mp3' },
    { label: 'Ебаный рот этого казино', file: 'casino.mp3' },
    { label: 'Ты кто такой, сука', file: 'ti-kto-takoy.mp3' },
    { label: 'Житель "та завали ты свое..."', file: 'zavali.mp3' },
    { label: 'Ярік, блять', file: 'yarik-blyat.mp3' },
    { label: 'Бачок потік', file: 'bachok-potik.mp3' },
    { label: 'На приеме у уролога', file: 'urolog.mp3' },
    { label: 'Woman', file: 'woman.mp4' },
    { label: 'Сирена', file: 'sirena-stony.mp3' },
    { label: 'Макс Верстаппен', file: 'tu-tu-tu-du-max-verstappen.mp3' },
    { label: 'Зрозумій суко ми українці', file: 'zrozumii-suko-mi-ukrayintsi.mp3' },
    { label: 'Zarplata', file: 'zarplata' },
    { label: 'Ватафак, амиго, вас ист дас', file: 'amigo.mp3' },
    { label: 'sixseven', file: '67.mp3' },
    { label: '3 изумруда', file: '3izumruda.wav' },
    { label: 'мамаджан', file: 'mamadzhan.mp3'},
    { label: 'meow', file: 'meow.mp3'},
    { label: 'турбина самолета', file: 'turbina.mp3'},
    { label: 'womp womp', file: 'downer_noise.mp3'}
].sort((a, b) => a.label.localeCompare(b.label));

document.addEventListener('DOMContentLoaded', () => {
    const soundGrid = document.getElementById('soundGrid');
    const stopButton = document.getElementById('stopButton');
    const randomButton = document.getElementById('randomButton');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const bassBoostToggle = document.getElementById('bassBoostToggle');
    const robotToggle = document.getElementById('robotToggle');
    const distortionToggle = document.getElementById('distortionToggle');
    const activeSounds = new Set();
    const playbackAnimations = new WeakMap();
    const playbackStates = new Map();
    const audioEffects = new AudioEffectsEngine();

    let sequenceRunId = 0;
    let selectedSound = null;

    const soundCards = populateSoundGrid(soundGrid, sounds, selectAndPlaySound);
    updateSelectedCard();
    updateVolumeValue();
    updateSpeedValue();

    document.addEventListener('keydown', event => {
        if (event.key === 'Enter' && event.target === document.body) {
            playSelectedSound();
        }
    });

    stopButton.addEventListener('click', stopAllSounds);
    randomButton.addEventListener('click', playRandomSound);

    volumeSlider.addEventListener('input', () => {
        updateVolumeValue();

        activeSounds.forEach(sound => {
            sound.volume = volumeSlider.value;
        });
    });

    speedSlider.addEventListener('input', () => {
        updateSpeedValue();

        activeSounds.forEach(sound => {
            sound.playbackRate = speedSlider.value;
        });
    });

    bassBoostToggle.addEventListener('change', updateEffectSettings);
    robotToggle.addEventListener('change', updateEffectSettings);
    distortionToggle.addEventListener('change', updateEffectSettings);

    function playSelectedSound() {
        if (!selectedSound) {
            return;
        }

        const soundFile = selectedSound.file;
        const selectedPath = getSoundPath(soundFile);
        const selectedKey = selectedPath.replace(`${SOUND_ROOT}/`, '');
        const specialConfig = SPECIAL_SOUND_CONFIG[selectedKey];

        if (!specialConfig) {
            playSound(selectedPath, soundFile);
            return;
        }

        if (specialConfig.mode === SOUND_MODES.randomClip) {
            playRandomClip(specialConfig, soundFile);
            return;
        }

        playShuffledSequence(specialConfig, soundFile);
    }

    function playRandomSound() {
        selectedSound = getRandomItem(sounds);
        updateSelectedCard();
        playSelectedSound();
    }

    function selectAndPlaySound(sound) {
        selectedSound = sound;
        updateSelectedCard();
        playSelectedSound();
    }

    function updateSelectedCard() {
        soundCards.forEach(card => {
            const isSelected = selectedSound !== null && card.dataset.soundFile === selectedSound.file;
            card.setAttribute('aria-pressed', String(isSelected));

            if (isSelected) {
                delete card.dataset.completed;
            }
        });
    }

    function playRandomClip({ directory, files }, soundFile) {
        playSound(getSoundPath(directory, getRandomItem(files)), soundFile);
    }

    function playShuffledSequence({ directory, files, delayRangeMs }, soundFile) {
        const pool = [...files];
        const currentRunId = ++sequenceRunId;

        function playNext() {
            if (currentRunId !== sequenceRunId || pool.length === 0) {
                return;
            }

            const sound = takeRandomItem(pool);
            playSound(getSoundPath(directory, sound), soundFile);

            setTimeout(playNext, getRandomNumber(delayRangeMs[0], delayRangeMs[1]));
        }

        playNext();
    }

    function playSound(path, soundFile) {
        const sound = new Audio(path);
        sound.dataset.soundFile = soundFile;
        sound.volume = volumeSlider.value;
        sound.playbackRate = speedSlider.value;
        audioEffects.connect(sound);
        activeSounds.add(sound);

        sound.addEventListener('ended', () => {
            finishSound(sound, soundFile, true);
        });

        audioEffects.resume().catch(error => {
            console.error('Could not resume the audio effects engine', error);
        });

        const playPromise = sound.play();
        startPlaybackProgress(sound, soundFile);

        playPromise.catch(error => {
            finishSound(sound, soundFile);
            console.error(`Could not play sound "${path}"`, error);
        });
    }

    function stopAllSounds() {
        sequenceRunId += 1;

        activeSounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
            finishSound(sound, sound.dataset.soundFile);
        });

        if (selectedSound) {
            soundCards.get(selectedSound.file).dataset.completed = 'true';
        }
    }

    function startPlaybackProgress(sound, soundFile) {
        const card = soundCards.get(soundFile);

        if (!card) {
            return;
        }

        const state = playbackStates.get(soundFile) || { activeSounds: new Set(), currentSound: null };
        state.activeSounds.add(sound);
        state.currentSound = sound;
        playbackStates.set(soundFile, state);
        card.dataset.playing = 'true';
        card.style.setProperty('--playback-progress', '0%');

        function updateProgress() {
            if (state.currentSound === sound && Number.isFinite(sound.duration) && sound.duration > 0) {
                const progress = Math.min(100, sound.currentTime / sound.duration * 100);
                card.style.setProperty('--playback-progress', `${progress}%`);
            }

            if (!sound.ended && !sound.paused) {
                playbackAnimations.set(sound, requestAnimationFrame(updateProgress));
            }
        }

        updateProgress();
    }

    function finishSound(sound, soundFile, completed = false) {
        activeSounds.delete(sound);
        clearPlaybackProgress(sound, soundFile, completed);
        audioEffects.disconnect(sound);
    }

    function clearPlaybackProgress(sound, soundFile, completed) {
        const animationFrame = playbackAnimations.get(sound);

        if (animationFrame !== undefined) {
            cancelAnimationFrame(animationFrame);
            playbackAnimations.delete(sound);
        }

        const state = playbackStates.get(soundFile);
        const card = soundCards.get(soundFile);

        if (!state || !card) {
            return;
        }

        state.activeSounds.delete(sound);

        if (state.currentSound !== sound) {
            return;
        }

        const remainingSounds = [...state.activeSounds].filter(activeSound => (
            !activeSound.ended && !activeSound.paused
        ));
        state.currentSound = remainingSounds.at(-1) || null;

        if (!state.currentSound) {
            playbackStates.delete(soundFile);
            card.dataset.playing = 'false';
            card.style.removeProperty('--playback-progress');

            if (completed && selectedSound?.file === soundFile) {
                card.dataset.completed = 'true';
            }
        }
    }

    function updateVolumeValue() {
        volumeValue.textContent = `${Math.round(volumeSlider.value * 100)}%`;
    }

    function updateSpeedValue() {
        speedValue.textContent = `${Number(speedSlider.value).toFixed(2).replace(/\.?0+$/, '')}x`;
    }

    function updateEffectSettings() {
        audioEffects.setEffects({
            bassBoost: bassBoostToggle.checked,
            distortion: distortionToggle.checked,
            robot: robotToggle.checked,
        });
    }
});

function populateSoundGrid(soundGrid, soundList, onSelect) {
    const soundCards = new Map();

    soundList.forEach(sound => {
        const card = document.createElement('button');
        card.className = 'sound-card';
        card.type = 'button';
        card.dataset.soundFile = sound.file;
        card.setAttribute('aria-pressed', 'false');
        card.textContent = sound.label;
        card.addEventListener('click', () => onSelect(sound));
        soundGrid.appendChild(card);
        soundCards.set(sound.file, card);
    });

    return soundCards;
}

function getSoundPath(...parts) {
    return [SOUND_ROOT, ...parts].join('/');
}

function getRandomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function takeRandomItem(items) {
    const index = Math.floor(Math.random() * items.length);
    return items.splice(index, 1)[0];
}

function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}
