let camera, scene, renderer, controls;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();

// Add this to your variable declarations
let bullets = [];
const bulletSpeed = 1000;
const bulletLifetime = 2; // seconds

// Add this function to create bullets
function shoot() {
    const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    bullet.position.copy(controls.getObject().position);
    bullet.quaternion.copy(controls.getObject().quaternion);
    bullet.userData = { startTime: performance.now() };
    bullets.push(bullet);
    scene.add(bullet);
}

// Add this event listener to detect shooting
document.addEventListener('click', function () {
    if (controls.isLocked === true) {
        shoot();
    }
});

// Update bullets in the animate function
function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked === true) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        // Update bullet positions
        bullets.forEach((bullet, index) => {
            bullet.translateZ(-bulletSpeed * delta);
            if ((time - bullet.userData.startTime) / 1000 > bulletLifetime) {
                scene.remove(bullet);
                bullets.splice(index, 1);
            }
        });

        // existing movement and rendering code
    }

    renderer.render(scene, camera);
}

init();
animate();

function init() {
    const blocker = document.createElement('div');
    blocker.id = 'blocker';
    document.body.appendChild(blocker);

    const instructions = document.createElement('div');
    instructions.id = 'instructions';
    instructions.innerHTML = 'Click to play';
    blocker.appendChild(instructions);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    scene = new THREE.Scene();

    const light = new THREE.HemisphereLight(0xffffff, 0x444444);
    light.position.set(0.5, 1, 0.75);
    scene.add(light);

    controls = new THREE.PointerLockControls(camera, document.body);
    scene.add(controls.getObject());

    instructions.addEventListener('click', function () {
        controls.lock();
    });

    controls.addEventListener('lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    });

    controls.addEventListener('unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    });

    const onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
            case 'Space':
                if (canJump === true) velocity.y += 350;
                canJump = false;
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    const floorGeometry = new THREE.PlaneGeometry(2000, 2000, 100, 100);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = - Math.PI / 2;
    scene.add(floor);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    if (controls.isLocked === true) {
        const time = performance.now();
        const delta = (time - prevTime) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize(); // this ensures consistent movements in all directions

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(-velocity.x * delta);
        controls.moveForward(-velocity.z * delta);

        controls.getObject().position.y += (velocity.y * delta); // new behavior

        if (controls.getObject().position.y < 10) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
            canJump = true;
        }

        prevTime = time;
    }

    renderer.render(scene, camera);
}
