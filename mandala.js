var scene, camera, renderer, cameraControls;
const bubble_radius = 14

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

    var bubble_radius = 10;

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

    let squiggleLines = createSquiggles();
    createSquiggleTubes(squiggleLines).forEach((tube) => {
        scene.add(new THREE.Mesh(
            tube,
            new THREE.MeshLambertMaterial({ color: 0xfd59d7 })
        ));
    });
}

function updateGeometries() {
    scene.children.forEach(c => {
        c.rotation.x += 0.01;
        c.rotation.y += 0.02;
    });
}


function setupLighting() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    let pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(25, 50, 25);
    scene.add(pointLight);
}

function updateLighting() {

}

function setupCamera() {
    camera.position.z = 25;
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
function getStepsAcrossRegion(
    startingPoint,
    startingDirection, //Vector3
    isPointStillInRegion,
    calculateNextStep = (location, direction, steps) => {
        // direction is a vec3
        originalDirection = direction.clone();
        originalDirection.normalize();
        originalDirection.add(new THREE.Vector3(Math.random(), Math.random(), Math.random()));
        return originalDirection.normalize();
    }) {

    steps = [];
    let currentPoint = startingPoint;
    let currentDirection = startingDirection;
    do {
        steps.push(calculateNextStep(currentPoint, currentDirection, steps));
        currentPoint.add(steps[steps.length - 1]);
    }
    while (isPointStillInRegion(currentPoint));

    return steps;
}

function createSquiggle(startPoint, steps) {
    let curPoint = startPoint.clone();
    let squigglePoints = [];
    squigglePoints.push(startPoint);
    for ( let i=0;i<steps.length;i++){
        let newPoint = curPoint.clone();
        newPoint.add(steps[i]);
        squigglePoints.push(newPoint);
        curPoint = newPoint;
    }
        
    // steps.forEach(pt => {
    //     curPoint.add(pt);
    //     squigglePoints.push(curPoint);
    // });
    //let pts = steps.map((pt) => { curPoint.addVectors(curPoint, pt); return curPoint;} );

    return new THREE.CatmullRomCurve3(squigglePoints);
}

/**
 * @param {*} squiggleLines 
 */
function createSquiggleTubes(squiggleLines) {
    return squiggleLines.map((curve) => {
        let tube = new THREE.TubeGeometry(curve,64,5,8,false);
        return tube;
    });
}

/**
 * create paths across the bubble
 * 
 * @returns array of Curves
 */
function createSquiggles() {
    //herehere - need to create squiggle from one point on sphere and then the draw should put that everywhere. 
    let phi, theta, normal;
    const twoPI = Math.PI * 2.0;
    const latitudePoints = 10;
    const longitudePoints = 10;
    let squiggles = [];

    for (i = 1; i <= longitudePoints; i++) {
        for (j = 1; j <= latitudePoints; j++) {
            // get surface normal
            theta = twoPI / i;
            phi = twoPI / j;
            x = bubble_radius * Math.sin(theta) * Math.cos(phi);
            y = bubble_radius * Math.sin(theta) * Math.sin(phi);
            z = bubble_radius * Math.cos(theta);
            normal = new THREE.Vector3(x, y, z).normalize().multiplyScalar(-1);
            steps = getStepsAcrossRegion(new THREE.Vector3(x, y, z), normal, (point) => point.length() < bubble_radius);
            if (steps.length > 1) {
                let squiggle = createSquiggle(new THREE.Vector3(x, y, z), steps);
                squiggles.push(squiggle);
            }
        }
    }
    return squiggles;
}

function createBeziersBetweenSteps(steeps) {
    return (x, y) => {
        console.log(x, y);
        let curPtX = x;
        let curPtY = y;
        context.beginPath();
        context.lineWidth = "1";
        //context.strokeStyle = "green";
        context.strokeStyle = getMovingRainbowXGradient(0, widdth);
        context.moveTo(curPtX, curPtY);
        for (i = 0; i < steeps.length - 2; i++) {
            curPtX += steeps[i].x;
            curPtY += steeps[i].y;
            context.bezierCurveTo(
                curPtX + steeps[i + 1].x, curPtY + steeps[i + 1].y,
                curPtX + steeps[i + 2].x, curPtY + steeps[i + 2].y,
                curPtX, curPtY);
        }
        context.stroke();
        context.closePath();
    }
}


function createLineBetweenSteps(steeps) {
    return (x, y) => {

        context.moveTo(0, 0);
        let curPtX = x;
        let curPtY = y;
        context.beginPath();
        context.lineWidth = "1";
        //context.strokeStyle = "green";
        context.strokeStyle = getMovingRainbowXGradient(0, widdth);
        context.moveTo(curPtX, curPtY);
        steeps.forEach(step => {
            curPtX += step.x;
            curPtY += step.y;
            context.lineTo(curPtX, curPtY);
        });
        context.stroke();
        context.closePath();
    }
}
