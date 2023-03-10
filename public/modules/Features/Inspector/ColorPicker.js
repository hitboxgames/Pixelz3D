class ColorPicker{
    object;
    constructor(obj){
        this.object = obj;
        if(this.object != null) this.enableListeners(obj)
    }

    enableListeners(obj){
        let blue = document.getElementById("blue");
        if (blue != null) blue.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0x0000FF);
        });
        
        let red = document.getElementById("red");
        if (red != null) red.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0xFF0000);
        });

        let yellow = document.getElementById("yellow");
        if (yellow != null) yellow.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0xFFFF00);
        });

        let green = document.getElementById("green");
        if (green != null) green.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0x00FF00);
        });

        let orange = document.getElementById("orange");
        if (orange != null) orange.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0xFFA500);
        });

        let pink = document.getElementById("pink");
        if (pink != null) pink.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0xFFC0CB);
        });

        let black = document.getElementById("black");
        if (black != null) black.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0x000000);
        });

        let white = document.getElementById("white");
        if (white != null) white.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0xFFFFFF);
        });

        let peach = document.getElementById("peach");
        if (peach != null) peach.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0xFFE5B4);
        });

        let brown = document.getElementById("brown");
        if (brown != null) brown.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0x964B00);
        });

        let purple = document.getElementById("purple");
        if (purple != null) purple.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0xA020F0);
        });

        let teal = document.getElementById("teal");
        if (teal != null) teal.addEventListener("click", (e) => {
            if(this.object != null) this.object.material.color.set(0x008080);
        });
    }

    disableObject(){
        this.object = null;
    }
}

export { ColorPicker }