import { SvgLayer } from "./svg-layer/SvgLayer.js";
import { ObjectMode } from "./object-mode/ObjectMode.js";

class SvgFileInput {
    constructor(getCurrentLayer) {
        this.getCurrentLayer = getCurrentLayer;

        this.input = document.querySelector("#svg-file");
        this.input.addEventListener("change", this);
    }

    handleEvent(e) {
        switch (e.type) {
            case "change":
                this.parseFile(e);
                break;
        }
    }

    parseFile(e) {
        const files = e.target.files;
    
        for (const file of files) {
            if (file.type === "image/svg+xml") {
                const currentLayer = this.getCurrentLayer();

                const reader = new FileReader();

                reader.onload = () => {
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(reader.result, "image/svg+xml");
                    const svgElement = svgDoc.documentElement;

                    const pathElements = svgElement.querySelectorAll("path");

                    pathElements.forEach((pathElement) => {
                        currentLayer.importElement(pathElement);
                    });
                }

                reader.readAsText(file);
            }

            else {
                alert("Please import a valid File");
            }

            this.input.files = null;
        }
    }
}

export class SvgWrapper {
    constructor() {
        this.element = document.querySelector("#svg-wrapper");
        this.layer = new SvgLayer(this.element, 0, 0, 16, 16);

        this.mousePosition = {x: 0, y: 0};
        this.previousMousePosition = {x: 0, y: 0};
        this.keydownMousePosition = {x: 0, y: 0};

        this.mode = new ObjectMode(this.layer);

        this.svgFileInput = new SvgFileInput(() => this.layer);

        this.init();
    }

    init() {
        const events = ["click", "mousemove", "mousedown", "mouseup", "wheel", "mouseenter",
            "mouseleave"
        ];

        events.forEach((event) => {
            this.element.addEventListener(event, this);
        });

        window.addEventListener("keydown", this);
        window.addEventListener("resize", this);
    }

    handleEvent(e) {
        if (e.currentTarget === this.element) {
            switch (e.type) {
                case "click":
                    this.onClick(e);
                    break;

                case "mousemove":
                    this.onMousemove(e);
                    this.layer.panMousemove(e);
                    break;

                case "mousedown":
                    this.layer.panMousedown(e);
                    break;

                case "mouseup":
                    this.layer.panMouseup(e);
                    break;

                case "wheel":
                    this.layer.zoom(e);
                    break;
            }
        }

        else if (e.currentTarget === window) {
            switch (e.type) {
                case "keydown":
                    this.onKeydown(e)
                    break;

                case "resize":
                    this.layer.updateGrid();
                    break;
            }
        }
    }

    onClick(e) {
        if (!this.mode.click) return;
        this.mode.click(e);
    }

    onMousemove(e) {
        let tempMousePosition = this.layer.getPoint(e);

        const mouseMoviment = {
            x: tempMousePosition.x - this.mousePosition.x,
            y: tempMousePosition.y - this.mousePosition.y
        }

        this.previousMousePosition = {...this.mousePosition};
        this.mousePosition = {...tempMousePosition};        

        if (!this.mode.mousemove) return;

        const eventData = {
            mousePosition: this.mousePosition,
            mouseMoviment,
            previousMousePosition: this.previousMousePosition
        }

        this.mode.mousemove(eventData);
    }

    onKeydown(e) {
        this.keydownMousePosition = {...this.mousePosition};

        // if (e.ctrlKey && key === "Z") {
        //     const canUndo = this.operation?.canUndo;

        //     if (canUndo) {
        //         this.operation.undo();
        //         this.history.undo();
        //     }
        // }

        // else if (e.ctrlKey && key === "Y") {
        //     const canUndo = this.operation?.canUndo;

        //     if (canUndo) {
        //         this.operation.redo();
        //         this.history.redo();
        //     }
        // }

        if (!this.mode.keydown) return;

        const eventData = {
            mousePosition: this.keydownMousePosition
        }

        this.mode.keydown(e, eventData);
    }
}