var scene, camera, renderer, controls;

var render = function () {
    requestAnimationFrame(render);
    updateScene();
    renderer.render(scene, camera);
};

function createScene() {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    let material = new THREE.MeshLambertMaterial({ color: 0xfd59d7 });
    let cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    setupLighting();
    setupCamera();

}

function updateScene() {
    scene.children.forEach(c => {
        c.rotation.x += 0.1;
        c.rotation.y += 0.2;
    });
}

function setupLighting() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    let pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);
}

function setupCamera() {
    camera.position.z = 5;
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', function () { renderer.render(scene, camera); });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
}
