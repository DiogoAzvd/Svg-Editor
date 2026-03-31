import { ObjectModeTranslate } from "./ObjectModeTranslate.js";
import { ObjectModeRotate } from "./ObjectModeRotate.js";
import { ObjectModeScale } from "./ObjectModeScale.js";

export class ObjectMode {
    constructor(layer) {
        this.layer = layer;
        this.selectedPaths = [];

        this.currentTransformation = "";
    }

    setCurrentTransformation(transformation) {
        this.currentTransformation = transformation || "";
    }

    click(e) {
        if (this.currentTransformation) {
            this.currentTransformation.click(
                this.selectedPaths, this.setCurrentTransformation.bind(this)
            );
        }

        else if (e.target.classList.contains("svg-element")) {
            if (!e.shiftKey) {
                this.clearSelection();
            }

            if (e.ctrlKey) {
                this.select( this.getLastElementFromPoint(e) );
            }

            else {
                this.select(e.target);
            }
        }
    }

    keydown(e, eventData) {
        const key = e.key.toUpperCase();

        if (this.currentTransformation) {
            this.currentTransformation.keydown(e, eventData);
        }

        else {
            switch (key) {
                case "G":
                    this.setCurrentTransformation(new ObjectModeTranslate(this.setCurrentTransformation.bind(this),
                        this.selectedPaths
                    ));
                    break;

                case "S":
                    this.setCurrentTransformation( new ObjectModeScale(this.setCurrentTransformation.bind(this),
                        this.selectedPaths, eventData.mousePosition, this.layer.getCenterOfViewBox(), this.layer.svg) );
                    break;

                case "R":
                    this.setCurrentTransformation(new ObjectModeRotate(this.setCurrentTransformation.bind(this),
                        this.selectedPaths, eventData.mousePosition, this.layer.getCenterOfViewBox(), this.layer.svg));
            }
        }
    }

    mousemove(eventData) {
        if (this.currentTransformation) {
            this.currentTransformation.mousemove(eventData, this.selectedPaths);
        }
    }

    select(element) {
        element.classList.add("selected");
        const path = this.layer.pathMap.get(element);
        this.selectedPaths.push(path);
    }
    
    getLastElementFromPoint(e) {
        const elements = document.elementsFromPoint(e.x, e.y);
        const svgElements = elements.filter(element => element.classList.contains("svg-element"));
        return svgElements.at(-1);
    }

    clearSelection() {
        this.selectedPaths.forEach((path) => {
            path.element.classList.remove("selected");
        });

        this.selectedPaths.length = 0;
    }    
}