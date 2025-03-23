const scene = new THREE.Scene();
            let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(renderer.domElement);

            const textureLoader = new THREE.TextureLoader();

            const playerTexture = textureLoader.load('img/csabi.jpg');
            const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
            const playerMaterial = new THREE.MeshBasicMaterial({ map: playerTexture });
            const player = new THREE.Mesh(playerGeometry, playerMaterial);
            scene.add(player);
            player.position.y = 0.5;

            const targetTexture = textureLoader.load('img/labda.jpg');
            const targetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
            const targetMaterial = new THREE.MeshBasicMaterial({ map: targetTexture });
            const target = new THREE.Mesh(targetGeometry, targetMaterial);
            scene.add(target);
            target.position.x = 5;
            target.position.y = 0.5;

            const groundGeometry = new THREE.PlaneGeometry(20, 20);
            const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            scene.add(ground);
            ground.rotation.x = -Math.PI / 2;

            camera.position.z = 5;
            camera.position.y = 2;
            camera.lookAt(player.position);

            const rotateLeftButton = document.getElementById('rotateLeft');
            const rotateRightButton = document.getElementById('rotateRight');
            let rotationDirection = 0; // 0: no rotation, 1: right, -1: left

            const joystick = document.getElementById('joystick');
            const joystickHandle = document.getElementById('joystick-handle');
            let joystickActive = false;
            let joystickOffsetX = 50;
            let joystickOffsetY = 0;
            let joystickX = 0;
            let joystickY = 0;

            joystick.addEventListener('touchstart', (event) => {
                joystickActive = true;
                joystickOffsetX = event.touches[0].clientX - joystickHandle.offsetLeft - joystick.offsetLeft;
                joystickOffsetY = event.touches[0].clientY - joystickHandle.offsetTop - joystick.offsetTop;
            });

            joystick.addEventListener('touchmove', (event) => {
                if (joystickActive) {
                    let x = event.touches[0].clientX - joystickOffsetX - joystick.offsetLeft;
                    let y = event.touches[0].clientY - joystickOffsetY - joystick.offsetTop;
                    const maxDistance = 25;
                    const distance = Math.sqrt(x * x + y * y);
                    if (distance > maxDistance) {
                        x = (x / distance) * maxDistance;
                        y = (y / distance) * maxDistance;
                        x += 25;
                        y += 25;
                    }
                    joystickHandle.style.left = x + 'px';
                    joystickHandle.style.top = y + 'px';

                    joystickX = x / maxDistance;
                    joystickY = y / maxDistance;
                }
            });

            joystick.addEventListener('touchend', () => {
                joystickActive = false;
                joystickHandle.style.left = '25px';
                joystickHandle.style.top = '25px';
                joystickX = 0;
                joystickY = 0;
            });

            const keys = {};
            document.addEventListener('keydown', (event) => {
                keys[event.code] = true;
            });
            document.addEventListener('keyup', (event) => {
                keys[event.code] = false;
            });
            let mouseX = 0;
            document.addEventListener('mousemove', (event) => {
                mouseX = event.clientX;
            });
            let score = 0;
            const scoreElement = document.getElementById('score');

            target_dx = 0;
            target_dy = 0;
            player_dx = 0;
            player_dy = 0;

            let deathScore = 0;
            let mobileRotation = 0;

            function update() {
                const speed = 0.1;
                const acceleration = 0.01;
                const friction = 0.99;
                const rotationSpeed = 0.005;
                const mobileRotationSpeed = 0.1;
                rotateLeftButton.addEventListener('touchstart', () => {
                    rotationDirection = -1;
                });
                rotateLeftButton.addEventListener('touchend', () => {
                    rotationDirection = 0;
                });
                rotateLeftButton.addEventListener('mousedown', () => {
                    rotationDirection = -1;
                });
                rotateLeftButton.addEventListener('mouseup', () => {
                    rotationDirection = 0;
                });
                rotateRightButton.addEventListener('touchstart', () => {
                    rotationDirection = 1;
                });
                rotateRightButton.addEventListener('touchend', () => {
                    rotationDirection = 0;
                });
                rotateRightButton.addEventListener('mousedown', () => {
                    rotationDirection = 1;
                });
                rotateRightButton.addEventListener('mouseup', () => {
                    rotationDirection = 0;
                });
                const rotation = (mouseX - window.innerWidth / 2) * rotationSpeed;

                if (navigator.maxTouchPoints > 0) {
                    mobileRotation -= rotationDirection * mobileRotationSpeed;
                    camera.position.x = player.position.x + 5 * Math.sin(mobileRotation);
                    camera.position.z = player.position.z + 5 * Math.cos(mobileRotation);
                } else {
                    camera.position.x = player.position.x + 5 * Math.sin(rotation);
                    camera.position.z = player.position.z + 5 * Math.cos(rotation);
                }
                if (joystickX !== 0 || joystickY !== 0) {
                    const normalizedJoystickX = (joystickX - 1);
                    const normalizedJoystickY = -(joystickY - 1);

                    const cameraDirection = new THREE.Vector3();
                    camera.getWorldDirection(cameraDirection);
                    cameraDirection.y = 0;
                    cameraDirection.normalize();

                    const moveDirection = new THREE.Vector3(normalizedJoystickX, 0, normalizedJoystickY);

                    const rightVector = new THREE.Vector3();
                    rightVector.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));
                    rightVector.normalize();

                    const finalMoveDirection = new THREE.Vector3();
                    finalMoveDirection.addVectors(
                        cameraDirection.clone().multiplyScalar(moveDirection.z),
                        rightVector.clone().multiplyScalar(moveDirection.x)
                    );
                    finalMoveDirection.normalize();

                    player_dx += finalMoveDirection.x * speed / 10;
                    player_dy += finalMoveDirection.z * speed / 10;

                }

                camera.lookAt(player.position);
                const direction = new THREE.Vector3();
                camera.getWorldDirection(direction);
                direction.y = 0;
                direction.normalize();

                const strafeDirection = new THREE.Vector3();
                strafeDirection.crossVectors(direction, camera.up);
                strafeDirection.normalize();

                if (keys['ArrowUp'] || keys['KeyW']) {
                    player_dx += direction.x * acceleration;
                    player_dy += direction.z * acceleration;
                }
                if (keys['ArrowDown'] || keys['KeyS']) {
                    player_dx -= direction.x * acceleration;
                    player_dy -= direction.z * acceleration;
                }
                if (keys['ArrowRight'] || keys['KeyD']) {
                    player_dx += strafeDirection.x * acceleration;
                    player_dy += strafeDirection.z * acceleration;
                }
                if (keys['ArrowLeft'] || keys['KeyA']) {
                    player_dx -= strafeDirection.x * acceleration;
                    player_dy -= strafeDirection.z * acceleration;
                }

                player_dx *= friction;
                player_dy *= friction;

                player.position.x += player_dx;
                player.position.z += player_dy;
                const distance = player.position.distanceTo(target.position);
                if (score > 20) {
                    scoreElement.textContent = 'Pontok: ' + score + " (nagyon profi vagy)";
                } else {
                    scoreElement.textContent = 'Pontok: ' + score;
                }
                if (distance < 1) {
                    score++;
                    target.position.x = (Math.random() - 0.5) * 10;
                    target.position.z = (Math.random() - 0.5) * 10;
                }

                if (target_dx > 1) {
                    target_dx -= Math.random() / 100;
                } else if (target_dx < -1) {
                    target_dx += Math.random() / 100;
                } else {
                    target_dx += Math.random() - 0.5 / 100;
                }

                if (target_dy > 1) {
                    target_dy -= Math.random() / 100;
                } else if (target_dy < -1) {
                    target_dy += Math.random() / 100;
                } else {
                    target_dy += Math.random() - 0.5 / 100;
                }

                if (target.position.x > 10 && target_dx > 0) {
                    target_dx = -target_dx;
                }
                if (target.position.x < -10 && target_dx < 0) {
                    target_dx = -target_dx;
                }
                if (target.position.z > 10 && target_dy > 0) {
                    target_dy = -target_dy;
                }
                if (target.position.z < -10 && target_dy < 0) {
                    target_dy = -target_dy;
                }

                target.position.x += target_dx / 10;
                target.position.z += target_dy / 10;

                if (Math.abs(player.position.x) > 10.5 || Math.abs(player.position.z) > 10.5 || player.position.y < 0.5) {
                    player.position.y -= 0.1;
                    camera.position.y += 0.1;
                }
                if (player.position.y < -20) {
                    alert("Leestél a lépcsőn és kitörted a bokád");
                    if (deathScore < score) {
                        document.getElementById('scoreForm').style.display = 'flex';
                    } else {
                        loadScoreboard()
                    }
                    player_dx = player_dy = player.position.x = player.position.z = 0;
                    player.position.y = 0.5
                    camera.position.y = 2;
                    deathScore = score;
                    score = 0;
                }
            }

            function animate() {
                requestAnimationFrame(animate);
                update();
                renderer.render(scene, camera);
            }

            window.addEventListener("load", function () {
                const loader = document.getElementById("loader");
                document.getElementById('scoreForm').style.display = 'none';

                loader.style.display = "none";
                animate();
            });

            window.addEventListener("resize", function () {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            })