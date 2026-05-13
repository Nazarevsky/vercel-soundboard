const SNOWFLAKE_COUNT = 80;
const SNOWFLAKE_CHARS = ['❄', '❅', '❆'];
const WINTER_MONTHS = new Set([0, 11]);
const snowContainer = document.getElementsByClassName('snowflakes')[0];

function isWinterSeason() {
    const now = new Date();
    return WINTER_MONTHS.has(now.getMonth());
}

function letItSnow() {
    if (!snowContainer) {
        console.error("Snow container .snowflakes not found");
        return;
    }

    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = getRandomSnowflakeItem(SNOWFLAKE_CHARS);

        const duration = getRandomSnowflakeNumber(5, 15);

        snowflake.style.left = `${getRandomSnowflakeNumber(0, window.innerWidth)}px`;
        snowflake.style.fontSize = `${getRandomSnowflakeNumber(10, 30)}px`;
        snowflake.style.opacity = Math.random();
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.animationDelay = `${getRandomSnowflakeNumber(-20, 0)}s`;

        snowContainer.appendChild(snowflake);

        setTimeout(() => {
            snowflake.remove();
            createSnowflake();
        }, duration * 1000);
    }

    for (let i = 0; i < SNOWFLAKE_COUNT; i++) {
        createSnowflake();
    }
}

if (!isWinterSeason()) {
    console.log("Snow disabled (see you 1st December!)");
} else {
    letItSnow();
}

function getRandomSnowflakeItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function getRandomSnowflakeNumber(min, max) {
    return Math.random() * (max - min) + min;
}
