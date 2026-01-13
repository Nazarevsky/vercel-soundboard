const snowflakeCount = 80;
const snowflakeChars = ['❄', '❅', '❆'];
const snowContainer = document.getElementsByClassName('snowflakes')[0];

function isWinterSeason() {
    const now = new Date();
    const month = now.getMonth(); // 0 = Jan, 11 = Dec
    const day = now.getDate();

    if (month === 11) return true;

    if (month === 0 && day <= 31) return true;

    return false;
}

function letItSnow() {
    if (!snowContainer) {
        console.error("Snow container .snowflakes not found");
        return
    }

    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent =
            snowflakeChars[Math.floor(Math.random() * snowflakeChars.length)];

        const size = Math.random() * 20 + 10;
        const startX = Math.random() * window.innerWidth;
        const duration = Math.random() * 10 + 5;
        const delay = Math.random() * -20;

        snowflake.style.left = `${startX}px`;
        snowflake.style.fontSize = `${size}px`;
        snowflake.style.opacity = Math.random();
        snowflake.style.animationDuration = `${duration}s`;
        snowflake.style.animationDelay = `${delay}s`;

        snowContainer.appendChild(snowflake);

        setTimeout(() => {
            snowflake.remove();
            createSnowflake();
        }, duration * 1000);
    }

    for (let i = 0; i < snowflakeCount; i++) {
        createSnowflake();
    }

}

if (!isWinterSeason()) {
    console.log("Snow disabled (see you 1st December!)");
} else {
    letItSnow()
}
