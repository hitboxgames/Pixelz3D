import { OrbitControls } from './modules/Controllers/OrbitControls.js'
import { FirstPersonControls } from './modules/Controllers/FirstPersonControls.js'
import { DragControls, activateInspector, isInspectorActive } from './modules/Controllers/DragControls.js'
import { ObjectSelector } from './modules/Shapes/ObjectSelector.js'
import { Disabled } from './modules/Features/Disabled.js'
import * as THREE from './three.module.js'
import { GridHelper, Object3D } from './three.module.js';
import { createObject, createShape } from "./modules/Shapes/ObjectBuilder.js"
import { loadJSON } from './modules/Loaders/LocalLoader.js'
import { TransformControls } from './modules/Controllers/TransformControls.js'
import { OBJLoader } from './modules/Loaders/OBJLoader.js'




console.log("client loaded...")
//socket.emit("loadObjectCache", objects.toJSON())

//Socket IO Code
const socket = io()
let initialized = false
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
	initialized = true
	const insSceneColor = document.getElementById("InspectorSceneColor");
	let sceneCopy = scene
	let sceneModelSrcs = []
	console.log(scene)
	sceneCopy.traverse(async function (object) {
		if (object.userData.tag == "3DAI") {
			sceneModelSrcs.push([object.userData.src, object.name])
			console.log(object.userData.src)
			let parentObj = object.parent
			await parentObj.remove(object)
		}
	});
	let sceneJson = sceneCopy.toJSON()
	console.log(sceneCopy)
	socket.emit("sendWorldUpdate", sceneJson, sceneModelSrcs, insSceneColor.value, myRoomValues)
})

socket.on("sendWorldUpdate", (sceneObjects, sceneModelSrcs, skycolor) => {
	if (!initialized) {
		initialized = true
		var lights = scene.getObjectByName("lights")
		scene.remove(lights)
		objects.add(loadJSON(sceneObjects))
		//console.log("cum")
		let skybox = objects.children[0].getObjectByName("Skybox")
		scene.add(skybox)
		objects.remove(skybox)
		let gif = sceneModelSrcs[0][0][0]
		let model = sceneModelSrcs[0][0][1]
		let uuid = sceneModelSrcs[0][1]

		socket.emit("spawnJSON", [gif, model], myRoomValues)
		addToCollection([gif, model])

		console.log(gif)
		console.log(model)
		console.log(uuid)
		//objects.remove(skybox)
		//console.log("shit initial")
		//console.log(objects.children[0].getObjectByName("Skybox"))
		updateRoomsSceneColor(skycolor)
	}
})

export function spawnObject(shape, skybox) {
	if (!skybox) { socket.emit("spawnObject", shape, myRoomValues) }
	else { socket.emit("spawnSkyBox", shape, myRoomValues) }
}

socket.on("spawnObject", (shape, uuid) => {
	console.log(shape)
	createShape(shape, objects, uuid)
	document.getElementById("AddObjectsMenu").style.display = "none"
	getSceneObjects()
})

socket.on("spawnJSON", (modelSrc, uuid) => {
	generateObj(modelSrc, uuid)
})

socket.on("spawnSkyBox", (shape) => {
	let convert = loadJSON(shape)
	var selectedObject = scene.getObjectByName("Skybox");
	console.log(selectedObject)
	scene.remove(selectedObject);
	scene.add(convert)
	console.log(shape)
})

socket.on("modifiedObject", (mods, uuid) => {
	let temp = scene.getObjectByName(uuid)
	if (temp.userData.draggable == true) {
		temp.userData.name = mods.name
		temp.position.set(mods.xPos, mods.yPos, mods.zPos)
		temp.rotation.set(mods.xRot, mods.yRot, mods.zRot)
		temp.scale.set(mods.xScale, mods.yScale, mods.zScale)
		temp.material.color = new THREE.Color(mods.color)
	}
})

socket.on("modifiedSkyColor", (color) => {
	let trailing = "0".repeat(6 - color.length)
	sceneDisplayColor.style.backgroundColor = "#" + color + trailing;
	scene.background = new THREE.Color(parseInt("0x" + color + trailing));
	updateSceneColorVal("" + color)
})

socket.on("disableObject", (uuid) => {
	let temp = objects.getObjectByName(uuid)
	temp.userData.draggable = false
	scene.removeFromParent(temp)
	let outlineMaterial = new THREE.MeshBasicMaterial({ color: 0xFF007D, side: THREE.BackSide })
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
let scene = new THREE.Scene()
scene.background = new THREE.Color(0x2D2E33);

const gridHelper = new THREE.GridHelper(500, 100, 0x000000, 0x000000)
scene.add(gridHelper)
var lastSelectedObject = new THREE.Mesh();
var sceneFloor;
var color = 0xffff00;

// ---------------------------- CONTROLS ----------------------------
//Orbital
let OrbitalControls = new OrbitControls(camera, renderer.domElement);
OrbitalControls.enabled = true;
//OrbitalControls.enableRotate = false;
//Prep FPV
let FPControls = new FirstPersonControls(camera, renderer.domElement);
FPControls.enabled = false;
//Tranform Controls
const tControls = new TransformControls(camera, renderer.domElement)
tControls.name = "TransformControls"

tControls.addEventListener('dragging-changed', function (event) {
	OrbitalControls.enableRotate = !event.value;
	dControls.enabled = !event.value;
	updateRoomsObjectVals(lastSelectedObject)
	updateInspectorVals()
})

//Dragging Controls
let objects = new THREE.Group();
scene.add(objects);
const dControls = new DragControls(objects.children, camera, renderer.domElement);
dControls.enabled = true;

dControls.addEventListener("hoveron", event => {

})

dControls.addEventListener("hoveroff", event => {

})

dControls.addEventListener("dragstart", event => {
	draggingEvent(event.object)
})

function draggingEvent(object) {
	tControls.attach(object)
	let InspectorDiv = document.getElementById('InspectorDiv')
	if (InspectorDiv != null) InspectorDiv.style.display = "block";
	disableDragForOthers(object.name)
	let SelectedObjectInSceneList = document.getElementById(lastSelectedObject.name);
	if (SelectedObjectInSceneList != undefined) SelectedObjectInSceneList.classList.remove("highlight")
	lastSelectedObject = object;
	updateInspectorVals();
	//object.material.transparent = true;
	//object.material.opacity = 0.7;
	OrbitalControls.enabled = false;

	SelectedObjectInSceneList = document.getElementById(object.name);
	if (SelectedObjectInSceneList != undefined) SelectedObjectInSceneList.classList.add("highlight")
}

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
		name: _object.userData.name,
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

function updateRoomsSceneColor(color) {
	socket.emit("modifiedSkyColor", color, myRoomValues)
}

//Update all objects based on modifications on inspector
function updateInspectorVals() {
	const insObjName = document.getElementById("ObjectInspectorName");
	insObjName.value = lastSelectedObject.userData.name

	const xPos = (document.getElementById("posX"));
	xPos.value = "" + lastSelectedObject.position.x;
	const yPos = (document.getElementById("posY"));
	yPos.value = "" + lastSelectedObject.position.y;
	const zPos = (document.getElementById("posZ"));
	zPos.value = "" + lastSelectedObject.position.z;

	const xRot = (document.getElementById("rotX"));
	xRot.value = "" + (lastSelectedObject.rotation.x / (Math.PI / 180));
	const yRot = (document.getElementById("rotY"));
	yRot.value = "" + (lastSelectedObject.rotation.y / (Math.PI / 180));
	const zRot = (document.getElementById("rotZ"));
	zRot.value = "" + (lastSelectedObject.rotation.z / (Math.PI / 180));

	const xScale = (document.getElementById("sclX"));
	xScale.value = "" + lastSelectedObject.scale.x;
	const yScale = (document.getElementById("sclY"));
	yScale.value = "" + lastSelectedObject.scale.y;
	const zScale = (document.getElementById("sclZ"));
	zScale.value = "" + lastSelectedObject.scale.z;

	const materialColorInput = document.getElementById("InspectorObjectColor");
	materialColorInput.value = lastSelectedObject.material.color.getHexString().toUpperCase()
	document.getElementById("InspectorObjectColorBox").style.backgroundColor = "#" + lastSelectedObject.material.color.getHexString().toUpperCase()
}

function updateSceneColorVal(color) {
	const insSceneColor = document.getElementById("InspectorSceneColor");
	insSceneColor.value = color
}

// ---------------------------- END OF CONTROLS ----------------------------

// ---------------------------- INSPECTOR: Add to feature folder later ----------------------------

//Scene Sky Color
const insSceneColor = document.getElementById("InspectorSceneColor");
const sceneDisplayColor = document.getElementById("InspectorSceneColorBox");
insSceneColor?.addEventListener("input", (event) => {
	const sceneColor = (document.getElementById("InspectorSceneColor")).value;
	let CSSHex = sceneColor
	let trailing = "0".repeat(6 - CSSHex.length)
	sceneDisplayColor.style.backgroundColor = "#" + sceneColor + trailing;
	scene.background = new THREE.Color(parseInt("0x" + sceneColor + trailing));
	updateRoomsSceneColor(sceneColor)
});

const insObjName = document.getElementById("ObjectInspectorName");
insObjName?.addEventListener("input", (event) => {
	lastSelectedObject.userData.name = insObjName.value
	updateRoomsObjectVals(lastSelectedObject)
});


//Position
const insPosX = document.getElementById("posX");
const insPosY = document.getElementById("posY");
const insPosZ = document.getElementById("posZ");

//Position
insPosX?.addEventListener("input", (event) => {
	const xPos = (document.getElementById("posX")).value;
	lastSelectedObject.position.x = Number(xPos);
	updateRoomsObjectVals(lastSelectedObject)
});
insPosY?.addEventListener("input", (event) => {
	const yPos = (document.getElementById("posY")).value;
	lastSelectedObject.position.y = Number(yPos);
	updateRoomsObjectVals(lastSelectedObject)
});
insPosZ?.addEventListener("input", (event) => {
	const zPos = (document.getElementById("posZ")).value;
	lastSelectedObject.position.z = Number(zPos);
	updateRoomsObjectVals(lastSelectedObject)
});

//Rotation
const insRotX = document.getElementById("rotX");
const insRotY = document.getElementById("rotY");
const insRotZ = document.getElementById("rotZ");

insRotX?.addEventListener("input", (event) => {
	const xRot = (document.getElementById("rotX")).value;
	lastSelectedObject.rotation.x = Number(xRot) * (Math.PI / 180);
	updateRoomsObjectVals(lastSelectedObject)
});
insRotY?.addEventListener("input", (event) => {
	const yRot = (document.getElementById("rotY")).value;
	lastSelectedObject.rotation.y = Number(yRot) * (Math.PI / 180);
	updateRoomsObjectVals(lastSelectedObject)
});
insRotZ?.addEventListener("input", (event) => {
	const zRot = (document.getElementById("rotZ")).value;
	lastSelectedObject.rotation.z = Number(zRot) * (Math.PI / 180);
	updateRoomsObjectVals(lastSelectedObject)
});

//Scale
const insScaleX = document.getElementById("sclX");
const insScaleY = document.getElementById("sclY");
const insScaleZ = document.getElementById("sclZ");

insScaleX?.addEventListener("input", (event) => {
	const xScale = (document.getElementById("sclX")).value;
	lastSelectedObject.scale.x = Number(xScale);
	updateRoomsObjectVals(lastSelectedObject)
});
insScaleY?.addEventListener("input", (event) => {
	const yScale = (document.getElementById("sclY")).value;
	lastSelectedObject.scale.y = Number(yScale);
	updateRoomsObjectVals(lastSelectedObject)
});
insScaleZ?.addEventListener("input", (event) => {
	const zScale = (document.getElementById("sclZ")).value;
	lastSelectedObject.scale.z = Number(zScale);
	updateRoomsObjectVals(lastSelectedObject)
});

//Delete an Object
const deleteBtn = document.getElementById("TrashBtn");
deleteBtn?.addEventListener("click", (event) => {
	console.log(lastSelectedObject.name);
	let InspectorDiv = document.getElementById('InspectorDiv')
	if (InspectorDiv != null) InspectorDiv.style.display = "none";
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
	if (!isInspectorActive()) {
		tControls.detach()
	}
	requestAnimationFrame(animate);
}

setupLights()

function setupLights() {
	let lights = new THREE.Group()
	lights.name = "lights"

	// ambient light
	let hemiLight = new THREE.AmbientLight(0xffffff, 0.7);
	lights.add(hemiLight);

	//Add directional light
	let dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
	dirLight.position.set(-30, 50, -30);
	lights.add(dirLight);
	dirLight.castShadow = true;
	dirLight.shadow.mapSize.width = 2048;
	dirLight.shadow.mapSize.height = 2048;
	dirLight.shadow.camera.left = -70;
	dirLight.shadow.camera.right = 70;
	dirLight.shadow.camera.top = 70;
	dirLight.shadow.camera.bottom = -70;

	scene.add(lights)
}

animate()

//Activate Features
let disabled = new Disabled()

//Play
let PlayBtn = document.getElementById("playArrow");
if (PlayBtn != null) PlayBtn.addEventListener("click", (e) => playScene());

//Pause
//let PauseBtn = document.getElementById("PauseBtn");
//if (PauseBtn != null) PauseBtn.addEventListener("click", (e: Event) => featureDisabled());

//Stop
let StopBtn = document.getElementById("pauseArrow");
if (StopBtn != null) StopBtn.addEventListener("click", (e) => stopScene());

/* First Person POV */
function playScene() {
	OrbitalControls.enabled = false;
	dControls.enabled = false;
	FPControls.enabled = true;
	camera.position.set(0, 1, 3);
	FPControls.lookSpeed = 0.001;

	let InspectorDiv = document.getElementById('InspectorDiv')
	if (InspectorDiv != null) InspectorDiv.style.display = "none";
	let RightSideDiv = document.getElementById('RightSideDiv')
	if (RightSideDiv != null) RightSideDiv.style.display = "none";
	let TopBar = document.getElementById('TopBar')
	if (TopBar != null) TopBar.style.display = "none";

	let TopBarPlaying = document.getElementById('TopBarPlaying')
	if (TopBarPlaying != null) TopBarPlaying.style.display = "flex";
}

function stopScene() {
	FPControls.enabled = false;
	dControls.enabled = true;
	OrbitalControls.enabled = true;
	camera.position.set(-35, 70, 100);
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	let InspectorDiv = document.getElementById('InspectorDiv')
	if (InspectorDiv != null) InspectorDiv.style.display = "block";
	let RightSideDiv = document.getElementById('RightSideDiv')
	if (RightSideDiv != null) RightSideDiv.style.display = "block";
	let TopBar = document.getElementById('TopBar')
	if (TopBar != null) TopBar.style.display = "flex";

	let TopBarPlaying = document.getElementById('TopBarPlaying')
	if (TopBarPlaying != null) TopBarPlaying.style.display = "none";
}




//Add buttons for all the objects
const objectSelectionMenu = document.getElementById("objectSelection")

let objectCards = []
let originalCards = document.getElementsByClassName('objectButton')
for (let i = 0; i < originalCards.length; i++) {
	objectCards.push(originalCards[i])
}

const objectSearchInput = document.getElementById("ObjectSearchInput")

objectSearchInput.addEventListener("input", (e) => {
	const value = e.target.value
})

objectSearchInput.addEventListener("input", e => {
	const value = e.target.value.toLowerCase()
	objectCards.forEach(temp => {
		const isVisible = temp.innerText.toLowerCase().includes(value)
		temp.classList.toggle("hide", !isVisible)
	})
})

let sceneObjects = []
let allSceneObjects = document.getElementsByClassName("objectListButton")

export function updateAllSceneObjects() {
	allSceneObjects = document.getElementsByClassName("objectListButton")
	sceneObjects = []
	for (let i = 0; i < allSceneObjects.length; i++) {
		sceneObjects.push(allSceneObjects[i])
	}
}

updateAllSceneObjects()

const sceneSearchInput = document.getElementById("SceneSearchInput")

sceneSearchInput.addEventListener("input", (e) => {
	const value = e.target.value
})

sceneSearchInput.addEventListener("input", e => {
	const value = e.target.value.toLowerCase()
	sceneObjects.forEach(temp => {
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

const SkyBoxBtn = document.getElementById("SkyBoxBtn")
SkyBoxBtn.addEventListener("click", function () {
	let SkyBoxPrompt = document.getElementById("InspectorSkyBoxColor")
	horizonGenerateIMG(SkyBoxPrompt)
})

function createAIObject() {
	console.log("starting some shit")
	//scene.add(galactusGenerateGLB("red car"));
	galactusGenerateGLB("red car")
	console.log("finishing some shit")

	//Once it makes the object I want to store it into a button
}

export function galactusGenerateGLB(prompt) {
	console.log("Sending fetch to Server")
	return fetch(window.location.protocol + "/3D", {
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
	return fetch(window.location.protocol + "/SkyBox", {
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
			//console.log(data.images[0])
			var image = new Image();
			image.src = 'data:image/png;base64,' + data.images[0];
			const texture = new THREE.TextureLoader().load(image.src, function (texture) {
				const geometry = new THREE.SphereGeometry(1000, 32, 16);
				const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
				material.map = texture
				material.side = THREE.BackSide
				const sphere = new THREE.Mesh(geometry, material);
				let pos = { x: 0, y: 0, z: 0 }
				sphere.name = "Skybox"
				sphere.userData.draggable = false
				spawnObject(sphere.toJSON(), true)
				//scene.add(sphere)
				//scene.background = texture;
			})
		}
	)
}

export function getSceneObjects() {
	const SceneViewList = document.getElementById("SceneList")
	SceneViewList.innerHTML = ""
	scene.traverse(function (object) {
		if (object.userData.name == undefined) return;
		if (object.isMesh) {
			var shapeBtn = document.createElement("button")
			shapeBtn.classList.add("objectListButton")
			shapeBtn.id = object.name
			shapeBtn.innerHTML = "<span class='material-symbols-outlined'>deployed_code</span><p>" + object.userData.name + "</p>"
			shapeBtn.onclick = function () {
				activateInspector()
				draggingEvent(object)
			}
			SceneViewList.appendChild(shapeBtn)
		}
	});
	updateAllSceneObjects()
}

function getLastSelectedObject() {
	return lastSelectedObject.userData.name
}

//Top Bar Event Listeners and page changers
const CollectionsBtn = document.getElementById("CollectionsBtn");
const ScenesListBtn = document.getElementById("SceneListBtn")

const CollectionsElement = document.getElementById("ObjectSelectorWindow")
const ScenesListElement = document.getElementById("SceneListViewWindow")

CollectionsBtn?.addEventListener("click", (event) => {
	CollectionsElement.style.display = "block"
	CollectionsBtn.classList.add("highlight")
	ScenesListElement.style.display = "none"
	ScenesListBtn.classList.remove("highlight")
});

ScenesListBtn?.addEventListener("click", (event) => {
	CollectionsElement.style.display = "none"
	CollectionsBtn.classList.remove("highlight")
	ScenesListElement.style.display = "block"
	ScenesListBtn.classList.add("highlight")
});

const DragControlsBtn = document.getElementById("DragControlsBtn")
const TransformControlsBtn = document.getElementById("TransformControlsBtn");

const ObjectToolsBox = document.getElementById("ObjectToolsBox")


//Drag / Transform Controls
DragControlsBtn?.addEventListener("click", (event) => {
	ObjectToolsBox.style.display = "none"
	TransformControlsBtn.classList.remove("highlight")
	DragControlsBtn.classList.add("highlight")

	dControls.enabled = true;
	tControls.detach()
	scene.remove(tControls)
});

TransformControlsBtn?.addEventListener("click", (event) => {
	ObjectToolsBox.style.display = "flex"
	DragControlsBtn.classList.remove("highlight")
	TransformControlsBtn.classList.add("highlight")

	dControls.enabled = false
	scene.add(tControls)
});

// Transform Control Modes
const TControlPos = document.getElementById("TControlPos")
const TControlScale = document.getElementById("TControlScale")
const TControlRot = document.getElementById("TControlRot")

TControlPos?.addEventListener("click", (event) => {
	TControlPos.classList.add("highlight")
	TControlScale.classList.remove("highlight")
	TControlRot.classList.remove("highlight")

	tControls.setMode("translate")
})

TControlScale?.addEventListener("click", (event) => {
	TControlPos.classList.remove("highlight")
	TControlScale.classList.add("highlight")
	TControlRot.classList.remove("highlight")

	tControls.setMode("scale")
})

TControlRot?.addEventListener("click", (event) => {
	TControlPos.classList.remove("highlight")
	TControlScale.classList.remove("highlight")
	TControlRot.classList.add("highlight")

	tControls.setMode("rotate")
})

const shareBtn = document.getElementById("ShareBtn")
shareBtn?.addEventListener("click", (e) => {
	var dummy = document.createElement('input'),
		text = window.location.href;

	document.body.appendChild(dummy);
	dummy.value = text;
	dummy.select();
	document.execCommand('copy');
	document.body.removeChild(dummy);

	alert("Share link copied to your clipboard :) \nShare Link: " + text);
})

const FeedbackBtn = document.getElementById("Feedback")
FeedbackBtn?.addEventListener("click", (e) => {
	alert("We appreciate all feedback and would love to talk to our users! Please reach out to our email Contact@Pixelz.gg");
})

const ExportBtn = document.getElementById("ExportBtn")
ExportBtn?.addEventListener("click", (e) => {
	alert("Exporting 3D Models will be coming soon!");
})

const CodeBtn = document.getElementById("CodeBtn")
CodeBtn?.addEventListener("click", (e) => {
	alert("Coding will be coming soon!");
})

const TerrainBtn = document.getElementById("TerrainBtn")
TerrainBtn?.addEventListener("click", (e) => {
	alert("Terrain building will be coming soon!");
})


const InspectorObjectColor = document.getElementById("InspectorObjectColor")
InspectorObjectColor?.addEventListener("input", (e) => {
	let trailing = "0".repeat(6 - InspectorObjectColor.value.length)
	lastSelectedObject.material.color.set(new THREE.Color(parseInt("0x" + InspectorObjectColor.value + trailing)));
	document.getElementById("InspectorObjectColorBox").style.backgroundColor = "#" + InspectorObjectColor.value + trailing;
	updateRoomsObjectVals(lastSelectedObject)
})

const addObjectBtn = document.getElementById("addObjectBtn")
const addMenu = document.getElementById("AddObjectsMenu")
addObjectBtn?.addEventListener("click", (e) => {
	if (addMenu.style.display == "none") addMenu.style.display = "block"
	else if (addMenu.style.display == "block") addMenu.style.display = "none"
})

const initAIChat = document.getElementById("ObjectCreationMenu")
const AIChatBtn = document.getElementById("AIChatBtn")
AIChatBtn?.addEventListener("click", (e) => {
	initAIChat.style.display = "flex";
	let TopBar = document.getElementById('ScenePlayerMenu')
	if (TopBar != null) TopBar.style.display = "none";
})

const AIChatBackBtn = document.getElementById("AIChatBackBtn")
const ObjectCreationList = document.getElementById("ObjectCreationList")

AIChatBackBtn?.addEventListener("click", (e) => {
	initAIChat.style.display = "none";
	ObjectCreationList.style.display = "none"
	let TopBar = document.getElementById('ScenePlayerMenu')
	if (TopBar != null) TopBar.style.display = "flex";
})

const AIChatSubmitBtn = document.getElementById("AIChatSubmitBtn")
AIChatSubmitBtn?.addEventListener("click", (e) => {
	ObjectCreationList.style.display = "block"
	document.getElementById("generateText").innerText = "Generating Suggestions..."

	const message = document.getElementById('message')

	e.preventDefault()
	const messageText = message.value
	message.value = ''
	fetch(window.location.protocol + '/ChatAssist', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			message: messageText
		})
	})
		.then(res => res.json())
		.then(data => {
			chatParser(data.completion.content)
		})
})

function chatParser(prompt) {
	console.log("here is prompt reply by ChatGPT: \n" + prompt)
	setupObjects(prompt)
}

function setupObjects(prompt) {
	var listOfObjects = []
	var objectNumberIndex = prompt.indexOf("#", 0)
	while (-1 < objectNumberIndex) {
		console.log("loop started")
		var nextIndex = prompt.indexOf("#", objectNumberIndex + 1)
		if (nextIndex < 0) nextIndex = prompt.length + 1
		var item = prompt.substring(objectNumberIndex + 1, nextIndex - 1)
		listOfObjects.push(item)
		objectNumberIndex = prompt.indexOf("#", objectNumberIndex + 1)
		console.log("loop completed")
	}

	console.log(listOfObjects)
	setupUIforGPT(listOfObjects)
	//showObjectsInScene(listOfObjects)
}

const generativeTextList = document.getElementById("generativeTextList")
function setupUIforGPT(listOfObjects) {
	document.getElementById("generateText").innerText = "Generate 3D Objects"
	for (let i = 0; i < listOfObjects.length; i++) {
		var item = document.createElement("div")
		item.id = listOfObjects[i]
		item.classList.add("objectCreationItem")
		item.innerHTML = "<button class='playerButtons' onclick='this.parentElement.remove()'><span class='material-icons'>delete</span></button><div class='objectCreationItemBackground'><input type='text' id='InspectorSkyBoxColor' name='fname' value='" + listOfObjects[i] + "' class='textInput objectCreationItemTitle'></div>"
		generativeTextList.appendChild(item)
	}
}

const objectCreationAddition = document.getElementById("objectCreationAddition")
objectCreationAddition?.addEventListener("click", (e) => {
	var item = document.createElement("div")
	item.id = item
	item.classList.add("objectCreationItem")
	item.innerHTML = "<button class='playerButtons' onclick='this.parentElement.remove()'><span class='material-icons'>delete</span></button><div class='objectCreationItemBackground'><input type='text' id='InspectorSkyBoxColor' name='fname' value='New Object' class='textInput objectCreationItemTitle'></div>"
	generativeTextList.appendChild(item)
})

//callMake3D("spongebob")
async function callMake3D(prompt) {
	console.log("Sending fetch to Server")
	return fetch(window.location.protocol + "/3D", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			prompt,
		})
	}).then(
		async (response) => {
			let words = await response.json()
			console.log(words)
			return words
		}
	)
}
addToCollection(["https://pbxt.replicate.delivery/allH5x4uUt4GBxF0KoMzlBeB3qOOf3Z6KqQvxHVClZwDtatRA/out_0.gif",
"https://pbxt.replicate.delivery/afxcImfNsxqEG0OTeTV3m4EDYhfOHAgh6nli8074INOT0q1GB/mesh_0.obj"])
function addToCollection(content) {
	let objectCard = document.createElement("button")
	objectCard.classList.add("objectButton")
	objectCard.onclick = async function() {
		socket.emit("spawnJSON", content, myRoomValues)
		//spawnObject(shit, false);
	}
	//<img src=" + imgSrc + "/>
	objectCard.innerHTML = "<img style='height: 100%; width: 100%;' unselectable='on' src='" + content[0] + "'/>"
	objectSelectionMenu.appendChild(objectCard)
}

async function generateObj(modelSrc, uuid) {
	const objLoader = new OBJLoader()
    const obj = await objLoader.loadAsync(
        //await callMake3D(prompt),
        modelSrc[1],
    )

	const objMesh = obj.children[0]
    //console.log(obj)
    objMesh.name = uuid
	objMesh.userData.name = "3D Object"
    objMesh.position.set(0, 2, 0);
    //obj.rotation.x = -90 * (Math.PI / 180)
    objMesh.scale.set(objMesh.scale.x * 10, objMesh.scale.y * 10, objMesh.scale.z * 10)
	objMesh.uuid = uuid
	objMesh.userData.draggable = true
	objMesh.userData.tag = "3DAI"
	objMesh.userData.src = [modelSrc[0], modelSrc[1]]
	objects.add(objMesh)
}

let generateAIModelsBtn = document.getElementById("generateAIModelsBtn")
generateAIModelsBtn?.addEventListener("click", async (e) => {
	initAIChat.style.display = "none";
	let TopBar = document.getElementById('ScenePlayerMenu')
	if (TopBar != null) TopBar.style.display = "flex";

	let listOfObjects = document.getElementsByClassName("objectCreationItemTitle")
	ObjectCreationList.style.display = "none"
	//console.log(listOfObjects)
	
	let contentList = []

	for(let i = 0; i < listOfObjects.length; i++) {
		let content = callMake3D(listOfObjects[i].value)
		contentList.push(content)
	}

	for(let i = 0; i < contentList.length; i++){
		addToCollection(await contentList[i])
	}
})