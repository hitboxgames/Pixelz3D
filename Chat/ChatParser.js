import { showObjectsInScene } from "../ThreeJS/renderer.js"

export function chatParser(prompt) {
    console.log("here is prompt reply by ChatGPT: \n" + prompt)
    setupObjects(prompt)
}

function setupObjects(prompt) {
    var listOfObjects = []
    var objectNumberIndex = prompt.indexOf("#", 0)
    while (-1 < objectNumberIndex) {
        console.log("loop started")
        var nextIndex = prompt.indexOf("#", objectNumberIndex + 1)
        if(nextIndex < 0) nextIndex = prompt.length + 1
        var item = prompt.substring(objectNumberIndex + 1, nextIndex - 1)
        listOfObjects.push(item)
        objectNumberIndex = prompt.indexOf("#", objectNumberIndex + 1)
        console.log("loop completed")
    }

    console.log(listOfObjects)
    //showObjectsInScene(listOfObjects)
}