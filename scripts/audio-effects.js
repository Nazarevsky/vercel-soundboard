const DEFAULT_EFFECT_STATE = {
    bassBoost: false,
    distortion: false,
    robot: false,
};

export class AudioEffectsEngine {
    constructor() {
        this.context = null;
        this.distortionCurve = null;
        this.effectState = { ...DEFAULT_EFFECT_STATE };
        this.graphsBySound = new WeakMap();
        this.activeGraphs = new Set();
    }

    connect(sound) {
        const context = this.getContext();

        if (!context) {
            return;
        }

        const graph = this.createGraph(context, sound);
        this.graphsBySound.set(sound, graph);
        this.activeGraphs.add(graph);
        this.applyEffectState(graph);
    }

    disconnect(sound) {
        const graph = this.graphsBySound.get(sound);

        if (!graph) {
            return;
        }

        graph.robotOscillator.stop();
        Object.values(graph).forEach(node => node.disconnect());
        this.activeGraphs.delete(graph);
        this.graphsBySound.delete(sound);
    }

    setEffects(effectState) {
        this.effectState = { ...this.effectState, ...effectState };
        this.activeGraphs.forEach(graph => this.applyEffectState(graph));
    }

    resume() {
        const context = this.getContext();

        if (!context || context.state !== 'suspended') {
            return Promise.resolve();
        }

        return context.resume();
    }

    getContext() {
        if (this.context) {
            return this.context;
        }

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
            return null;
        }

        this.context = new AudioContextClass();
        return this.context;
    }

    createGraph(context, sound) {
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

        return {
            source,
            bassFilter,
            distortion,
            robotGain,
            robotOscillator,
            robotDepth,
            limiter,
        };
    }

    applyEffectState(graph) {
        graph.bassFilter.gain.value = this.effectState.bassBoost ? 14 : 0;
        graph.distortion.curve = this.effectState.distortion ? this.getDistortionCurve() : null;
        graph.robotGain.gain.value = this.effectState.robot ? 0.5 : 1;
        graph.robotDepth.gain.value = this.effectState.robot ? 0.5 : 0;
    }

    getDistortionCurve(amount = 90) {
        if (this.distortionCurve) {
            return this.distortionCurve;
        }

        const sampleCount = 44100;
        const degrees = Math.PI / 180;
        this.distortionCurve = new Float32Array(sampleCount);

        for (let index = 0; index < sampleCount; index += 1) {
            const value = index * 2 / sampleCount - 1;
            this.distortionCurve[index] = (3 + amount) * value * 20 * degrees
                / (Math.PI + amount * Math.abs(value));
        }

        return this.distortionCurve;
    }
}
