import * as THREE from '../../three.module.js'
import { OBJLoader } from '../Loaders/OBJLoader.js';
import { createShape } from './ObjectBuilder.js';
import { spawnObject } from '../../client.js';

class ObjectSelector {

    constructor(_objects) {
        let objects = _objects;
        this.bufferObjects(objects)
    }

    bufferObjects(objects) {
        let spawnCone = document.getElementById("SpawnCone");
        if (spawnCone != null) spawnCone.addEventListener("click", (e) => spawnObject("cone"));

        let spawnBox = document.getElementById("SpawnBox");
        if (spawnBox != null) spawnBox.addEventListener("click", (e) => spawnObject("box"));

        let spawnSphere = document.getElementById("SpawnSphere");
        if (spawnSphere != null) spawnSphere.addEventListener("click", (e) => spawnObject("sphere"));

        let spawnCylinder = document.getElementById("SpawnCylinder");
        if (spawnCylinder != null) spawnCylinder.addEventListener("click", (e) => spawnObject("cylinder"));

        //let spawnCastle = document.getElementById("SpawnCastle");
        //if (spawnCastle != null) spawnCastle.addEventListener("click", (e) => spawnObject("castle"));

        let spawnCircle = document.getElementById("SpawnCircle");
        if (spawnCircle != null) spawnCircle.addEventListener("click", (e) => spawnObject("circle"));

        let spawnDodecahedron = document.getElementById("SpawnDodecahedron");
        if (spawnDodecahedron != null) spawnDodecahedron.addEventListener("click", (e) => spawnObject("dodecahedron"));

        let spawn3DHeart = document.getElementById("Spawn3DHeart");
        if (spawn3DHeart != null) spawn3DHeart.addEventListener("click", (e) => spawnObject("3dheart"));

        let spawnIcosahedron = document.getElementById("SpawnIcosahedron");
        if (spawnIcosahedron != null) spawnIcosahedron.addEventListener("click", (e) => spawnObject("icosahedron"));

        let spawnOctahedron = document.getElementById("SpawnOctahedron");
        if (spawnOctahedron != null) spawnOctahedron.addEventListener("click", (e) => spawnObject("octahedron"));

        let spawnParametric = document.getElementById("SpawnParametric");
        if (spawnParametric != null) spawnParametric.addEventListener("click", (e) => spawnObject("parametric"));

        let spawnPlane = document.getElementById("SpawnPlane");
        if (spawnPlane != null) spawnPlane.addEventListener("click", (e) => spawnObject("plane"));

        let spawnPolyhedron = document.getElementById("SpawnPolyhedron");
        if (spawnPolyhedron != null) spawnPolyhedron.addEventListener("click", (e) => spawnObject("polyhedron"));

        let spawn2DHeart = document.getElementById("Spawn2DHeart");
        if (spawn2DHeart != null) spawn2DHeart.addEventListener("click", (e) => spawnObject("2dheart"));

        let spawnTetrahedron = document.getElementById("SpawnTetrahedron");
        if (spawnTetrahedron != null) spawnTetrahedron.addEventListener("click", (e) => spawnObject("tetrahedron"));

        let spawnTorus = document.getElementById("SpawnTorus");
        if (spawnTorus != null) spawnTorus.addEventListener("click", (e) => spawnObject("torus"));

        let spawnTorusKnot = document.getElementById("SpawnTorusKnot");
        if (spawnTorusKnot != null) spawnTorusKnot.addEventListener("click", (e) => spawnObject("torusknot"));

        let spawnRing = document.getElementById("SpawnRing");
        if (spawnRing != null) spawnRing.addEventListener("click", (e) => spawnObject("ring"));
    }
}

export { ObjectSelector };