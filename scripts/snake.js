(() => {
    const ADDRESS_BOOK = {
        'вул. Хрещатик': ['1', '3', '7А', '12', '20', '25Б'],
        'вул. Володимирська': ['2', '5', '9', '14', '20', '33А'],
        'вул. Саксаганського': ['4', '6А', '11', '18', '22'],
        'вул. Антоновича': ['3', '8', '15Б', '19', '27'],
        'вул. Лесі Українки': ['1А', '5', '10', '16', '24'],
    };

    const BOLT_SLASH_PATH = 'M13 2 4 14h6l-1 8 9-12h-6z';

    function boltIcon(size) {
        return `<svg class="cell-icon" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true">` +
            `<path d="${BOLT_SLASH_PATH}" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>` +
            `<line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>` +
            `</svg>`;
    }

    const streetSelect = document.getElementById('streetSelect');
    const houseSelect = document.getElementById('houseSelect');
    const infoBoxUpdated = document.getElementById('infoBoxUpdated');

    function formatDateTime(date) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        return `${hh}:${mi} ${dd}.${mm}.${yyyy}`;
    }

    const now = new Date();
    if (infoBoxUpdated) infoBoxUpdated.textContent = formatDateTime(now);

    function populateStreets() {
        Object.keys(ADDRESS_BOOK).forEach((street) => {
            const option = document.createElement('option');
            option.value = street;
            option.textContent = street;
            streetSelect.appendChild(option);
        });
    }

    function populateHouses(street) {
        houseSelect.innerHTML = '';
        ADDRESS_BOOK[street].forEach((house) => {
            const option = document.createElement('option');
            option.value = house;
            option.textContent = house;
            houseSelect.appendChild(option);
        });
    }

    if (streetSelect && houseSelect) {
        streetSelect.addEventListener('change', () => populateHouses(streetSelect.value));
        populateStreets();
        populateHouses(streetSelect.value);
    }

    const footerYear = document.getElementById('footerYear');
    if (footerYear) footerYear.textContent = String(now.getFullYear());

    const legendSnake = document.getElementById('legendSnake');
    const legendFood = document.getElementById('legendFood');
    if (legendSnake) legendSnake.innerHTML = boltIcon(12);
    if (legendFood) legendFood.innerHTML = boltIcon(12);

    document.querySelectorAll('.faq-row').forEach((row) => {
        row.addEventListener('click', () => {
            const expanded = row.getAttribute('aria-expanded') === 'true';
            row.setAttribute('aria-expanded', String(!expanded));
            const panel = row.nextElementSibling;
            if (panel) panel.hidden = expanded;
        });
    });

    const statusForm = document.getElementById('statusForm');
    if (statusForm) {
        statusForm.addEventListener('submit', (event) => event.preventDefault());
    }

    // ---- Snake game ----
    const headRow = document.getElementById('scheduleHeadRow');
    const body = document.getElementById('scheduleBody');
    if (!headRow || !body) return;

    const COLS = 24;
    const DAYS = ['Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П’ятниця', 'Субота', 'Неділя'];
    const ROWS = DAYS.length;
    const TICK_MS_BASE = 200;
    const TICK_MS_MIN = 90;

    for (let hour = 0; hour < COLS; hour++) {
        const th = document.createElement('th');
        th.textContent = `${String(hour).padStart(2, '0')}-${String((hour + 1) % 24).padStart(2, '0')}`;
        headRow.appendChild(th);
    }

    const cellEls = [];
    const rowEls = [];
    for (let r = 0; r < ROWS; r++) {
        const tr = document.createElement('tr');
        const labelCell = document.createElement('td');
        labelCell.textContent = DAYS[r];
        tr.appendChild(labelCell);

        const rowCells = [];
        for (let c = 0; c < COLS; c++) {
            const td = document.createElement('td');
            td.className = 'cell';
            tr.appendChild(td);
            rowCells.push(td);
        }
        body.appendChild(tr);
        cellEls.push(rowCells);
        rowEls.push(tr);
    }

    const todayJs = now.getDay(); // 0 = Sunday ... 6 = Saturday
    const todayIndex = (todayJs + 6) % 7; // Monday = 0 ... Sunday = 6
    rowEls[todayIndex].classList.add('row-today');

    const scoreValue = document.getElementById('scoreValue');
    const highScoreValue = document.getElementById('highScoreValue');
    const overlay = document.getElementById('gameOverlay');
    const overlayTitle = document.getElementById('gameOverlayTitle');
    const overlayText = document.getElementById('gameOverlayText');
    const overlayButton = document.getElementById('gameOverlayButton');

    let highScore = 0;
    try {
        highScore = parseInt(localStorage.getItem('snake-high-score'), 10) || 0;
    } catch (e) {
        highScore = 0;
    }
    if (highScoreValue) highScoreValue.textContent = String(highScore);

    let snake = [];
    let direction = { dr: 0, dc: 1 };
    let pendingDirection = direction;
    let food = null;
    let score = 0;
    let state = 'idle'; // idle | running | over
    let timer = null;

    function cellKey(r, c) {
        return `${r}:${c}`;
    }

    function randomEmptyCell(occupied) {
        const free = [];
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (!occupied.has(cellKey(r, c))) free.push({ r, c });
            }
        }
        if (free.length === 0) return null;
        return free[Math.floor(Math.random() * free.length)];
    }

    function resetGame() {
        const startRow = Math.floor(ROWS / 2);
        const startCol = Math.floor(COLS / 2);
        snake = [
            { r: startRow, c: startCol - 1 },
            { r: startRow, c: startCol - 2 },
            { r: startRow, c: startCol - 3 },
        ];
        direction = { dr: 0, dc: 1 };
        pendingDirection = direction;
        score = 0;
        if (scoreValue) scoreValue.textContent = '0';

        const occupied = new Set(snake.map((s) => cellKey(s.r, s.c)));
        food = randomEmptyCell(occupied);
        render();
    }

    function render() {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const td = cellEls[r][c];
                td.className = 'cell';
                td.innerHTML = '';
            }
        }

        if (food) {
            const td = cellEls[food.r][food.c];
            td.classList.add('cell--first-half');
            td.innerHTML = boltIcon(14);
        }

        snake.forEach((segment, i) => {
            const td = cellEls[segment.r][segment.c];
            td.classList.add('cell--off');
            if (i === 0) td.classList.add('cell--snake-head');
            td.innerHTML = boltIcon(16);
        });
    }

    function currentTickMs() {
        return Math.max(TICK_MS_MIN, TICK_MS_BASE - score * 6);
    }

    function scheduleTick() {
        clearInterval(timer);
        timer = setInterval(tick, currentTickMs());
    }

    function tick() {
        direction = pendingDirection;
        const head = snake[0];
        const newHead = { r: head.r + direction.dr, c: head.c + direction.dc };

        if (newHead.r < 0 || newHead.r >= ROWS || newHead.c < 0 || newHead.c >= COLS) {
            return gameOver();
        }

        const willEat = food && newHead.r === food.r && newHead.c === food.c;
        const bodyToCheck = willEat ? snake : snake.slice(0, -1);
        if (bodyToCheck.some((s) => s.r === newHead.r && s.c === newHead.c)) {
            return gameOver();
        }

        snake.unshift(newHead);
        if (willEat) {
            score += 1;
            if (scoreValue) scoreValue.textContent = String(score);
            const occupied = new Set(snake.map((s) => cellKey(s.r, s.c)));
            food = randomEmptyCell(occupied);
            scheduleTick();
        } else {
            snake.pop();
        }

        render();
    }

    function showOverlay(title, text, buttonLabel) {
        if (!overlay) return;
        overlayTitle.textContent = title;
        overlayText.textContent = text;
        overlayButton.textContent = buttonLabel;
        overlay.hidden = false;
    }

    function hideOverlay() {
        if (overlay) overlay.hidden = true;
    }

    function startGame() {
        resetGame();
        state = 'running';
        hideOverlay();
        scheduleTick();
    }

    function gameOver() {
        clearInterval(timer);
        state = 'over';
        if (score > highScore) {
            highScore = score;
            if (highScoreValue) highScoreValue.textContent = String(highScore);
            try {
                localStorage.setItem('snake-high-score', String(highScore));
            } catch (e) {
                /* ignore */
            }
        }
        showOverlay(
            `Гра закінчена! Рахунок: ${score}`,
            'Керування: стрілки або WASD. На мобільних — свайп або кнопки нижче.',
            'Зіграти ще раз'
        );
    }

    function setDirection(dr, dc) {
        if (state !== 'running') {
            startGame();
        }
        if (pendingDirection.dr === -dr && pendingDirection.dc === -dc) return; // no reversing
        pendingDirection = { dr, dc };
    }

    const KEY_MAP = {
        ArrowUp: [-1, 0],
        KeyW: [-1, 0],
        ArrowDown: [1, 0],
        KeyS: [1, 0],
        ArrowLeft: [0, -1],
        KeyA: [0, -1],
        ArrowRight: [0, 1],
        KeyD: [0, 1],
    };

    document.addEventListener('keydown', (event) => {
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
        const move = KEY_MAP[event.code];
        if (!move) return;
        event.preventDefault();
        setDirection(move[0], move[1]);
    });

    const dpadUp = document.getElementById('dpadUp');
    const dpadDown = document.getElementById('dpadDown');
    const dpadLeft = document.getElementById('dpadLeft');
    const dpadRight = document.getElementById('dpadRight');
    if (dpadUp) dpadUp.addEventListener('click', () => setDirection(-1, 0));
    if (dpadDown) dpadDown.addEventListener('click', () => setDirection(1, 0));
    if (dpadLeft) dpadLeft.addEventListener('click', () => setDirection(0, -1));
    if (dpadRight) dpadRight.addEventListener('click', () => setDirection(0, 1));

    if (overlayButton) overlayButton.addEventListener('click', startGame);

    const tableScroll = document.querySelector('.table-scroll');
    if (tableScroll) {
        let touchStart = null;
        tableScroll.addEventListener('touchstart', (event) => {
            const t = event.changedTouches[0];
            touchStart = { x: t.clientX, y: t.clientY };
        }, { passive: true });

        tableScroll.addEventListener('touchend', (event) => {
            if (!touchStart) return;
            const t = event.changedTouches[0];
            const dx = t.clientX - touchStart.x;
            const dy = t.clientY - touchStart.y;
            touchStart = null;
            if (Math.abs(dx) < 24 && Math.abs(dy) < 24) return;
            if (Math.abs(dx) > Math.abs(dy)) {
                setDirection(0, dx > 0 ? 1 : -1);
            } else {
                setDirection(dy > 0 ? 1 : -1, 0);
            }
        }, { passive: true });
    }

    resetGame();
    showOverlay('Натисніть стрілку, щоб почати', 'Керування: стрілки або WASD. На мобільних — свайп або кнопки нижче.', 'Почати гру');
})();
