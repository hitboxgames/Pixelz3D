import * as THREE from '../../three.module.js'
import { OBJLoader } from '../Loaders/OBJLoader.js';
import { GLTFLoader } from '../Loaders/GLTFLoader.js';
import { MTLLoader } from '../Loaders/MTLLoader.js';
import { loadJSON } from '../Loaders/LocalLoader.js';

export default class ObjectBuilder {
    constructor() {

    }
}

export function createShape(shape, objects, uuid) {
    if (shape == "box") createBox(objects, uuid)
    else if (shape == "cone") createCone(objects, uuid)
    else if (shape == "sphere") createSphere(objects, uuid)
    else if (shape == "cylinder") createCylinder(objects, uuid)
    else if (shape == "3dheart") create3DHeart(objects, uuid)
    else if (shape == "plane") createPlane(objects, uuid)
    else if (shape == "torus") createTorus(objects, uuid)
    else createObject(shape, objects, uuid);
}

function createBox(objects, uuid) {
    let scale = { x: 1, y: 1, z: 1 }
    let pos = { x: 0, y: 5 / 2.0, z: 0 }
    let box = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 5, 5), new THREE.MeshPhongMaterial({ color: 0xDC143C }));

    box.position.set(pos.x, pos.y, pos.z);
    box.scale.set(scale.x, scale.y, scale.z);
    box.castShadow = true;
    box.receiveShadow = true;

    box.userData.draggable = true
    box.userData.name = 'Cube'
    box.name = uuid
    
    objects.add(box)
}

function createCone(objects, uuid) {
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
    Cone.userData.name = 'Cone'
    Cone.name = uuid
    
    objects.add(Cone)
}

function createSphere(objects, uuid) {
    let radius = 4;
    let pos = { x: 0, y: radius, z: 0 };

    let sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32),
        new THREE.MeshPhongMaterial({ color: 0x43a1f4 }))
    sphere.position.set(pos.x, pos.y, pos.z)
    sphere.castShadow = true
    sphere.receiveShadow = true

    sphere.userData.draggable = true
    sphere.userData.name = 'Sphere'
    sphere.name = uuid
    
    objects.add(sphere)
}

function createCylinder(objects, uuid) {
    let radius = 4;
    let height = 6
    let pos = { x: 0, y: height / 2, z: 0 };

    // threejs
    let cylinder = new THREE.Mesh(new THREE.CylinderBufferGeometry(radius, radius, height, 32), new THREE.MeshPhongMaterial({ color: 0x90ee90 }))
    cylinder.position.set(pos.x, pos.y, pos.z)
    cylinder.castShadow = true
    cylinder.receiveShadow = true

    cylinder.userData.draggable = true
    cylinder.userData.name = 'Cylinder'
    cylinder.name = uuid
    
    objects.add(cylinder)
}

export function createObject(file, objects, uuid) {
    /*
    const mtlLoader = new MTLLoader()
    mtlLoader.setPath('./modules/Shapes/Materials/')
    mtlLoader.load(fileName + '.mtl', (materials) => {
        materials.preload();
        
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials)
        objLoader.setPath('./modules/Shapes/Objects/')
        objLoader.loadAsync(fileName +'.obj').then((group) => {
            const furniture = group.children[0];

            furniture.scale.x = 1;
            furniture.scale.y = 1;
            furniture.scale.z = 1;
            
            //Gets the size of the shape
            let box3 = new THREE.Box3().setFromObject( furniture );
            let size = new THREE.Vector3();
            console.log(box3.getSize(size).y)

            furniture.position.x = 0
            furniture.position.y = Math.ceil(box3.getSize(size).y/2);
            furniture.position.z = 0

            furniture.castShadow = true
            furniture.receiveShadow = true

            furniture.userData.draggable = true
            furniture.userData.name = 'CUSTOM_OBJECT'
            furniture.name = uuid
            
            objects.add(furniture)
        })
    })*/
    let convert = loadJSON(file)
    console.log(convert)
    convert.name = uuid
    objects.add(convert)
}

function create3DHeart(objects, uuid) {
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
    ThreeDHeart.userData.name = '3D Heart'
    ThreeDHeart.name = uuid
    
    objects.add(ThreeDHeart)
}

function createPlane(objects, uuid) {
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
    Plane.name = uuid
    
    objects.add(Plane)
}


function createTorus(objects, uuid) {
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
    Torus.name = uuid
    
    objects.add(Torus)
}