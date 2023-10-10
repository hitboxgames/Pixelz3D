import { OrbitControls } from './modules/Controllers/OrbitControls.js'
import { FirstPersonControls } from './modules/Controllers/FirstPersonControls.js'
import { DragControls } from './modules/Controllers/DragControls.js'
import { ObjectSelector } from './modules/Shapes/ObjectSelector.js'
import { Disabled } from './modules/Features/Disabled.js'
import { ColorPicker } from './modules/Features/Inspector/ColorPicker.js';
import * as THREE from './three.module.js'
import { GridHelper, Object3D } from './three.module.js';
import { createObject, createShape } from "./modules/Shapes/ObjectBuilder.js"
import { loadJSON } from './modules/Loaders/LocalLoader.js'




console.log("client loaded...")
//socket.emit("loadObjectCache", objects.toJSON())

//Socket IO Code
const socket = io()
socket.on("connect", () => {
	console.log("Welcome to the session!")
})

socket.on("loadObjectCache", (_objects) => {
	objects.add(loadJSON(_objects))
})

socket.on("deleteObject", (uuid) => {
	let item = scene.getObjectByName(uuid)
	let parent = item.parent;
	if (parent != null) parent.remove(item);
})

const myRoomValues = window.location.search
socket.emit("joinRoom", myRoomValues)

socket.on("newRoomConnection", () => {
	console.log("A new user has connected to your session!")
})

export function spawnObject(shape) {
	socket.emit("spawnObject", shape, myRoomValues)
}

socket.on("spawnObject", (shape, uuid) => {
	console.log(shape)
	createShape(shape, objects, uuid)
})

socket.on("modifiedObject", (mods, uuid) => {
	let temp = scene.getObjectByName(uuid)
	if (temp.userData.draggable == true) {
		temp.position.set(mods.xPos, mods.yPos, mods.zPos)
		temp.rotation.set(mods.xRot, mods.yRot, mods.zRot)
		temp.scale.set(mods.xScale, mods.yScale, mods.zScale)
		temp.material.color = new THREE.Color(mods.color)
	}
})

socket.on("disableObject", (uuid) => {
	let temp = objects.getObjectByName(uuid)
	temp.userData.draggable = false
	scene.removeFromParent(temp)
	let outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x87CEEB, side: THREE.BackSide })
	let outlineMesh = temp.clone()
	outlineMesh.name = "outline"
	outlineMesh.material = outlineMaterial
	outlineMesh.position.set(temp.position.x, temp.position.y, temp.position.z)
	outlineMesh.scale.multiplyScalar(1.15)
	scene.add(outlineMesh)
})

socket.on("enableObject", (uuid) => {
	let temp = scene.getObjectByName(uuid)
	let outlineMesh = scene.getObjectByName("outline")
	scene.remove(outlineMesh)
	temp.userData.draggable = true
	objects.add(temp)
})

//Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true })

//Set SceneDiv
var sceneDiv;
if (document.getElementById('Scene') == null) {
	sceneDiv = window
	document.body.appendChild(renderer.domElement)
} else {
	sceneDiv = document.getElementById('Scene')
	sceneDiv.appendChild(renderer.domElement)
}

renderer.setPixelRatio(sceneDiv.devicePixelRatio);
renderer.setSize(sceneDiv.offsetWidth, sceneDiv.offsetHeight);
renderer.shadowMap.enabled = true;

// CAMERA
let camera = new THREE.PerspectiveCamera(30, sceneDiv.offsetWidth / sceneDiv.offsetHeight, 1, 5000);
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
scene.background = new THREE.Color(0x2D2E33);

const gridHelper = new THREE.GridHelper(100, 20, 0x000000, 0x000000)
scene.add(gridHelper)
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
let objects = new THREE.Group();
scene.add(objects);
const dControls = new DragControls(objects.children, camera, renderer.domElement);
dControls.enabled = true;

dControls.addEventListener("hoveron", event => {

})

dControls.addEventListener("hoveroff", event => {

})

let colorPicker = new ColorPicker(null);
dControls.addEventListener("dragstart", event => {
	updateInspectorVals();
	disableDragForOthers(event.object.name)
	lastSelectedObject = event.object;
	colorPicker.disableObject();
	colorPicker = new ColorPicker(event.object)
	event.object.material.transparent = true;
	event.object.material.opacity = 0.7;
	OrbitalControls.enabled = false;
})

dControls.addEventListener("drag", event => {

})

function disableDragForOthers(uuid) {
	socket.emit("disableObject", uuid)
}

function enableDragForOthers(uuid) {
	socket.emit("enableObject", uuid)
}


dControls.addEventListener("dragend", event => {
	enableDragForOthers(event.object.name)
	updateInspectorVals();
	updateRoomsObjectVals(event.object)
	event.object.material.transparent = true;
	event.object.material.opacity = 1;
	OrbitalControls.enabled = true;
})

//Update all objects in scene to all clients on server
export function updateRoomsObjectVals(_object) {
	socket.emit("modifiedObject", {
		xPos: _object.position.x,
		yPos: _object.position.y,
		zPos: _object.position.z,
		xRot: _object.rotation.x,
		yRot: _object.rotation.y,
		zRot: _object.rotation.z,
		xScale: _object.scale.x,
		yScale: _object.scale.y,
		zScale: _object.scale.z,
		color: _object.material.color
	}, _object.name, myRoomValues)
}

//Update all objects based on modifications on inspector
function updateInspectorVals() {
	const xPos = (document.getElementById("InpectorPositionX"));
	xPos.value = "" + lastSelectedObject.position.x;
	const yPos = (document.getElementById("InpectorPositionY"));
	yPos.value = "" + lastSelectedObject.position.y;
	const zPos = (document.getElementById("InpectorPositionZ"));
	zPos.value = "" + lastSelectedObject.position.z;

	const xRot = (document.getElementById("InspectorRotationX"));
	xRot.value = "" + (lastSelectedObject.rotation.x / (Math.PI / 180));
	const yRot = (document.getElementById("InspectorRotationY"));
	yRot.value = "" + (lastSelectedObject.rotation.y / (Math.PI / 180));
	const zRot = (document.getElementById("InspectorRotationZ"));
	zRot.value = "" + (lastSelectedObject.rotation.z / (Math.PI / 180));

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
	updateRoomsObjectVals(lastSelectedObject)
});
insPosY?.addEventListener("input", (event) => {
	const yPos = (document.getElementById("InpectorPositionY")).value;
	lastSelectedObject.position.y = Number(yPos);
	updateRoomsObjectVals(lastSelectedObject)
});
insPosZ?.addEventListener("input", (event) => {
	const zPos = (document.getElementById("InpectorPositionZ")).value;
	lastSelectedObject.position.z = Number(zPos);
	updateRoomsObjectVals(lastSelectedObject)
});

//Rotation
const insRotX = document.getElementById("InspectorRotationX");
const insRotY = document.getElementById("InspectorRotationY");
const insRotZ = document.getElementById("InspectorRotationZ");

insRotX?.addEventListener("input", (event) => {
	const xRot = (document.getElementById("InspectorRotationX")).value;
	lastSelectedObject.rotation.x = Number(xRot) * (Math.PI / 180);
	updateRoomsObjectVals(lastSelectedObject)
});
insRotY?.addEventListener("input", (event) => {
	const yRot = (document.getElementById("InspectorRotationY")).value;
	lastSelectedObject.rotation.y = Number(yRot) * (Math.PI / 180);
	updateRoomsObjectVals(lastSelectedObject)
});
insRotZ?.addEventListener("input", (event) => {
	const zRot = (document.getElementById("InspectorRotationZ")).value;
	lastSelectedObject.rotation.z = Number(zRot) * (Math.PI / 180);
	updateRoomsObjectVals(lastSelectedObject)
});

//Scale
const insScaleX = document.getElementById("InspectorScaleX");
const insScaleY = document.getElementById("InspectorScaleY");
const insScaleZ = document.getElementById("InspectorScaleZ");

insScaleX?.addEventListener("input", (event) => {
	const xScale = (document.getElementById("InspectorScaleX")).value;
	lastSelectedObject.scale.x = Number(xScale);
	updateRoomsObjectVals(lastSelectedObject)
});
insScaleY?.addEventListener("input", (event) => {
	const yScale = (document.getElementById("InspectorScaleY")).value;
	lastSelectedObject.scale.y = Number(yScale);
	updateRoomsObjectVals(lastSelectedObject)
});
insScaleZ?.addEventListener("input", (event) => {
	const zScale = (document.getElementById("InspectorScaleZ")).value;
	lastSelectedObject.scale.z = Number(zScale);
	updateRoomsObjectVals(lastSelectedObject)
});

//Delete an Object
const deleteBtn = document.getElementById("TrashBtn");
deleteBtn?.addEventListener("click", (event) => {
	console.log(lastSelectedObject.name);
	socket.emit("deleteObject", lastSelectedObject.name, myRoomValues)
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
	paste.position.set(0, paste.position.y, 0);
	paste.material = new THREE.MeshPhongMaterial({ color: paste.material.color });
	objects.add(paste);
});

//Duplicate Object
const duplicateBtn = document.getElementById("DuplicateBtn");
duplicateBtn?.addEventListener("click", (event) => {
	copySelectedObject = lastSelectedObject;
	let paste = new THREE.Mesh();
	paste.copy(copySelectedObject);
	paste.material = new THREE.MeshPhongMaterial({ color: copySelectedObject.material.color });
	objects.add(paste);
});

// ---------------------------- OBJECT BUILDER ----------------------------
//This is what will setup all the buttons to make shapes
new ObjectSelector(objects)

//Animation Loop
function animate() {
	renderer.render(scene, camera);
	if (FPControls.enabled) FPControls.update(1);
	requestAnimationFrame(animate);
}

// ambient light
let hemiLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(hemiLight);

//Add directional light
let dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(-30, 50, -30);
scene.add(dirLight);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -70;
dirLight.shadow.camera.right = 70;
dirLight.shadow.camera.top = 70;
dirLight.shadow.camera.bottom = -70;

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




//Add buttons for all the objects
const objectSelectionMenu = document.getElementById("objectSelection")

let objectCards = []
let originalCards = document.getElementsByClassName('objectButton')
for (let i = 0; i < originalCards.length; i++) {
	objectCards.push(originalCards[i])
}

const searchInput = document.getElementById("objectSearchInput")

searchInput.addEventListener("input", (e) => {
	const value = e.target.value
})

searchInput.addEventListener("input", e => {
	const value = e.target.value.toLowerCase()
	objectCards.forEach(temp => {
		const isVisible = temp.innerText.toLowerCase().includes(value)
		temp.classList.toggle("hide", !isVisible)
	})
})


//createAIObject()
//horizonGenerateIMG("clear blue sky")

/*
const furniture = [
					["armchair", 20, "Arm Chair"],
					["bathroomaccessory", 24, "Bathroom Accessory"],
					["bathroomfurniture", 10, "Bathroom Furniture"],
					["bathtub", 20, "Bathtub"],
					["bed", 20, "Bed"],
					["carpet", 24, "Carpet"],
					["chair", 20, "Chair"],
					["childrenbed", 20, "Children's Bed"],
					["childrenchair", 20, "Children's Chair"],
					["console", 20, "Console / Dressor"],
					["door", 20, "Door"],
					["fauset", 26, "Fauset"],
					["floorlamp", 26, "Floor Lamp"],
					["homeappliance", 78, "Home Appliance"],
					["kitchen", 47, "Kitchen"],
					["mirror", 12, "Mirror"],
					["officechair", 20, "Office Chair"],
					["plant", 20, "Plant"],
					["pouffe", 20, "Pouffe"],
					["sculpture", 10, "Sculpture"],
					["toilet", 23, "Toilet"]
				]

for(let i = 0; i < furniture.length; i++){
	for(let j = 1; j <= furniture[i][1]; j++){
		var shapeBtn = document.createElement("button")
		shapeBtn.classList.add("objectButton")
		shapeBtn.innerText = furniture[i][2] + " " + j

		let num = j.toString();
		while(num.length < 3) num = "0" + num

		shapeBtn.onclick = () => spawnObject(furniture[i][0] + num)
		objectSelectionMenu.appendChild(shapeBtn)
		objectCards.push(shapeBtn)
	}
}
*/



function createAIObject() {
	console.log("starting some shit")
	//scene.add(galactusGenerateGLB("red car"));
	galactusGenerateGLB("red car")
	console.log("finishing some shit")

	//Once it makes the object I want to store it into a button
}

function galactusGenerateGLB(prompt) {
	console.log("Sending fetch to Server")
	return fetch("http://localhost:3000/3D", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: prompt,
		})
	}).then(
		async (response) => {
			let words = await response.json()
			console.log(words)
		}
	)
}

async function horizonGenerateIMG(prompt) {
	console.log("Sending fetch to Server")
	return fetch("http://localhost:3000/SkyBox", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt: prompt,
		})
	}).then(
		async (response) => {
			let data = await response.json()
			console.log(data.images[0])
			var image = new Image();
			image.src = 'data:image/png;base64,' + data.images[0];
			const texture = new THREE.TextureLoader().load( image.src , function(texture)
            {
				const geometry = new THREE.SphereGeometry( 1000, 32, 16 );
				const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
				material.map = texture
				material.side = THREE.BackSide
				const sphere = new THREE.Mesh( geometry, material );
				scene.add(sphere)
             	//scene.background = texture;
            })
		}
	)
}