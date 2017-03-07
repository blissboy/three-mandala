var scene, camera, renderer, cameraControls;
const bubble_radius = 300;
const bubble_points_lat = 8;
const bubble_points_long = 9;

var render = function () {
    requestAnimationFrame(render);
    updateScene();
    renderer.render(scene, camera);
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.addEventListener('change', function () { renderer.render(scene, camera); });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);

    createScene();
}

function createScene() {
    //testScope(new THREE.Vector3(100,0,0));
    setupLighting();
    setupCamera();
    createGeometries();
}

function updateScene() {
    updateGeometries();
    updateLighting();
    updateCamera();
}

function createGeometries() {
    let material = new THREE.MeshLambertMaterial({ color: 0x77cc44 });
    let squiggleLines = createCurves();
    createSquiggleTubes(squiggleLines).forEach((tube) => {
        scene.add(new THREE.Mesh(
            tube,
            material
        ));
    });

    let bubbleGeometry = new THREE.SphereBufferGeometry(
        bubble_radius, 
        bubble_points_lat > 10 ? bubble_points_lat : 10, 
        bubble_points_long > 10 ? bubble_points_long : 10);
    let bubbleWireframe = new THREE.WireframeGeometry(bubbleGeometry);
    let bubbleWireFrameLines = new THREE.LineSegments(bubbleWireframe);
    let bubbleWireFrameMaterial = new THREE.MeshLambertMaterial({
        depthTest: false,
        opacity: 0.25,
        transparent: true
    });
    scene.add(bubbleWireFrameLines, bubbleWireFrameMaterial);

}

function updateGeometries() {
    scene.children.forEach(c => {
        c.rotation.x += 0.005;
        c.rotation.y += 0.01;
    });
}


function setupLighting() {
    let light = new THREE.PointLight(0xffffff, 1, 0);
    light.position.set(0, 400, 0);
    scene.add(light);

    let light2 = new THREE.PointLight(0xffffff, 1, 0);
    light2.position.set(400, 0,0);
    scene.add(light2);

    let light3 = new THREE.PointLight(0xff00ff, 1, 0);
    light3.position.set(0, 0, 400);
    scene.add(light3);

    //scene.add(new THREE.AmbientLight(0xff9999, 0.7));
}

function updateLighting() {

}

function setupCamera() {
    camera.position.z = 300;
}

function updateCamera() {

}

/**
 * Create a walk across a region. 
 * 
 * @param startingPoint the point from which to start the walk
 * @param isPointStillInRegion a function that determines if the walk is still within the region. For example, 
 * could pass a function like the following to determine if the point was outside the drawing window:
 *  (currentPointOfWalk) => {
 *      if ( currentPointOfWalk.x > window.innerWidth 
 *          || currentPointOfWalk.x < 0 
 *          || currentPointOfWalk.y > window.innerHeight 
 *          || currentPointOfWalk.y < 0 ) {
 *          return false;
 *      } else {
 *          return true;
 *      }
 * }
 * @param startingDirection a Vector3 indicating the direction that the path is facing at the start of the process
 * @param calculateNextStep function that will calculate the next step given the current location, direction, 
 * and array of steps as an input. 
 * 
 * @returns an array of steps (in the form {x,y,z}) indicating the steps. 
 */
function getPointsAcrossRegion(
    startingPoint,
    startingDirection, //Vector3
    isPointStillInRegion,
    calculateNextStep = (location, direction, steps) => {
        return (new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)).normalize();
    }) {

    let steps = [];
    let currentPoint = startingPoint.clone();
    let currentDirection = startingDirection.clone();
    currentPoint.add(currentDirection);
    steps.push(currentPoint.clone());
    do {
        let nextStep = calculateNextStep(currentPoint, currentDirection, steps);
        currentPoint.add(nextStep.clone());
        currentPoint.add(currentDirection);
        steps.push(currentPoint.clone());
    }
    while (isPointStillInRegion(currentPoint));

    // console.log('***************************')
    // console.log('starting point ' + vec3ToString(startingPoint));
    // console.log('starting direction ' + vec3ToString(startingDirection));
    // console.log('Points:');
    // steps.forEach((pt) => { console.log(`\t ${vec3ToString(pt)}`) });

    return steps;
}

function createCurveFromStepsAndStartPoint(startPoint, steps) {
    return new THREE.CatmullRomCurve3(steps);
}

/**
 * @param {*} squiggleLines 
 */
function createSquiggleTubes(curves) {
    return curves.map((curve) => {
        let tube = new THREE.TubeGeometry(curve, 64, 5, 18, false);
        return tube;
    });
}

/**
 * create paths across the bubble
 * 
 * @returns array of Curves
 */
function createCurves() {
    let phi, theta, normal, x,y,z, pt, steps;
    const twoPI = Math.PI * 2.0;
    let curves = [];

    for (i = 0; i < bubble_points_long; i++) {
        for (j = 0; j < bubble_points_lat; j++) {
            // get surface normal
            theta = twoPI / i;
            phi = twoPI / j;
            x = bubble_radius * Math.sin(theta) * Math.cos(phi);
            y = bubble_radius * Math.sin(theta) * Math.sin(phi);
            z = bubble_radius * Math.cos(theta);
            pt = new THREE.Vector3(x, y, z);
            normal = new THREE.Vector3(x, y, z).normalize().multiplyScalar(-1);
            steps = getPointsAcrossRegion(new THREE.Vector3(x, y, z), normal, (point) => point.length() < bubble_radius);
            if (steps.length > 1) {
                curves.push(createCurveFromStepsAndStartPoint(new THREE.Vector3(x, y, z), steps));
            }
        }
    }
    return curves;
}

function vec3ToString(vec) {
    return (`${vec.x},${vec.y},${vec.z}`);
}

