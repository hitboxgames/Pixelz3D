class Disabled {
    constructor() {
        this.enableListeners()
    }

    featureDisabled() {
        alert("Feature is coming soon.");
    }

    shareButton() {
        alert("Proper Sharing Coming soon! For now export your world and have others import it on their devices");
    }

    enableListeners() {
        //Share Button
        let ShareBtn = document.getElementById("ShareBtn");
        if (ShareBtn != null) ShareBtn.addEventListener("click", (e) => this.shareButton());

        //Shape Selector
        let ShapeSelectorBtn = document.getElementById("ShapeSelectorBtn");
        if (ShapeSelectorBtn != null) ShapeSelectorBtn.addEventListener("click", (e) => this.featureDisabled());

        //Search
        let SearchBtn = document.getElementById("SearchBtn");
        if (SearchBtn != null) SearchBtn.addEventListener("click", (e) => this.featureDisabled());

        //Undo
        let UndoBtn = document.getElementById("UndoBtn");
        if (UndoBtn != null) UndoBtn.addEventListener("click", (e) => this.featureDisabled());

        //Redo
        let RedoBtn = document.getElementById("RedoBtn");
        if (RedoBtn != null) RedoBtn.addEventListener("click", (e) => this.featureDisabled());

        //Login
        let LoginBtn = document.getElementById("LoginBtn");
        if (LoginBtn != null) LoginBtn.addEventListener("click", (e) => this.featureDisabled());

        //Sign Up
        let SignUpBtn = document.getElementById("SignUpBtn");
        if (SignUpBtn != null) SignUpBtn.addEventListener("click", (e) => this.featureDisabled());
    }
}

export { Disabled };