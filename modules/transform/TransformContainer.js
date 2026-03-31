export class TransformContainer {
    constructor(contentString) {
        this.containerElement = document.querySelector("#transform-container");

        this.dataElements = [];
        this.dataElementTexts = [];

        this.baseText = "";
        this.selectedIndex;

        this.init(contentString);
    }

    init(contentString) {
        this.containerElement.innerHTML = contentString;
        this.dataElements = document.querySelectorAll(".transform-data");

        this.dataElements.forEach((element, index) => {
            this.dataElementTexts[index] = "";
        });

        this.selectedIndex = this.dataElements.length > 1 ? -1 : 0;
    }

    get currentText() {
        if (this.selectedIndex === -1) {
            return this.baseText;
        }

        return this.dataElementTexts[this.selectedIndex];
    }

    set currentText(text) {
        if (this.selectedIndex === -1) {
            this.baseText = text;

            for (let i = 0; i < this.dataElements.length; i++) {
                if (!this.dataElements[i].classList.contains("disabled")) {
                    this.dataElementTexts[i] = text;
                }
            }
            return;
        }

        this.dataElementTexts[this.selectedIndex] = text;
    }

    update(dataArray) {
        dataArray.forEach((data, index) => {
            this.dataElements[index].textContent = data;
        });
    }

    selectNext() {
        if (this.dataElements.length < 2) return;

        this.dataElements.forEach((element) => {
            element.classList.remove("selected");
        });

        do {
            this.selectedIndex = (this.selectedIndex + 1) % this.dataElements.length;
        }
        while (this.dataElements[this.selectedIndex].classList.contains("disabled"));

        this.dataElements[this.selectedIndex].classList.add("selected");
    }

    selectAll() {
        this.dataElements.forEach((element) => {
            if (!element.classList.contains("disabled")) {
                element.classList.add("selected");
            }
        });
    }

    disable(index) {
        if (this.dataElements.length < 2) return;

        const element = this.dataElements[index];
        const isDisabled = element.classList.contains("disabled");
        const isSelected = element.classList.contains("selected");

        if (isDisabled) {
            element.classList.remove("disabled");
        }

        else {
            const disabledElement = this.containerElement.querySelector(".disabled");
            if (disabledElement) disabledElement.classList.remove("disabled");
            element.classList.add("disabled");
        }

        if (isSelected) {
            this.selectNext();
        }
    }

    keydown(e, eventData) {
        const key = e.key.toUpperCase();

        switch (key) {
            case "TAB":
                e.preventDefault();
                if (this.dataElements.length < 2) return;
                this.selectNext();
                break;

            case "BACKSPACE":
                this.currentText = this.currentText.slice(0, -1);
                break;
            
            case "DELETE":
                this.currentText = "";
                break;

            case "-":
                this.currentText = this.currentText[0] === "-" ? this.currentText.slice(1) : "-" + this.currentText;
                break;
            
            case ".":
                if (!this.currentText.includes(".")) this.currentText += ".";
                break;

            default:
                if (/[\d]/.test(key) && key.length === 1) this.currentText += key;
        }
    }
}