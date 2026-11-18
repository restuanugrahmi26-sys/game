
import * as THREE from "three";

// ===================================
// PENGATURAN DASAR
// ===================================

const container = document.getElementById("gameContainer");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91c9e8);
scene.fog = new THREE.Fog(0x91c9e8, 60, 180);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    300
);

camera.position.set(0, 8, 16);
camera.lookAt(0, 0, -10);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

// ===================================
// CAHAYA
// ===================================

scene.add(new THREE.HemisphereLight(0xffffff, 0x526b4c, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(-10, 20, 10);
sunlight.castShadow = true;
scene.add(sunlight);

// ===================================
// LINGKUNGAN DAN JALAN
// ===================================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(250, 300),
    new THREE.MeshStandardMaterial({ color: 0x267b43 })
);

ground.rotation.x = -Math.PI / 2;
ground.position.set(0, -0.2, -80);
ground.receiveShadow = true;
scene.add(ground);

const road = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 220),
    new THREE.MeshStandardMaterial({ color: 0x30343a })
);

road.rotation.x = -Math.PI / 2;
road.position.set(0, -0.08, -80);
road.receiveShadow = true;
scene.add(road);

// Garis tepi jalan
for (const x of [-5.8, 5.8]) {
    const edge = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.04, 220),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    edge.position.set(x, 0.02, -80);
    scene.add(edge);
}

// Garis pembatas jalur
const roadLines = [];

for (const x of [-2, 2]) {
    for (let i = 0; i < 22; i++) {
        const line = new THREE.Mesh(
            new THREE.BoxGeometry(0.12, 0.04, 4),
            new THREE.MeshStandardMaterial({ color: 0xffffff })
        );

        line.position.set(x, 0.025, 10 - i * 10);
        scene.add(line);
        roadLines.push(line);
    }
}

// ===================================
// POHON DI SAMPING JALAN
// ===================================

const trees = [];

function createTree(x, z) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 2, 8),
        new THREE.MeshStandardMaterial({ color: 0x704322 })
    );

    trunk.position.y = 1;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1.3, 3, 8),
        new THREE.MeshStandardMaterial({ color: 0x116b37 })
    );

    leaves.position.y = 3;
    tree.add(leaves);

    tree.position.set(x, 0, z);
    scene.add(tree);
    trees.push(tree);
}

for (let i = 0; i < 24; i++) {
    const z = 10 - i * 10;
    createTree(-9, z);
    createTree(9, z);
}

// ===================================
// PILIHAN WARNA
// ===================================

const colors = {
    red: 0xe52525,
    blue: 0x147ce5,
    black: 0x252b32,
    white: 0xeceff1,
    yellow: 0xffd21c,
    green: 0x00a85a
};

// ===================================
// FUNGSI PEMBUAT MOBIL 3D
// ===================================

function createCar(design, colorName) {
    const car = new THREE.Group();

    const color = colors[colorName] || colors.red;

    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: color,
        metalness: 0.55,
        roughness: 0.3
    });

    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x152b3d,
        metalness: 0.3,
        roughness: 0.15
    });

    const wheelMaterial = new THREE.MeshStandardMaterial({
        color: 0x101010,
        roughness: 0.85
    });

    const detailMaterial = new THREE.MeshStandardMaterial({
        color: 0xdddddd,
        metalness: 0.7
    });

    const isFormula = design === "formula";
    const isFuture = design === "future";
    const isSport = design === "sport";

    // Badan utama
    const bodyLength = isFormula ? 3.6 : 2.8;
    const bodyWidth = isFormula ? 1.5 : 1.65;
    const bodyHeight = isFormula ? 0.35 : 0.55;

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyLength),
        bodyMaterial
    );

    body.position.y = 0.55;
    body.castShadow = true;
    car.add(body);

    // Kap depan
    if (isFuture) {
        const hood = new THREE.Mesh(
            new THREE.ConeGeometry(0.85, 1.2, 4),
            bodyMaterial
        );

        hood.rotation.x = -Math.PI / 2;
        hood.position.set(0, 0.55, 1.35);
        car.add(hood);
    }

    // Kabin
    const cabinWidth = isFormula ? 0.85 : isSport ? 1.15 : 1.25;
    const cabinHeight = isFormula ? 0.5 : 0.65;
    const cabinLength = isFormula ? 1.0 : isSport ? 1.35 : 1.45;

    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(cabinWidth, cabinHeight, cabinLength),
        glassMaterial
    );

    cabin.position.set(0, isFormula ? 0.92 : 1.12, -0.1);
    cabin.castShadow = true;
    car.add(cabin);

    // Atap mobil
    if (!isFormula) {
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(cabinWidth * 0.92, 0.08, cabinLength * 0.65),
            bodyMaterial
        );

        roof.position.set(0, 1.48, -0.12);
        car.add(roof);
    }

    // Roda
    const wheelPositions = isFormula
        ? [
            [-0.92, 0.37, -1.15],
            [0.92, 0.37, -1.15],
            [-0.92, 0.37, 1.2],
            [0.92, 0.37, 1.2]
        ]
        : [
            [-0.9, 0.38, -0.85],
            [0.9, 0.38, -0.85],
            [-0.9, 0.38, 0.85],
            [0.9, 0.38, 0.85]
        ];

    wheelPositions.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(
                isFormula ? 0.43 : 0.34,
                isFormula ? 0.43 : 0.34,
                0.24,
                20
            ),
            wheelMaterial
        );

        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        wheel.castShadow = true;
        car.add(wheel);

        const hub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.26, 12),
            detailMaterial
        );

        hub.rotation.z = Math.PI / 2;
        hub.position.set(x, y, z);
        car.add(hub);
    });

    // Lampu depan dan belakang
    for (const x of [-0.52, 0.52]) {
        const frontLight = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.13, 0.08),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xaaaaaa
            })
        );

        frontLight.position.set(x, 0.62, 1.43);
        car.add(frontLight);

        const rearLight = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.13, 0.08),
            new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0x880000
            })
        );

        rearLight.position.set(x, 0.62, -1.43);
        car.add(rearLight);
    }

    // Spoiler mobil sport dan Formula 1
    if (isFormula || isSport) {
        const wing = new THREE.Mesh(
            new THREE.BoxGeometry(
                isFormula ? 2.5 : 1.9,
                0.13,
                0.35
            ),
            bodyMaterial
        );

        wing.position.set(0, isFormula ? 0.95 : 1.15, -1.55);
        car.add(wing);

        if (isFormula) {
            for (const x of [-0.7, 0.7]) {
                const support = new THREE.Mesh(
                    new THREE.BoxGeometry(0.12, 0.6, 0.12),
                    detailMaterial
                );

                support.position.set(x, 0.75, -1.5);
                car.add(support);
            }
        }
    }

    // Lampu neon untuk mobil futuristik
    if (isFuture) {
        const neon = new THREE.Mesh(
            new THREE.BoxGeometry(1.9, 0.06, 2.4),
            new THREE.MeshBasicMaterial({ color: 0x00eaff })
        );

        neon.position.y = 0.25;
        car.add(neon);
    }

    return car;
}

// ===================================
// MOBIL PEMAIN DAN MUSUH
// ===================================

let playerDesign = "supercar";
let playerColor = "red";
let enemyDesign = "sport";
let enemyColor = "black";

let player = createCar(playerDesign, playerColor);
player.position.set(0, 0, 5);
scene.add(player);

const enemies = [];
const lanes = [-3.5, 0, 3.5];

function refreshPlayer() {
    const oldX = player.position.x;

    scene.remove(player);
    player = createCar(playerDesign, playerColor);
    player.position.set(oldX, 0, 5);
    scene.add(player);
}

function spawnEnemy() {
    const enemy = createCar(enemyDesign, enemyColor);

    const lane = lanes[Math.floor(Math.random() * lanes.length)];

    enemy.position.set(lane, 0, -100);

    scene.add(enemy);
    enemies.push(enemy);
}

function clearEnemies() {
    enemies.forEach(enemy => scene.remove(enemy));
    enemies.length = 0;
}

// ===================================
// GARASI: GANTI DESAIN DAN WARNA
// ===================================

document.getElementById("playerDesign").addEventListener(
    "change",
    event => {
        playerDesign = event.target.value;
        refreshPlayer();
    }
);

document.getElementById("playerColor").addEventListener(
    "change",
    event => {
        playerColor = event.target.value;
        refreshPlayer();
    }
);

document.getElementById("enemyDesign").addEventListener(
    "change",
    event => {
        enemyDesign = event.target.value;
    }
);

document.getElementById("enemyColor").addEventListener(
    "change",
    event => {
        enemyColor = event.target.value;
    }
);

// ===================================
// STATUS GAME
// ===================================

let gameRunning = false;
let score = 0;
let speed = 25;
let level = 1;
let lastSpawn = 0;
let spawnDelay = 1600;

const menu = document.getElementById("menu");

function updateHUD() {
    document.getElementById("score").textContent = score;
    document.getElementById("speed").textContent =
        Math.floor(speed * 4);

    document.getElementById("level").textContent = level;
}

// ===================================
// KONTROL MOBIL
// ===================================

function moveLeft() {
    if (!gameRunning) return;

    const current = lanes.indexOf(player.position.x);

    if (current > 0) {
        player.position.x = lanes[current - 1];
    }
}

function moveRight() {
    if (!gameRunning) return;

    const current = lanes.indexOf(player.position.x);

    if (current < lanes.length - 1) {
        player.position.x = lanes[current + 1];
    }
}

document.getElementById("leftButton").addEventListener(
    "click",
    moveLeft
);

document.getElementById("rightButton").addEventListener(
    "click",
    moveRight
);

window.addEventListener("keydown", event => {
    if (
        event.key === "ArrowLeft" ||
        event.key.toLowerCase() === "a"
    ) {
        moveLeft();
    }

    if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
    ) {
        moveRight();
    }
});

// ===================================
// DETEKSI TABRAKAN
// ===================================

function checkCollision(enemy) {
    const dx = Math.abs(player.position.x - enemy.position.x);
    const dz = Math.abs(player.position.z - enemy.position.z);

    return dx < 1.5 && dz < 2.4;
}

// ===================================
// MUSIK GAME
// ===================================

let audioContext = null;
let musicInterval = null;
let musicEnabled = true;
let noteIndex = 0;

const notes = [
    261.63, 329.63, 392, 329.63,
    293.66, 349.23, 440, 349.23,
    261.63, 329.63, 392, 523.25,
    440, 392, 329.63, 293.66
];

function playNote(frequency) {
    if (!audioContext || !musicEnabled) return;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.025, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.2
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
}

function startMusic() {
    if (!musicEnabled || musicInterval) return;

    if (!audioContext) {
        audioContext = new (
            window.AudioContext || window.webkitAudioContext
        )();
    }

    audioContext.resume();

    musicInterval = setInterval(() => {
        playNote(notes[noteIndex]);

        noteIndex = (noteIndex + 1) % notes.length;
    }, 250);

    document.getElementById("musicButton").textContent =
        "🔊 MUSIK ON";
}

function stopMusic() {
    clearInterval(musicInterval);
    musicInterval = null;

    if (audioContext) {
        audioContext.suspend();
    }

    document.getElementById("musicButton").textContent =
        "🔇 MUSIK OFF";
}

document.getElementById("musicButton").addEventListener(
    "click",
    () => {
        musicEnabled = !musicEnabled;

        if (musicEnabled) {
            startMusic();
        } else {
            stopMusic();
        }
    }
);

// ===================================
// MULAI GAME
// ===================================

function startGame() {
    score = 0;
    speed = 25;
    level = 1;
    spawnDelay = 1600;
    lastSpawn = 0;

    clearEnemies();

    player.position.x = 0;

    gameRunning = true;
    menu.style.display = "none";

    if (musicEnabled) {
        startMusic();
    }

    updateHUD();
}

document.getElementById("startButton").addEventListener(
    "click",
    startGame
);

// ===================================
// GAME OVER
// ===================================

function gameOver() {
    gameRunning = false;
    stopMusic();

    menu.innerHTML = `
        <h1>🏁 GAME OVER!</h1>
        <p class="subtitle">Balapan telah selesai.</p>
        <h2>SKOR KAMU: ${score}</h2>
        <p class="instruction">Pilih kembali desain mobil di garasi atau langsung bermain lagi.</p>

        <div class="garage">
            <div class="garage-section">
                <h3>🚘 MOBIL PEMAIN</h3>
                <label>Desain mobil</label>
                <select id="playerDesign">
                    <option value="supercar">Supercar</option>
                    <option value="sport">Sport Car</option>
                    <option value="formula">Formula 1</option>
                    <option value="future">Futuristik</option>
                </select>
                <label>Warna mobil</label>
                <select id="playerColor">
                    <option value="red">Merah</option>
                    <option value="blue">Biru</option>
                    <option value="black">Hitam</option>
                    <option value="white">Putih</option>
                    <option value="yellow">Kuning</option>
                    <option value="green">Hijau</option>
                </select>
            </div>

            <div class="garage-section">
                <h3>🚗 MOBIL MUSUH</h3>
                <label>Desain mobil</label>
                <select id="enemyDesign">
                    <option value="sport">Sport Car</option>
                    <option value="supercar">Supercar</option>
                    <option value="formula">Formula 1</option>
                    <option value="future">Futuristik</option>
                </select>
                <label>Warna mobil</label>
                <select id="enemyColor">
                    <option value="black">Hitam</option>
                    <option value="red">Merah</option>
                    <option value="blue">Biru</option>
                    <option value="white">Putih</option>
                    <option value="yellow">Kuning</option>
                    <option value="green">Hijau</option>
                </select>
            </div>
        </div>

        <p class="instruction">
            Kontrol: ← → atau A dan D.
        </p>
        <button id="startButton" class="start-button">
            MAIN LAGI
        </button>
    `;

    // Pasang kembali event garasi setelah menu dibuat ulang
    setupGarage();

    // Sesuaikan pilihan dengan pengaturan terakhir
    document.getElementById("playerDesign").value = playerDesign;
    document.getElementById("playerColor").value = playerColor;
    document.getElementById("enemyDesign").value = enemyDesign;
    document.getElementById("enemyColor").value = enemyColor;

    document.getElementById("startButton").addEventListener(
        "click",
        startGame
    );

    menu.style.display = "block";
}

// ===================================
// EVENT GARASI
// ===================================

function setupGarage() {
    document.getElementById("playerDesign").addEventListener(
        "change",
        event => {
            playerDesign = event.target.value;
            refreshPlayer();
        }
    );

    document.getElementById("playerColor").addEventListener(
        "change",
        event => {
            playerColor = event.target.value;
            refreshPlayer();
        }
    );

    document.getElementById("enemyDesign").addEventListener(
        "change",
        event => {
            enemyDesign = event.target.value;
        }
    );

    document.getElementById("enemyColor").addEventListener(
        "change",
        event => {
            enemyColor = event.target.value;
        }
    );
}

// ===================================
// ANIMASI GAME
// ===================================

let previousTime = 0;

function animate(time) {
    requestAnimationFrame(animate);

    const delta = Math.min(
        (time - previousTime) / 1000 || 0,
        0.05
    );

    previousTime = time;

    if (gameRunning) {
        speed += delta * 0.15;

        // Gerakkan garis jalan
        roadLines.forEach(line => {
            line.position.z += speed * delta;

            if (line.position.z > 15) {
                line.position.z -= 220;
            }
        });

        // Gerakkan pepohonan
        trees.forEach(tree => {
            tree.position.z += speed * delta;

            if (tree.position.z > 15) {
                tree.position.z -= 240;
            }
        });

        // Munculkan mobil musuh
        if (time - lastSpawn > spawnDelay) {
            spawnEnemy();
            lastSpawn = time;
        }

        // Gerakkan mobil musuh
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];

            enemy.position.z += speed * delta;

            if (checkCollision(enemy)) {
                gameOver();
                break;
            }

            if (enemy.position.z > 15) {
                scene.remove(enemy);
                enemies.splice(i, 1);

                score += 10;
                level = Math.floor(score / 100) + 1;

                spawnDelay = Math.max(700, 1600 - (level - 1) * 100);

                updateHUD();
            }
        }

        updateHUD();
    }

    renderer.render(scene, camera);
}

requestAnimationFrame(animate);

// ===================================
// UKURAN LAYAR
// ===================================

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

