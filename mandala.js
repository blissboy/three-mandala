var scene, camera, renderer, cameraControls;
const bubble_radius = 300;

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

    var bubble_radius = 100;

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

    let squiggleLines = createCurves();
    createSquiggleTubes(squiggleLines).forEach((tube) => {
        scene.add(new THREE.Mesh(
            tube,
            new THREE.MeshLambertMaterial({ color: 0xfd59d7 })
        ));
    });

    let geometry = new THREE.SphereBufferGeometry(bubble_radius, 100, 100);
    let wireframe = new THREE.WireframeGeometry(geometry);
    let line = new THREE.LineSegments(wireframe);
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;

    scene.add(line);

    // scene.add(
    //     new THREE.Mesh(
    //         new THREE.WireframeGeometry(new THREE.SphereGeometry(bubble_radius, 64, 64)),
    //         new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 1 })
    //     )
    // );

}

function updateGeometries() {
    // scene.children.forEach(c => {
    //     c.rotation.x += 0.01;
    //     c.rotation.y += 0.02;
    // });
}


function setupLighting() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    let pointLight = new THREE.PointLight(0xaaaaaa, 0.6);
    pointLight.position.set(300, 300, 300);
    scene.add(pointLight);
}

function updateLighting() {

}

function setupCamera() {
    camera.position.z = 750;
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
        return (new THREE.Vector3(Math.random(), Math.random(), Math.random())).normalize();
        // // direction is a vec3
        // originalDirection = direction.clone();
        // originalDirection.normalize();
        // originalDirection.add(new THREE.Vector3(Math.random(), Math.random(), Math.random()));
        // return originalDirection.normalize();
    }) {

    let steps = [];
    let currentPoint = startingPoint.clone();
    let currentDirection = startingDirection.clone();
    currentPoint.add(currentDirection);
    steps.push(currentPoint);
    do {
        
        steps.push(calculateNextStep(currentPoint, currentDirection, steps));
        currentPoint.add(steps[steps.length - 1]);
    }
    while (isPointStillInRegion(currentPoint));

    console.log('***************************')
    console.log('starting point ' + vec3ToString(startingPoint));
    console.log('starting direction ' + vec3ToString(startingDirection));
    console.log('Points:');
    steps.forEach((pt) => { console.log(`\t ${vec3ToString(pt)}`) });

    return steps;
}



function createCurveFromStepsAndStartPoint(startPoint, steps) {
    let curPoint = startPoint.clone();
    let curvePoints = [];
    curvePoints.push(startPoint);
    //TODO: figure out why the map isn't working (commented below)
    for (let i = 0; i < steps.length; i++) {
        let newPoint = curPoint.clone();
        newPoint.add(steps[i]);
        curvePoints.push(newPoint);
        curPoint = newPoint.clone();
    }

    // steps.forEach(pt => {
    //     curPoint.add(pt);
    //     squigglePoints.push(curPoint);
    // });
    //let pts = steps.map((pt) => { curPoint.addVectors(curPoint, pt); return curPoint;} );

    return new THREE.CatmullRomCurve3(curvePoints);
}

/**
 * @param {*} squiggleLines 
 */
function createSquiggleTubes(curves) {
    return curves.map((curve) => {
        let tube = new THREE.TubeGeometry(curve, 64, 5, 8, false);
        return tube;
    });
}

/**
 * create paths across the bubble
 * 
 * @returns array of Curves
 */
function createCurves() {
    //herehere - need to create squiggle from one point on sphere and then the draw should put that everywhere. 
    //let phi, theta, normal, x,y,z;
    const twoPI = Math.PI * 2.0;
    const latitudePoints = 4;
    const longitudePoints = 30;
    let curves = [];

    for (i = 1; i <= longitudePoints; i++) {
        for (j = 1; j <= latitudePoints; j++) {
            // get surface normal
            let theta = twoPI / i;
            let phi = twoPI / j;
            let x = bubble_radius * Math.sin(theta) * Math.cos(phi);
            let y = bubble_radius * Math.sin(theta) * Math.sin(phi);
            let z = bubble_radius * Math.cos(theta);
            let pt = new THREE.Vector3(x,y,z);
            let normal = new THREE.Vector3(x, y, z).normalize().multiplyScalar(-1);
            console.log(`normal = ${vec3ToString(normal)}`);
            //let curve = new THREE.LineCurve(pt, pt.clone().addVectors(pt, normal.multiplyScalar(2 * bubble_radius)));
            //curves.push(curve);
            
            let steps = getPointsAcrossRegion(new THREE.Vector3(x, y, z), normal, (point) => point.length() < bubble_radius);
            if (steps.length > 1) {
                let squiggle = createCurveFromStepsAndStartPoint(new THREE.Vector3(x, y, z), steps);
                curves.push(squiggle);
            }
        }
    }
    return curves;
}

function vec3ToString(vec) {
    return (`${vec.x},${vec.y},${vec.z}`);
}

