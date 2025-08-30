document.addEventListener('DOMContentLoaded', () => {
    const gameTimeElement = document.getElementById('game-time');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const hungerProgress = document.getElementById('hunger');
    const thirstProgress = document.getElementById('thirst');
    const cleanlinessProgress = document.getElementById('cleanliness');
    const oxygenProgress = document.getElementById('oxygen');
    const npcStatusElement = document.getElementById('npc-status');
    const wakeupSound = document.getElementById('wakeup-sound');
    const clickSound = document.getElementById('click-sound');

    const hungerMeter = document.getElementById('hunger-meter');
    const thirstMeter = document.getElementById('thirst-meter');
    const cleanlinessMeter = document.getElementById('cleanliness-meter');
    const oxygenMeter = document.getElementById('oxygen-meter');

    const hungerRateInput = document.getElementById('hunger-rate');
    const thirstRateInput = document.getElementById('thirst-rate');
    const cleanlinessRateInput = document.getElementById('cleanliness-rate');
    const oxygenRateInput = document.getElementById('oxygen-rate');
    const doorbellMinTimeInput = document.getElementById('doorbell-min-time');
    const doorbellMaxTimeInput = document.getElementById('doorbell-max-time');
    const applySettingsBtn = document.getElementById('apply-settings-btn');

    const hungerReplenishInput = document.getElementById('hunger-replenish');
    const thirstReplenishInput = document.getElementById('thirst-replenish');
    const cleanlinessReplenishInput = document.getElementById('cleanliness-replenish');
    const oxygenReplenishInput = document.getElementById('oxygen-replenish');

    let gameTime = 0;
    let gameRunning = false;
    let gameInterval;
    let doorbellTimeout;

    let settings = {
        hungerRate: parseFloat(hungerRateInput.value),
        thirstRate: parseFloat(thirstRateInput.value),
        cleanlinessRate: parseFloat(cleanlinessRateInput.value),
        oxygenRate: parseFloat(oxygenRateInput.value),
        hungerReplenish: parseFloat(hungerReplenishInput.value),
        thirstReplenish: parseFloat(thirstReplenishInput.value),
        cleanlinessReplenish: parseFloat(cleanlinessReplenishInput.value),
        oxygenReplenish: parseFloat(oxygenReplenishInput.value),
        doorbellMinTime: parseInt(doorbellMinTimeInput.value) * 1000,
        doorbellMaxTime: parseInt(doorbellMaxTimeInput.value) * 1000,
    };

    function updateMeters() {
        if (hungerProgress.value > 0) hungerProgress.value -= settings.hungerRate;
        if (thirstProgress.value > 0) thirstProgress.value -= settings.thirstRate;
        if (cleanlinessProgress.value > 0) cleanlinessProgress.value -= settings.cleanlinessRate;
        if (oxygenProgress.value > 0) oxygenProgress.value -= settings.oxygenRate;
    }

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    function scheduleDoorbell() {
        const time = Math.random() * (settings.doorbellMaxTime - settings.doorbellMinTime) + settings.doorbellMinTime;
        doorbellTimeout = setTimeout(() => {
            wakeupSound.play();
            npcStatusElement.textContent = 'The bad guy is waking up!';
            setTimeout(() => {
                npcStatusElement.textContent = '';
            }, 5000);
            scheduleDoorbell();
        }, time);
    }

    function startGame() {
        gameRunning = true;
        playPauseBtn.textContent = 'Pause';
        gameInterval = setInterval(() => {
            gameTime++;
            gameTimeElement.textContent = formatTime(gameTime);
            updateMeters();
        }, 1000);
        scheduleDoorbell();
    }

    function pauseGame() {
        gameRunning = false;
        playPauseBtn.textContent = 'Play';
        clearInterval(gameInterval);
        clearTimeout(doorbellTimeout);
    }

    playPauseBtn.addEventListener('click', () => {
        if (gameRunning) {
            pauseGame();
        } else {
            startGame();
        }
    });

    applySettingsBtn.addEventListener('click', () => {
        settings.hungerRate = parseFloat(hungerRateInput.value);
        settings.thirstRate = parseFloat(thirstRateInput.value);
        settings.cleanlinessRate = parseFloat(cleanlinessRateInput.value);
        settings.oxygenRate = parseFloat(oxygenRateInput.value);
        settings.hungerReplenish = parseFloat(hungerReplenishInput.value);
        settings.thirstReplenish = parseFloat(thirstReplenishInput.value);
        settings.cleanlinessReplenish = parseFloat(cleanlinessReplenishInput.value);
        settings.oxygenReplenish = parseFloat(oxygenReplenishInput.value);
        settings.doorbellMinTime = parseInt(doorbellMinTimeInput.value) * 1000;
        settings.doorbellMaxTime = parseInt(doorbellMaxTimeInput.value) * 1000;
        alert('Settings applied!');
    });

    hungerMeter.addEventListener('click', () => {
        hungerProgress.value = Math.min(100, hungerProgress.value + settings.hungerReplenish);
        clickSound.play();
    });

    thirstMeter.addEventListener('click', () => {
        thirstProgress.value = Math.min(100, thirstProgress.value + settings.thirstReplenish);
        clickSound.play();
    });

    cleanlinessMeter.addEventListener('click', () => {
        cleanlinessProgress.value = Math.min(100, cleanlinessProgress.value + settings.cleanlinessReplenish);
        clickSound.play();
    });

    oxygenMeter.addEventListener('click', () => {
        oxygenProgress.value = Math.min(100, oxygenProgress.value + settings.oxygenReplenish);
        clickSound.play();
    });
});

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}
