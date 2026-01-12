const snowflakeCount = 80;
const snowflakeChars = ['❄', '❅', '❆'];
const snowflakes = document.getElementsByClassName('snowflakes')[0];
console.log(snowflakes.body)

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

    snowflakes.appendChild(snowflake);

    setTimeout(() => {
        snowflake.remove();
        createSnowflake();
    }, duration * 1000);
}

for (let i = 0; i < snowflakeCount; i++) {
    createSnowflake();
}