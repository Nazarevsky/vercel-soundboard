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
    const soundSelect = document.getElementById('soundSelect');
    const startButton = document.getElementById('startButton');
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
    const effectGraphs = new WeakMap();

    let sequenceRunId = 0;
    let audioContext;
    let distortionCurve;

    populateSoundSelect(soundSelect, sounds);
    updateVolumeValue();
    updateSpeedValue();

    document.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            playSelectedSound();
        }
    });

    startButton.addEventListener('click', playSelectedSound);
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

    bassBoostToggle.addEventListener('change', updateActiveEffects);
    robotToggle.addEventListener('change', updateActiveEffects);
    distortionToggle.addEventListener('change', updateActiveEffects);

    function playSelectedSound() {
        const selectedPath = soundSelect.value;
        const selectedKey = selectedPath.replace(`${SOUND_ROOT}/`, '');
        const specialConfig = SPECIAL_SOUND_CONFIG[selectedKey];

        if (!specialConfig) {
            playSound(selectedPath);
            return;
        }

        if (specialConfig.mode === SOUND_MODES.randomClip) {
            playRandomClip(specialConfig);
            return;
        }

        playShuffledSequence(specialConfig);
    }

    function playRandomSound() {
        const sound = getRandomItem(sounds);
        soundSelect.value = getSoundPath(sound.file);
        playSelectedSound();
    }

    function playRandomClip({ directory, files }) {
        playSound(getSoundPath(directory, getRandomItem(files)));
    }

    function playShuffledSequence({ directory, files, delayRangeMs }) {
        const pool = [...files];
        const currentRunId = ++sequenceRunId;

        function playNext() {
            if (currentRunId !== sequenceRunId || pool.length === 0) {
                return;
            }

            const sound = takeRandomItem(pool);
            playSound(getSoundPath(directory, sound));

            setTimeout(playNext, getRandomNumber(delayRangeMs[0], delayRangeMs[1]));
        }

        playNext();
    }

    function playSound(path) {
        const sound = new Audio(path);
        sound.volume = volumeSlider.value;
        sound.playbackRate = speedSlider.value;
        const effectGraph = createEffectGraph(sound);
        activeSounds.add(sound);

        sound.addEventListener('ended', () => {
            activeSounds.delete(sound);
            disconnectEffectGraph(effectGraph);
        });

        resumeAudioContext().then(() => sound.play()).catch(error => {
            activeSounds.delete(sound);
            disconnectEffectGraph(effectGraph);
            console.error(`Could not play sound "${path}"`, error);
        });
    }

    function stopAllSounds() {
        sequenceRunId += 1;

        activeSounds.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
            disconnectEffectGraph(effectGraphs.get(sound));
        });

        activeSounds.clear();
    }

    function updateVolumeValue() {
        volumeValue.textContent = `${Math.round(volumeSlider.value * 100)}%`;
    }

    function updateSpeedValue() {
        speedValue.textContent = `${Number(speedSlider.value).toFixed(2).replace(/\.?0+$/, '')}x`;
    }

    function getAudioContext() {
        if (audioContext) {
            return audioContext;
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            return null;
        }

        audioContext = new AudioContextClass();
        return audioContext;
    }

    function resumeAudioContext() {
        const context = getAudioContext();

        if (!context || context.state !== 'suspended') {
            return Promise.resolve();
        }

        return context.resume();
    }

    function createEffectGraph(sound) {
        const context = getAudioContext();

        if (!context) {
            return null;
        }

        const source = context.createMediaElementSource(sound);
        const bassFilter = context.createBiquadFilter();
        const distortion = context.createWaveShaper();
        const robotGain = context.createGain();
        const robotOscillator = context.createOscillator();
        const robotDepth = context.createGain();
        const limiter = context.createDynamicsCompressor();

        bassFilter.type = 'lowshelf';
        bassFilter.frequency.value = 220;
        distortion.oversample = '4x';
        robotOscillator.type = 'sine';
        robotOscillator.frequency.value = 35;
        limiter.threshold.value = -6;
        limiter.ratio.value = 12;
        limiter.attack.value = 0.003;
        limiter.release.value = 0.15;

        source.connect(bassFilter);
        bassFilter.connect(distortion);
        distortion.connect(robotGain);
        robotGain.connect(limiter);
        limiter.connect(context.destination);
        robotOscillator.connect(robotDepth);
        robotDepth.connect(robotGain.gain);
        robotOscillator.start();

        const graph = {
            source,
            bassFilter,
            distortion,
            robotGain,
            robotOscillator,
            robotDepth,
            limiter,
        };
        effectGraphs.set(sound, graph);
        applyEffects(graph);
        return graph;
    }

    function createDistortionCurve(amount = 90) {
        if (distortionCurve) {
            return distortionCurve;
        }

        const sampleCount = 44100;
        distortionCurve = new Float32Array(sampleCount);
        const degrees = Math.PI / 180;

        for (let index = 0; index < sampleCount; index += 1) {
            const value = index * 2 / sampleCount - 1;
            distortionCurve[index] = (3 + amount) * value * 20 * degrees
                / (Math.PI + amount * Math.abs(value));
        }

        return distortionCurve;
    }

    function updateActiveEffects() {
        activeSounds.forEach(sound => applyEffects(effectGraphs.get(sound)));
    }

    function applyEffects(graph) {
        if (!graph) {
            return;
        }

        graph.bassFilter.gain.value = bassBoostToggle.checked ? 14 : 0;
        graph.distortion.curve = distortionToggle.checked ? createDistortionCurve() : null;
        graph.robotGain.gain.value = robotToggle.checked ? 0.5 : 1;
        graph.robotDepth.gain.value = robotToggle.checked ? 0.5 : 0;
    }

    function disconnectEffectGraph(graph) {
        if (!graph) {
            return;
        }

        graph.robotOscillator.stop();
        Object.values(graph).forEach(node => node.disconnect());
    }
});

function populateSoundSelect(soundSelect, soundList) {
    soundList.forEach(({ label, file }) => {
        const option = document.createElement('option');
        option.value = getSoundPath(file);
        option.textContent = label;
        soundSelect.appendChild(option);
    });
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
