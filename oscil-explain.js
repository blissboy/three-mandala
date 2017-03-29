"use strict";
var renderCount = 0;
var oscillators;

var values = {
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
            value: (freq, count) => {
                if ( freq() != 0 ) {
                    let retVal = Math.sin(count() / freq());
                    console.log(`returning ${retVal}`);
                    return retVal;
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
                    valueFunc: () => {return 60;}
                },
                {
                    name: 'count',
                    valueFunc: () => {
                        "use strict";
                        return renderCount;
                    }
                }
            ]
        }
    ]
};

function init() {
    createOscillators();
}

var render = function () {
    renderCount++;
    updateGeometries();
};


function createOscillators() {
    let oscillatorTypes = getOscilatorTypes();

    // oscillators = new Map();
    //
    // values.oscillators.forEach( (o) => {
    //     let oscType = oscillatorTypes.get(o.type);
    //     // set the map of params using the defaults
    //     let argMap = new Map(oscType.parameters.map(p => [p.name, p.default]));
    //     // override the defaults where the osc instance did so
    //     o.parameters.forEach(p => argMap.set(p.name, p.valueFunc));
    //     // create the properly ordered arg list array
    //     let args = oscType.parameters.map( p => {
    //         return argMap.get(p.name);
    //     });
    //
    //     oscillators.set(o.name, oscType.value.apply(null, args));
    //     //return [o.name, () => {oscType.value.apply(null, args)}];
    // });




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

        return [o.name, () => oscType.value.apply(null, args)];
    }));
}

function getOscilatorTypes() {
    return new Map(values.oscillatorTypes.map( (osc) => [osc.name, osc]));
}



function updateGeometries() {
    //debugger;
    if ( renderCount > 50) {
        let oscFn = oscillators.get('sin60draw');
        console.log(oscFn);
        let woo = oscFn();
        console.log(woo);
        let boundFn = oscFn.bind(null);
        let woowoo = boundFn();
        console.log(woowoo);


    }
}


