var scene, camera, renderer, cameraControls;

var render = function () {
    requestAnimationFrame(render);
    updateScene();
    renderer.render(scene, camera);
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.addEventListener('change', function () { renderer.render(scene, camera); });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createScene();
}


function createScene() {
    createGeometries();
    setupLighting();
    setupCamera();
}

function updateScene() {
    updateGeometries();
    updateLighting();
    updateCamera();
}

function createGeometries() {
    scene.add(
        new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshLambertMaterial({ color: 0xfd59d7 })
        )
    );
}

function updateGeometries() {
    scene.children.forEach(c => {
        c.rotation.x += 0.01;
        c.rotation.y += 0.02;
    });
}


function setupLighting() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    let pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);
}

function updateLighting() {

}

function setupCamera() {
    camera.position.z = 5;
}

function updateCamera() {

}

