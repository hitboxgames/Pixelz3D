import * as THREE from '../../three.module.js'
import { OBJLoader } from '../Loaders/OBJLoader.js';

export default class ObjectBuilder {
    constructor() {

    }
}

export function createShape(shape) {
    if (shape == "box") return createBox()
    if (shape == "cone") return createCone()
    if (shape == "sphere") return createSphere()
    if (shape == "cylinder") return createCylinder()
    //if (shape == "castle") return createCastle()
    if (shape == "circle") return createCircle()
    if (shape == "dodecahedron") return createDodecahedron()
    if (shape == "3dheart") return create3DHeart()
    if (shape == "icosahedron") return createIcosahedron()
    if (shape == "octahedron") return createOctahedron()
    if (shape == "parametric") return createParametric()
    if (shape == "plane") return createPlane()
    if (shape == "polyhedron") return createPolyhedron()
    if (shape == "2dheart") return create2DHeart()
    if (shape == "tetrahedron") return createTetrahedron()
    if (shape == "torus") return createTorus()
    if (shape == "torusknot") return createTorusKnot()
    if (shape == "ring") return createRing()
}


function createBox() {
    let scale = { x: 1, y: 1, z: 1 }
    let pos = { x: 0, y: 5 / 2.0, z: 0 }
    let box = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 5, 5), new THREE.MeshPhongMaterial({ color: 0xDC143C }));

    box.position.set(pos.x, pos.y, pos.z);
    box.scale.set(scale.x, scale.y, scale.z);
    box.castShadow = true;
    box.receiveShadow = true;

    box.userData.draggable = true
    box.userData.name = 'BOX'
    return box;
}

function createCone() {
    const radius = 6;
    const height = 8;
    const segments = 16;
    let pos = { x: 0, y: 0, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const Cone = new THREE.Mesh(new THREE.ConeBufferGeometry(radius, height, segments), mat)

    Cone.position.set(pos.x, pos.y, pos.z)
    Cone.castShadow = true
    Cone.receiveShadow = true

    Cone.userData.draggable = true
    Cone.userData.name = 'CONE'
    return Cone
}

function createSphere() {
    let radius = 4;
    let pos = { x: 0, y: radius, z: 0 };

    let sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0x43a1f4 }))
    sphere.position.set(pos.x, pos.y, pos.z)
    sphere.castShadow = true
    sphere.receiveShadow = true

    sphere.userData.draggable = true
    sphere.userData.name = 'SPHERE'
    return sphere
}

function createCylinder() {
    let radius = 4;
    let height = 6
    let pos = { x: 0, y: height / 2, z: 0 };

    // threejs
    let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
    cylinder.position.set(pos.x, pos.y, pos.z)
    cylinder.castShadow = true
    cylinder.receiveShadow = true

    cylinder.userData.draggable = true
    cylinder.userData.name = 'CYLINDER'
    return cylinder
}

//Disabling temporarily

function createCastle() {
    console.log("Disabled")
    /*
    const objLoader = new OBJLoader();

    objLoader.loadAsync('./modules/Shapes/Objects/castle.obj').then((group) => {
        const castle = group.children[0];

        castle.position.x = 0
        castle.position.z = 0

        castle.scale.x = 5;
        castle.scale.y = 5;
        castle.scale.z = 5;

        castle.castShadow = true
        castle.receiveShadow = true

        castle.userData.draggable = true
        castle.userData.name = 'CASTLE'

        return castle
    })
*/
}

function createCircle() {
    const radius = 7;
    const segments = 24;
    let pos = { x: 0, y: radius, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    mat.side = THREE.DoubleSide;

    const circle = new THREE.Mesh(new THREE.CircleGeometry(radius, segments), mat)

    circle.position.set(pos.x, pos.y, pos.z)
    circle.castShadow = true
    circle.receiveShadow = true

    circle.userData.draggable = true
    circle.userData.name = 'CIRCLE'

    return circle
}

function createDodecahedron(objects) {
    const radius = 6;
    let pos = { x: 0, y: radius, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const Dodecahedron = new THREE.Mesh(new THREE.DodecahedronBufferGeometry(radius), mat)

    Dodecahedron.position.set(pos.x, pos.y, pos.z)
    Dodecahedron.castShadow = true
    Dodecahedron.receiveShadow = true

    Dodecahedron.userData.draggable = true
    Dodecahedron.userData.name = 'DODECAHEDRON'
    return Dodecahedron
}

function create3DHeart(objects) {
    const shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    const extrudeSettings = {
        steps: 2,
        depth: 2,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelSegments: 2,
    };


    let pos = { x: 0, y: Math.abs(y) + 2, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const ThreeDHeart = new THREE.Mesh(new THREE.ExtrudeBufferGeometry(shape, extrudeSettings), mat)

    ThreeDHeart.position.set(pos.x, pos.y, pos.z)
    ThreeDHeart.castShadow = true
    ThreeDHeart.receiveShadow = true

    ThreeDHeart.userData.draggable = true
    ThreeDHeart.userData.name = '3DHeart'
    return ThreeDHeart
}

function createIcosahedron() {
    const radius = 7;
    let pos = { x: 0, y: radius, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const Icosahedron = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(radius), mat)

    Icosahedron.position.set(pos.x, pos.y, pos.z)
    Icosahedron.castShadow = true
    Icosahedron.receiveShadow = true

    Icosahedron.userData.draggable = true
    Icosahedron.userData.name = 'Icosahedron'
    return Icosahedron
}

function createOctahedron() {
    const radius = 7;
    let pos = { x: 0, y: radius, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const Octahedron = new THREE.Mesh(new THREE.OctahedronBufferGeometry(radius), mat)

    Octahedron.position.set(pos.x, pos.y, pos.z)
    Octahedron.castShadow = true
    Octahedron.receiveShadow = true

    Octahedron.userData.draggable = true
    Octahedron.userData.name = 'Octahedron'
    return Octahedron
}

function createParametric() {
    // from: https://github.com/mrdoob/three.js/blob/b8d8a8625465bd634aa68e5846354d69f34d2ff5/examples/js/ParametricGeometries.js
    function klein(v, u, target) {
        u *= Math.PI;
        v *= 2 * Math.PI;
        u = u * 2;

        let x;
        let z;

        if (u < Math.PI) {
            x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(u) * Math.cos(v);
            z = -8 * Math.sin(u) - 2 * (1 - Math.cos(u) / 2) * Math.sin(u) * Math.cos(v);
        } else {
            x = 3 * Math.cos(u) * (1 + Math.sin(u)) + (2 * (1 - Math.cos(u) / 2)) * Math.cos(v + Math.PI);
            z = -8 * Math.sin(u);
        }

        const y = -2 * (1 - Math.cos(u) / 2) * Math.sin(v);

        target.set(x, y, z).multiplyScalar(0.75);
    }

    const slices = 25;
    const stacks = 25;

    let pos = { x: 0, y: 2, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const Parametric = new THREE.Mesh(new THREE.ParametricBufferGeometry(klein, slices, stacks), mat)

    Parametric.position.set(pos.x, pos.y, pos.z)
    Parametric.rotation.set(-pos.x, pos.y, pos.z)
    Parametric.castShadow = true
    Parametric.receiveShadow = true

    Parametric.userData.draggable = true
    Parametric.userData.name = 'Parametric'
    return Parametric
}

function createPlane() {
    const width = 9;
    const height = 9;
    const widthSegments = 2;
    const heightSegments = 2;
    let pos = { x: 0, y: height / 2, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    mat.side = THREE.DoubleSide;

    const Plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height, widthSegments, heightSegments), mat)

    Plane.position.set(pos.x, pos.y, pos.z)
    Plane.castShadow = true
    Plane.receiveShadow = true

    Plane.userData.draggable = true
    Plane.userData.name = 'Plane'
    return Plane
}

function createPolyhedron() {
    const verticesOfCube = [
        -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
        -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
    ];
    const indicesOfFaces = [
        2, 1, 0, 0, 3, 2,
        0, 4, 7, 7, 3, 0,
        0, 1, 5, 5, 4, 0,
        1, 2, 6, 6, 5, 1,
        2, 3, 7, 7, 6, 2,
        4, 5, 6, 6, 7, 4,
    ];
    const radius = 7;
    const detail = 2;

    let pos = { x: 0, y: 7, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const Polyhedron = new THREE.Mesh(new THREE.PolyhedronBufferGeometry(verticesOfCube, indicesOfFaces, radius, detail), mat)

    Polyhedron.position.set(pos.x, pos.y, pos.z)
    Polyhedron.castShadow = true
    Polyhedron.receiveShadow = true

    Polyhedron.userData.draggable = true
    Polyhedron.userData.name = 'Polyhedron'
    return Polyhedron
}

function createRing() {
    const innerRadius = 2;
    const outerRadius = 7;
    const segments = 18;

    let pos = { x: 0, y: 7, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    mat.side = THREE.DoubleSide;

    const Ring = new THREE.Mesh(new THREE.RingBufferGeometry(innerRadius, outerRadius, segments), mat)

    Ring.position.set(pos.x, pos.y, pos.z)
    Ring.castShadow = true
    Ring.receiveShadow = true

    Ring.userData.draggable = true
    Ring.userData.name = 'Ring'
    return Ring
}

function create2DHeart() {
    const shape = new THREE.Shape();
    const x = -2.5;
    const y = -5;
    shape.moveTo(x + 2.5, y + 2.5);
    shape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    shape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    shape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    shape.bezierCurveTo(x + 6, y + 7.7, x + 8, y + 4.5, x + 8, y + 3.5);
    shape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    shape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);

    let pos = { x: 0, y: Math.abs(y), z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    mat.side = THREE.DoubleSide;

    const TwoDHeart = new THREE.Mesh(new THREE.ShapeBufferGeometry(shape), mat)

    TwoDHeart.position.set(pos.x, pos.y, pos.z)
    TwoDHeart.castShadow = true
    TwoDHeart.receiveShadow = true

    TwoDHeart.userData.draggable = true
    TwoDHeart.userData.name = 'TwoDHeart'
    return TwoDHeart
}

function createTetrahedron() {
    const radius = 7;

    let pos = { x: 0, y: radius / 2.0, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const Tetrahedron = new THREE.Mesh(new THREE.TetrahedronBufferGeometry(radius), mat)

    Tetrahedron.position.set(pos.x, pos.y, pos.z)
    Tetrahedron.castShadow = true
    Tetrahedron.receiveShadow = true

    Tetrahedron.userData.draggable = true
    Tetrahedron.userData.name = 'Tetrahedron'
    return Tetrahedron
}

function createTorus() {
    const radius = 5;
    const tubeRadius = 2;
    const radialSegments = 8;
    const tubularSegments = 24;

    let pos = { x: 0, y: radius + tubeRadius, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const Torus = new THREE.Mesh(new THREE.TorusBufferGeometry(radius, tubeRadius, radialSegments, tubularSegments), mat)

    Torus.position.set(pos.x, pos.y, pos.z)
    Torus.castShadow = true
    Torus.receiveShadow = true

    Torus.userData.draggable = true
    Torus.userData.name = 'Torus'
    return Torus
}

function createTorusKnot() {
    const radius = 3.5;
    const tube = 1.5;
    const radialSegments = 8;
    const tubularSegments = 64;
    const p = 2;
    const q = 3;

    let pos = { x: 0, y: radius + tube + 2, z: 0 };

    let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
    //mat.side = THREE.DoubleSide;

    const TorusKnot = new THREE.Mesh(new THREE.TorusKnotBufferGeometry(radius, tube, tubularSegments, radialSegments, p, q), mat)

    TorusKnot.position.set(pos.x, pos.y, pos.z)
    TorusKnot.castShadow = true
    TorusKnot.receiveShadow = true

    TorusKnot.userData.draggable = true
    TorusKnot.userData.name = 'TorusKnot'
    return TorusKnot
}

//SpawnText
    /*
    let spawnText = document.getElementById("SpawnText");
    if(spawnText != null) spawnText.addEventListener("click", (e:Event) => createText());
    function createText() {
      const loader = new THREE.FontLoader();
      // promisify font loading
      function loadFont(url) {
        return new Promise((resolve, reject) => {
          loader.load(url, resolve, undefined, reject);
        });
      }
    
      return new THREE.TextBufferGeometry('Froma', {
        font: ,
        size: 3.0,
        height: .2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: .3,
        bevelSegments: 5,
      });
    
      let pos = { x: 0, y: radius/2.0, z: 0 };
    
      let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
      //mat.side = THREE.DoubleSide;
    
      const Tetrahedron = new THREE.Mesh(new THREE.TetrahedronBufferGeometry(radius), mat)
      
      Tetrahedron.position.set(pos.x, pos.y, pos.z)
      Tetrahedron.castShadow = true
      Tetrahedron.receiveShadow = true
      scene.add(Tetrahedron)
    
      Tetrahedron.userData.draggable = true
      Tetrahedron.userData.name = 'Tetrahedron'
    }*/

    //SpawnTube
    /*
    let spawnTube = document.getElementById("SpawnTube");
    if(spawnTube != null) spawnTube.addEventListener("click", (e:Event) => createTube());
    function createTube() {
      class CustomSinCurve extends THREE.Curve {
        constructor(scale) {
          super();
          this.scale = scale;
        }
        getPoint(t) {
          const tx = t * 3 - 1.5;
          const ty = Math.sin(2 * Math.PI * t);
          const tz = 0;
          return new THREE.Vector3(tx, ty, tz).multiplyScalar(this.scale);
        }
      }
      
      const path = new CustomSinCurve(4);
      const tubularSegments = 20;
      const radius = 1;
      const radialSegments = 8;
      const closed = false;
    
      let pos = { x: 0, y: 0, z: 0 };
    
      let mat = new THREE.MeshPhongMaterial({ color: 0x90ee90 });
      //mat.side = THREE.DoubleSide;
    
      const Tube = new THREE.Mesh(new THREE.TubeBufferGeometry(path, tubularSegments, radius, radialSegments, closed), mat)
      
      Tube.position.set(pos.x, pos.y, pos.z)
      Tube.castShadow = true
      Tube.receiveShadow = true
      scene.add(Tube)
    
      Tube.userData.draggable = true
      Tube.userData.name = 'Tube'
    }
    */

    /*--------------------END OF SHAPES------------------*/