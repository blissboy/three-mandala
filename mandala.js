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

    let squiggles = createSquiggleTubes(createSquiggles());


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

/**
 * Do walk until the function passed says that the point we have reached is out of bounds. For example, 
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
 * @param startingVector the direction that the path is facing at the start of the process
 * @param calculateNextStep function that will calculate the next step given the current location 
 * and array of steps as an input. 
 * 
 * @returns an array of steps (in the form {x,y,z}) indicating the steps. 
 */
function getStepsAcrossRegion( 
    startingPoint, 
    isPointStillInRegion, 
    startingVector,
    calculateNextStep = (location, steps) => {return {x: random(), y: random(), z:random()};} ) {
    
    steps = [];
    let currentPoint = startingPoint;
    do {
        steps.push(calculateNextStep(currentLocation, steps)); 
        currentPoint = {
            x: currentPoint.x + steps[steps.length - 1].x,
            y: currentPoint.y + steps[steps.length - 1].y,
        };
    } while (isPointStillInRegion(currentPoint))

    return steps;
}

/**
 * create paths across the bubble
 * 
 * @returns array of squiggle lines
 */
function createSquiggles() {
    return [];
}

function createSquiggleTubes(squiggleLines) {
    return [];
}

function createSquiggle() {
{\displaystyle {\begin{aligned}x&=r\,\sin \theta \,\cos \varphi \\y&=r\,\sin \theta \,\sin \varphi \\z&=r\,\cos \theta \end{aligned}}}
    //herehere - need to create squiggle from one point on sphere and then the draw should put that everywhere. 
    let phi, theta;
    const twoPI = Math.PI * 2.0;
    for ( i=1; i<=longitudePoints; i++) {
        for (j=1; j<=latitudePoints; j++) {
            // get surface normal
            theta = twoPI / i;
            phi = twoPI / j;
            x = bubble_radius * Math.sin(theta) * Math.cos(phi);
            y = bubble_radius * Math.sin(theta) * Math.sin(phi);
            z = bubble_radius * Math.cos(theta);
            
        }
    }

    let steeps = getStepsAcrossRegion();
    return createBeziersBetweenSteps(steeps);
    //return createLineBetweenSteps(steeps);
}

function createBeziersBetweenSteps(steeps) {
    return (x, y) => {
        console.log(x,y);
        let curPtX = x;
        let curPtY = y;
        context.beginPath();
        context.lineWidth = "1";
        //context.strokeStyle = "green";
        context.strokeStyle = getMovingRainbowXGradient(0, widdth);
        context.moveTo(curPtX, curPtY);
        for (i=0; i<steeps.length - 2; i++) {
            curPtX += steeps[i].x;
            curPtY += steeps[i].y;
            context.bezierCurveTo(
                curPtX + steeps[i+1].x, curPtY + steeps[i+1].y,
                curPtX + steeps[i+2].x, curPtY + steeps[i+2].y,
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
