"use strict";
const ambient_light_name = 'ambientLight';
var scene, camera, renderer, cameraControls;
var renderCount = 0;
var gui;
var oscillators;
//var oscillatorTypes;

var values = {
    bubble: {
        radius: 300,
        latitudePoints: 9,
        longitudePoints: 9,
        color: 0xff00ff
    },
    tubes: {
        color: 0x25cd1a
    },
    lights: {
        pointLights: [
            {
                intensity: 0.5,
                color: 0xffffff,
                position: {
                    x: 0,
                    y: 0,
                    z: 400
                },
                name: 'light1'
            },
            {
                intensity: 0.3,
                color: 0xffffff,
                position: {
                    x: 0,
                    y: 400,
                    z: 0
                },
                name: 'light2'
            },
            {
                intensity: 0.1,
                color: 0xffffff,
                position: {
                    x: 400,
                    y: 0,
                    z: 0
                },
                name: 'light3'
            }
        ],
        ambientLight: {
            intensity: 0.5,
            color: 0xffffff
        }
    },
    oscillatorTypes: [
        {
            name: 'sin',
            parameters: [
                {
                    name: 'freq',
                    description: 'frequency',
                    default: () => {return 60;}
                },
                {
                    name: 'count',
                    description: 'Number of cycles so far',
                    default: () => {return 0;}
                }
            ],
            value: (freqFunc, countFunc) => {
                if ( freqFunc() != 0 ) {
                    return sin(countFunc() / freqFunc());
                } else {
                    console.error('dividing by zero thwarted');
                    return 0;
                }
            }
        }
    ],
    oscillators: [
        {
            name: 'sin60draw',
            type: 'sin',
            parameters: [
                {
                    name: 'freq',
                    value: () => {return 60;}
                },
                {
                    name: 'count',
                    value: () => {
                        "use strict";
                        return renderCount;
                    }
                }
            ]
        }
    ]

};

var render = function () {
    renderCount++;
    requestAnimationFrame(render);
    updateScene();
    renderer.render(scene, camera);
};

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 10000);
    renderer = new THREE.WebGLRenderer({antialias: true});
    cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
    cameraControls.addEventListener('change', function () {
        renderer.render(scene, camera);
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    document.body.appendChild(renderer.domElement);

    createOscillators();


    createGUI();
    createScene();
}

function getOscilatorTypes() {
    return new Map(values.oscillatorTypes.map( (osc) => [osc.name, osc]));
}

function createOscillators() {
    let oscillatorTypes = getOscilatorTypes();

    oscillators = new Map(values.oscillators.map( (o) => {
        let oscType = oscillatorTypes.get(o.type);
        // set the map of params using the defaults
        let argMap = new Map(oscType.parameters.map(p => [p.name, p.default]));
        // override the defaults where the osc instance did so
        o.parameters.forEach(p => argMap.set(p.name, p.valueFunc));
        // create the properly ordered arg list array
        let args = oscType.parameters.map( p => {
            return argMap.get(p.name);
        });

        return [o.name, () => {oscType.value.apply(args)}];
    }));
}

// function getOscillatorFromConfig(oscillatorConfig) {
//     // get the osc type def
//
//     // for each parameter in osc type def, add param from osc def (or default)
//
//     // return
//
//     let val = o.
//     return herehere look up apply and see if that's what we want
// }
function createGUI() {
    var gui = new dat.GUI();
    gui.addColor(values.tubes, 'color').onChange(() => {
        let tubes = scene.getObjectByName('tubeGroup');
        if (tubes) {
            tubes.children.forEach((tube) => {
                tube.material.color.set(values.tubes.color);
            });
        }
    });
    values.lights.pointLights.forEach((light) => {
        let folder = gui.addFolder(light.name);
        folder.addColor(light, 'color').onChange(() => {
            scene.getObjectByName(light.name).color.set(light.color);
        });
        folder.add(light, 'intensity', 0, 1).onChange(() => {
            scene.getObjectByName(light.name).intensity = light.intensity;
        })
    });
    let folder = gui.addFolder('ambient light');
    folder.addColor(values.lights.ambientLight, 'color').onChange(() => {
        scene.getObjectByName(ambient_light_name).color.set(values.lights.ambientLight.color);
    });
    folder.add(values.lights.ambientLight, 'intensity', 0, 1).onChange(() => {
        scene.getObjectByName(ambient_light_name).intensity = values.lights.ambientLight.intensity;
    })

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
    let material = new THREE.MeshPhongMaterial({color: values.tubes.color});
    let squiggleLines = createCurves();
    let tubeGroup = new THREE.Group();
    tubeGroup.name = 'tubeGroup';
    createSquiggleTubes(squiggleLines).forEach((tube) => {
        tubeGroup.add(new THREE.Mesh(
            tube,
            material
        ));
    });
    scene.add(tubeGroup);

    // let ringGroup = new THREE.Group();
    // ringGroup.name = 'ringGroup';
    // createSquiggleRings(squiggleLines).forEach((ring) => {
    //     ringGroup.add(new THREE.Mesh(
    //         ring,
    //         material
    //     ));
    // });
    // scene.add(ringGroup);

    let bubbleGeometry = new THREE.SphereBufferGeometry(
        values.bubble.radius,
        values.bubble.latitudePoints,
        values.bubble.longitudePoints);

    let bubbleWireframe = new THREE.WireframeGeometry(bubbleGeometry);
    let bubbleWireFrameLines = new THREE.LineSegments(bubbleWireframe);
    let bubbleWireFrameMaterial = new THREE.MeshLambertMaterial({
        depthTest: true,
        opacity: 0.999,
        transparent: false
    });
    scene.add(bubbleWireFrameLines, bubbleWireFrameMaterial);

    createBubble();


}

function createBubble() {

    let shader = THREE.FresnelShader;
    let uniforms = THREE.UniformsUtils.clone( shader.uniforms );
    uniforms[ "tCube" ].value = getBubbleTexture();
    let material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
    } );

    let bubbleGeometry = new THREE.SphereGeometry( 100, 64, 32 );
    let bubble = new THREE.Mesh( bubbleGeometry, material );
    bubble.name = 'bubble';
    //sphere.position.set(0, 50, 100);
    //scene.background = getBubbleTexture();
    scene.add(bubble);











    // this.refractSphereCamera = new THREE.CubeCamera( 0.1, 5000, 512 );
    // scene.add( refractSphereCamera );
    // var fShader = THREE.FresnelShader;
    //
    // var fresnelUniforms =
    //     {
    //         "mRefractionRatio": { type: "f", value: 1.02 },
    //         "mFresnelBias": 	{ type: "f", value: 0.1 },
    //         "mFresnelPower": 	{ type: "f", value: 2.0 },
    //         "mFresnelScale": 	{ type: "f", value: 1.0 },
    //         "tCube": 			{ type: "t", value: refractSphereCamera.renderTarget } //  textureCube }
    //     };
    //
    // // create custom material for the shader
    // var customMaterial = new THREE.ShaderMaterial(
    //     {
    //         uniforms: 		fresnelUniforms,
    //         vertexShader:   fShader.vertexShader,
    //         fragmentShader: fShader.fragmentShader
    //     }   );
    //
    // var sphereGeometry = new THREE.SphereGeometry( 100, 64, 32 );
    // this.sphere = new THREE.Mesh( sphereGeometry, customMaterial );
    // sphere.position.set(0, 50, 100);
    // scene.add(sphere);
    //
    // refractSphereCamera.position = sphere.position;

}

function getBubbleTexture() {
    let textureImage = 'images/RedSquare_Tuthill_1024.jpg';
    let urls = Array(6).fill(textureImage);
    let textureCube = new THREE.CubeTextureLoader().load( urls );
    textureCube.format = THREE.RGBFormat;

    return textureCube;
}


function updateGeometries() {
    let rotX = 0.005;
    let stepX = 0.0001;
    let rotY = 0.001;
    let stepY = 0.0001;
    let rotZ = 0.003;
    scene.children.filter(c => {
        return c.name !== 'bubble'}).forEach(c => {
        c.rotation.x += rotX;
        c.rotation.y += rotY;
        rotX += stepX;
        rotY += stepY;
    });

    // scene.children.filter((c) => {
    //     return c instanceof THREE.Group && c.name == 'ringGroup';
    // }).forEach((c) => {
    //     c.children.forEach((ring) => {
    //         ring.rotation.x += rotX;
    //         ring.rotation.y += rotY;
    //         ring.rotation.z += rotZ;
    //     })
    // });
}

function setupLighting() {
    let lights = new THREE.Group();
    lights.name = 'lights';
    values.lights.pointLights.forEach((light) => {
        let lite = new THREE.PointLight(light.color, light.intensity);
        lite.position.set(light.position.x, light.position.y, light.position.z);
        lite.name = light.name;
        lights.add(lite);
    });

    let ambientLite = new THREE.AmbientLight(
        values.lights.ambientLight.color,
        values.lights.ambientLight.intensity);
    ambientLite.name = ambient_light_name;
    lights.add(ambientLite);

    scene.add(lights);
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
function getPointsAcrossRegion(startingPoint,
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

function createCurveFromPoints(points) {
    return new THREE.CatmullRomCurve3(points);
}
function createTorusFromPoints(points) {
    return new THREE.CatmullRomCurve3(points);
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
 * @param {*} squiggleLines
 */
function createSquiggleRings(curves) {
    let rings = [];
    const divideInto = 3;
    curves.forEach((curve) => {
        curve.getSpacedPoints(divideInto).forEach((pt) => {
            let ring = new THREE.TorusGeometry(10, 3, 8, 6);
            ring.translate(pt.x, pt.y, pt.z);
            rings.push(ring);
        })
    });

    return rings;
}

/**
 * create paths across the bubble
 *
 * @returns array of Curves
 */
function createCurves() {
    let phi, theta, normal, x, y, z, pt, steps;
    const twoPI = Math.PI * 2.0;
    let curves = [];

    for (let i = 0; i < values.bubble.longitudePoints; i++) {
        for (let j = 0; j < values.bubble.latitudePoints; j++) {
            // get surface normal
            theta = twoPI / i;
            phi = twoPI / j;
            x = values.bubble.radius * Math.sin(theta) * Math.cos(phi);
            y = values.bubble.radius * Math.sin(theta) * Math.sin(phi);
            z = values.bubble.radius * Math.cos(theta);
            pt = new THREE.Vector3(x, y, z);
            normal = new THREE.Vector3(x, y, z).normalize().multiplyScalar(-1);
            steps = getPointsAcrossRegion(new THREE.Vector3(x, y, z), normal, (point) => point.length() < values.bubble.radius);
            if (steps.length > 1) {
                curves.push(createCurveFromPoints(steps));
            }
        }
    }
    return curves;
}

function vec3ToString(vec) {
    return (`${vec.x},${vec.y},${vec.z}`);
}

