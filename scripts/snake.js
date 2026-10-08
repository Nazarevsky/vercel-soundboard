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

    function hashString(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function mulberry32(seed) {
        let a = seed;
        return () => {
            a |= 0;
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    // Returns 24 entries: 'on' | 'off' | 'off-first-half' | 'off-second-half'
    function generateDaySchedule(street, house, dayOffset) {
        const rng = mulberry32(hashString(`${street}|${house}|${dayOffset}`));
        const slots = new Array(24).fill('on');
        const blockCount = 1 + Math.floor(rng() * 2);

        for (let b = 0; b < blockCount; b++) {
            const startHalfHour = Math.floor(rng() * 44); // 0..43 half-hour units within 0-22h
            const lengthHalfHours = 4 + Math.floor(rng() * 7); // 2h..5.5h
            const startUnit = startHalfHour;
            const endUnit = Math.min(startUnit + lengthHalfHours, 47);

            for (let unit = startUnit; unit < endUnit; unit++) {
                const hour = Math.floor(unit / 2);
                const isFirstHalf = unit % 2 === 0;
                if (hour > 23) continue;

                if (unit === startUnit && !isFirstHalf) {
                    if (slots[hour] === 'on') slots[hour] = 'off-second-half';
                } else if (unit === endUnit - 1 && isFirstHalf) {
                    if (slots[hour] === 'on') slots[hour] = 'off-first-half';
                } else {
                    slots[hour] = 'off';
                }
            }
        }

        return slots;
    }

    function formatDate(date) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yy = String(date.getFullYear()).slice(-2);
        return `${dd}.${mm}.${yy}`;
    }

    function formatDateTime(date) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        return `${hh}:${mi} ${dd}.${mm}.${yyyy}`;
    }

    const streetSelect = document.getElementById('streetSelect');
    const houseSelect = document.getElementById('houseSelect');
    const infoBoxUpdated = document.getElementById('infoBoxUpdated');
    const tableUpdated = document.getElementById('tableUpdated');
    const todayLabel = document.getElementById('todayLabel');
    const tomorrowLabel = document.getElementById('tomorrowLabel');
    const todayTab = document.getElementById('todayTab');
    const tomorrowTab = document.getElementById('tomorrowTab');
    const headRow = document.getElementById('scheduleHeadRow');
    const bodyRow = document.getElementById('scheduleBodyRow');

    const now = new Date();
    const tomorrowDate = new Date(now);
    tomorrowDate.setDate(now.getDate() + 1);

    infoBoxUpdated.textContent = formatDateTime(now);
    tableUpdated.textContent = formatDateTime(now);
    todayLabel.textContent = formatDate(now);
    tomorrowLabel.textContent = formatDate(tomorrowDate);
    todayTab.querySelector('.day-tab-icon').innerHTML = boltIcon(14);
    tomorrowTab.querySelector('.day-tab-icon').innerHTML = boltIcon(14);

    const legendOff = document.getElementById('legendOff');
    const legendFirst = document.getElementById('legendFirst');
    const legendSecond = document.getElementById('legendSecond');
    if (legendOff) legendOff.innerHTML = boltIcon(12);
    if (legendFirst) legendFirst.innerHTML = boltIcon(12);
    if (legendSecond) legendSecond.innerHTML = boltIcon(12);

    const footerYear = document.getElementById('footerYear');
    if (footerYear) footerYear.textContent = String(now.getFullYear());

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

    for (let hour = 0; hour < 24; hour++) {
        const th = document.createElement('th');
        th.textContent = `${String(hour).padStart(2, '0')}-${String((hour + 1) % 24).padStart(2, '0')}`;
        headRow.appendChild(th);
    }

    let currentDay = 0; // 0 = today, 1 = tomorrow

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

    function renderTable() {
        const street = streetSelect.value;
        const house = houseSelect.value;
        const slots = generateDaySchedule(street, house, currentDay);

        bodyRow.innerHTML = '';
        const labelCell = document.createElement('td');
        labelCell.textContent = `${street}, ${house}`;
        bodyRow.appendChild(labelCell);

        slots.forEach((status) => {
            const td = document.createElement('td');
            td.className = 'cell';
            if (status === 'off') {
                td.classList.add('cell--off');
                td.innerHTML = boltIcon(16);
            } else if (status === 'off-first-half') {
                td.classList.add('cell--first-half');
                td.innerHTML = boltIcon(14);
            } else if (status === 'off-second-half') {
                td.classList.add('cell--second-half');
                td.innerHTML = boltIcon(14);
            }
            bodyRow.appendChild(td);
        });
    }

    function setDay(day) {
        currentDay = day;
        const isToday = day === 0;
        todayTab.setAttribute('aria-selected', String(isToday));
        tomorrowTab.setAttribute('aria-selected', String(!isToday));
        renderTable();
    }

    streetSelect.addEventListener('change', () => {
        populateHouses(streetSelect.value);
        renderTable();
    });

    houseSelect.addEventListener('change', renderTable);
    todayTab.addEventListener('click', () => setDay(0));
    tomorrowTab.addEventListener('click', () => setDay(1));

    populateStreets();
    populateHouses(streetSelect.value);
    renderTable();
})();
