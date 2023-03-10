import { OrbitControls } from './modules/Controllers/OrbitControls.js'
import { FirstPersonControls } from './modules/Controllers/FirstPersonControls.js'
import { DragControls } from './modules/Controllers/DragControls.js'
import { ObjectBuilder } from './modules/Shapes/ObjectBuilder.js'
import { Disabled } from './modules/Features/Disabled.js'
import { ColorPicker } from './modules/Features/Inspector/ColorPicker.js';
import { GLTFLoader } from './modules/loaders/GLTFLoader.js'; //https://github.com/mrdoob/three.js/tree/dev/examples/jsm/loaders
import { GLTFExporter } from './modules/exporters/GLTFExporter.js'; //https://github.com/mrdoob/three.js/tree/dev/examples/jsm/exporters
import * as THREE from './three.module.js'
import { GridHelper, Object3D} from './three.module.js';

console.log("client loaded...")
//Socket IO Code
const socket = io.connect('http://localhost:3001')
//socket.on('connection')

//remove when done debugging
//const THREE = require('three')

//Renderer
const renderer = new THREE.WebGLRenderer({antialias: true})

//Set SceneDiv
var sceneDiv;
if(document.getElementById('Scene') == null){
	sceneDiv = window
	document.body.appendChild(renderer.domElement)
}else{
	sceneDiv = document.getElementById('Scene')
	sceneDiv.appendChild(renderer.domElement)
}

renderer.setPixelRatio(sceneDiv.devicePixelRatio);
renderer.setSize(sceneDiv.offsetWidth, sceneDiv.offsetHeight);
renderer.shadowMap.enabled = true;

// CAMERA
let camera = new THREE.PerspectiveCamera(30, sceneDiv.offsetWidth / sceneDiv.offsetHeight, 1, 1500);
camera.position.set(-35, 70, 100);
camera.lookAt(new THREE.Vector3(0, 0, 0));

// WINDOW RESIZE HANDLING
function onWindowResize() {
  camera.aspect = sceneDiv.offsetWidth / sceneDiv.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(sceneDiv.offsetWidth, sceneDiv.offsetHeight);
}
window.addEventListener('resize', onWindowResize);

// SCENE - GRID HELPER
const scene = new THREE.Scene()
scene.background = new THREE.Color(0x121212);

const gridHelper = new THREE.GridHelper(100, 20, 0x58D9F0, 0x58D9F0)
scene.add(gridHelper)
createFloor()
var lastSelectedObject = new THREE.Mesh();
var sceneFloor;
var color = 0xffff00;

// ---------------------------- CONTROLS ----------------------------
//Orbital
let OrbitalControls = new OrbitControls(camera, renderer.domElement);
OrbitalControls.enabled = true;
//Prep FPV
let FPControls = new FirstPersonControls(camera, renderer.domElement);
FPControls.enabled = false;
//Dragging Controls
const objects = new THREE.Group();
scene.add(objects);
const dControls = new DragControls(objects.children, camera, renderer.domElement);
dControls.enabled = true;

dControls.addEventListener("hoveron", event => {

})

dControls.addEventListener("hoveroff", event => {

})

let colorPicker = new ColorPicker(null);
dControls.addEventListener("dragstart", event => {
  console.log("drag start")
  updateInspectorVals();
  lastSelectedObject = event.object;
  colorPicker.disableObject();
  colorPicker = new ColorPicker(event.object)
  event.object.material.transparent = true;
  event.object.material.opacity = 0.7;
  OrbitalControls.enabled = false;
})


dControls.addEventListener("dragend", event => {
  console.log("drag end")
  updateInspectorVals();
  event.object.material.transparent = true;
  event.object.material.opacity = 1;
  OrbitalControls.enabled = true;
})

function updateInspectorVals(){
	const xPos = (document.getElementById("InpectorPositionX"));
	xPos.value = "" + lastSelectedObject.position.x;
	const yPos = (document.getElementById("InpectorPositionY"));
	yPos.value = "" + lastSelectedObject.position.y;
	const zPos = (document.getElementById("InpectorPositionZ"));
	zPos.value = "" + lastSelectedObject.position.z;
  
	const xRot = (document.getElementById("InspectorRotationX"));
	xRot.value = "" + (lastSelectedObject.rotation.x / (Math.PI /180));
	const yRot = (document.getElementById("InspectorRotationY"));
	yRot.value = "" + (lastSelectedObject.rotation.y / (Math.PI /180));
	const zRot = (document.getElementById("InspectorRotationZ"));
	zRot.value = "" + (lastSelectedObject.rotation.z / (Math.PI /180));
  
	const xScale = (document.getElementById("InspectorScaleX"));
	xScale.value = "" + lastSelectedObject.scale.x;
	const yScale = (document.getElementById("InspectorScaleY"));
	yScale.value = "" + lastSelectedObject.scale.y;
	const zScale = (document.getElementById("InspectorScaleZ"));
	zScale.value = "" + lastSelectedObject.scale.z;
}

// ---------------------------- END OF CONTROLS ----------------------------

// ---------------------------- INSPECTOR: Add to feature folder later ----------------------------

//Position
const insPosX = document.getElementById("InpectorPositionX");
const insPosY = document.getElementById("InpectorPositionY");
const insPosZ = document.getElementById("InpectorPositionZ");

//Position
insPosX?.addEventListener("input", (event) => {
	const xPos = (document.getElementById("InpectorPositionX")).value;
	lastSelectedObject.position.x = Number(xPos);
});
insPosY?.addEventListener("input", (event) => {
	const yPos = (document.getElementById("InpectorPositionY")).value;
	lastSelectedObject.position.y = Number(yPos);
});
insPosZ?.addEventListener("input", (event) => {
	const zPos = (document.getElementById("InpectorPositionZ")).value;
	lastSelectedObject.position.z = Number(zPos);
});

//Rotation
const insRotX = document.getElementById("InspectorRotationX");
const insRotY = document.getElementById("InspectorRotationY");
const insRotZ = document.getElementById("InspectorRotationZ");

insRotX?.addEventListener("input", (event) => {
	const xRot = (document.getElementById("InspectorRotationX")).value;
	lastSelectedObject.rotation.x = Number(xRot) * (Math.PI /180);
});
insRotY?.addEventListener("input", (event) => {
	const yRot = (document.getElementById("InspectorRotationY")).value;
	lastSelectedObject.rotation.y = Number(yRot) * (Math.PI /180);
});
insRotZ?.addEventListener("input", (event) => {
	const zRot = (document.getElementById("InspectorRotationZ")).value;
	lastSelectedObject.rotation.z = Number(zRot) * (Math.PI /180);
});

//Scale
const insScaleX = document.getElementById("InspectorScaleX");
const insScaleY = document.getElementById("InspectorScaleY");
const insScaleZ = document.getElementById("InspectorScaleZ");

insScaleX?.addEventListener("input", (event) => {
	const xScale = (document.getElementById("InspectorScaleX")).value;
	lastSelectedObject.scale.x = Number(xScale);
});
insScaleY?.addEventListener("input", (event) => {
	const yScale = (document.getElementById("InspectorScaleY")).value;
	lastSelectedObject.scale.y = Number(yScale);
});
insScaleZ?.addEventListener("input", (event) => {
	const zScale = (document.getElementById("InspectorScaleZ")).value;
	lastSelectedObject.scale.z = Number(zScale);
});

//Delete an Object
const deleteBtn = document.getElementById("TrashBtn");
deleteBtn?.addEventListener("click", (event) => {
  console.log(lastSelectedObject);
  let parent = lastSelectedObject.parent;
  if(parent != null) parent.remove(lastSelectedObject);
});

var copySelectedObject = new THREE.Mesh();
//Copy Object
const copyBtn = document.getElementById("CopyBtn");
copyBtn?.addEventListener("click", (event) => {
  copySelectedObject = lastSelectedObject;
  console.log("copied");
});

//Paste Object
const pasteBtn = document.getElementById("PasteBtn");
pasteBtn?.addEventListener("click", (event) => {
  let paste = new THREE.Mesh();
  paste.copy(copySelectedObject);
  paste.position.set(0,paste.position.y,0);
  paste.material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF});
  objects.add(paste);
});

//Duplicate Object
const duplicateBtn = document.getElementById("DuplicateBtn");
duplicateBtn?.addEventListener("click", (event) => {
  copySelectedObject = lastSelectedObject;
  let paste = new THREE.Mesh();
  paste.copy(copySelectedObject);
  paste.material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF});
  objects.add(paste);
});

//Import
const importBtn = document.getElementById("ImportBtn");
const uploader = document.getElementById("uploader");

importBtn?.addEventListener("click" , (event) => {
  uploader?.click();
})

uploader?.addEventListener("change", (event) => {
	const loader = new GLTFLoader();
	
	const files = (uploader).files;
	let file;
	if(files != null ) {
	  file = files[0];
	  console.log(file);
	  
  
	  const reader = new FileReader();
  
	  reader.addEventListener("load", () => {
		//console.log(reader.result);
		localStorage.setItem("recent-file", "" + reader.result);
		//console.log(localStorage.getItem("recent-file"));
		importContent();
	  });
  
	  reader.readAsDataURL(file);
	
	}
  
	function importContent(){
	  // Load a glTF resource
	  loader.load(
		  // resource URL
		  "" + localStorage.getItem("recent-file"),
		  // called when the resource is loaded
		  function ( gltf ) {
		  objects.add(gltf.scene);
		  },
		  // called while loading is progressing
		  function ( xhr ) {
			  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
		  },
		  // called when loading has errors
		  function ( error ) {
			  console.log( 'An error happened' );
		  }
	  );
	}	
})

//Export GLB
const exportBtn = document.getElementById("ExportBtn");
exportBtn?.addEventListener("click", (event) => {
  download()
});

function download() {
  scene.remove(gridHelper)
  scene.remove(sceneFloor)

  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    function (result) {
      saveArrayBuffer(result, 'scene.gltf');
    },
    { binary: true }
  );

  scene.add(gridHelper)
  createFloor()
}

function saveArrayBuffer(buffer, filename) {
  save(new Blob([buffer], { type: 'application/octet-stream' }), filename);
}

const link = document.createElement('a');
link.style.display = 'none';
document.body.appendChild(link);

function save(blob, filename) {
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

// ---------------------------- OBJECT BUILDER ----------------------------
//This is what will setup all the buttons to make shapes

let objectBuilder = new ObjectBuilder(objects)

//Animation Loop
function animate() {
  renderer.render(scene, camera);
  if (FPControls.enabled) FPControls.update(1);
  requestAnimationFrame(animate);
}

// ambient light
let hemiLight = new THREE.AmbientLight(0xffffff, 0.20);
scene.add(hemiLight);

//Add directional light
let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(-30, 50, -30);
scene.add(dirLight);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -70;
dirLight.shadow.camera.right = 70;
dirLight.shadow.camera.top = 70;
dirLight.shadow.camera.bottom = -70;

function createFloor() {
  let pos = { x: 0, y: 0, z: 0 };
  let scale = { x: 1, y: 1, z: 1 };

  const floorMaterial = new THREE.MeshPhongMaterial({
    color: 0x58D9F0,
    flatShading: true,
    transparent: true,
    opacity: 0.25,
  });

  let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(100, 0.1, 100), floorMaterial);

  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(scale.x, scale.y, scale.z);
  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;
  scene.add(blockPlane);
  sceneFloor = blockPlane;
  blockPlane.userData.ground = true
}

animate()

//Activate Features
let disabled = new Disabled()

//Play
let PlayBtn = document.getElementById("PlayBtn");
if (PlayBtn != null) PlayBtn.addEventListener("click", (e) => playScene());

//Pause
//let PauseBtn = document.getElementById("PauseBtn");
//if (PauseBtn != null) PauseBtn.addEventListener("click", (e: Event) => featureDisabled());

//Stop
let StopBtn = document.getElementById("StopBtn");
if (StopBtn != null) StopBtn.addEventListener("click", (e) => stopScene());

/* First Person POV */
function playScene() {
	OrbitalControls.enabled = false;
	dControls.enabled = false;
	FPControls.enabled = true;
	camera.position.set(0, 1, 3);
	FPControls.lookSpeed = 0.001;
  
	let Inspector = document.getElementById('Inspector')
	if (Inspector != null) Inspector.style.display = "none";
	let Controls = document.getElementById('Controls')
	if (Controls != null) Controls.style.display = "none";
  }
  
  function stopScene() {
	FPControls.enabled = false;
	dControls.enabled = true;
	OrbitalControls.enabled = true;
	camera.position.set(-35, 70, 100);
	camera.lookAt(new THREE.Vector3(0, 0, 0));
  
	let Controls = document.getElementById('Controls')
	if (Controls != null) Controls.style.display = "block";
  }