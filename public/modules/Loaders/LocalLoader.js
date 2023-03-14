import * as THREE from '../../three.module.js'

export default class LocalLoader{
    constructor(){

    }
}

export function loadJSON(data){
    let object = new THREE.ObjectLoader().parse(data)
    return object
}