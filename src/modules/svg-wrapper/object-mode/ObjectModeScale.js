import { Transform } from "../../transform/Transform.js";
import { Path } from "../../path/Path.js";
import { getDistance, createReferencePoint, createReferenceLine } from "./ObjectModeUtils.js";
import { TransformContainer } from "../../transform/TransformContainer.js";

export class ObjectModeScale {
    constructor(setCurrentTransformation, selectedPaths, startPoint, centerPoint, svg) {
        this.selectedPaths = selectedPaths;
        this.setCurrentTransformation = setCurrentTransformation;
        this.centerPoint = centerPoint;

        // distanceB / distanceA | For mousemove mode
        this.scaleFactor = 1;
        this.distanceA = getDistance(startPoint, centerPoint);
        this.distanceB = 0; // Current Point and Center Point

        this.currentPointReference = createReferencePoint(startPoint, svg);
        this.centerPointReference = createReferencePoint(centerPoint, svg);
        this.lineReference = createReferenceLine(startPoint, centerPoint, svg);

        this.mode = "mousemove";
        this.lockAxis = "";
       
        const contentString = `
            Scale: (<span class="transform-data">1.0000</span>, <span class="transform-data">1.0000</span>)
        `;

        this.transformContainer = new TransformContainer(contentString);
    }

    click() {
        this.apply();
        this.dispose();
        this.setCurrentTransformation();
    }

    mousemove({mousePosition}) {
        if (this.mode !== "mousemove") return;
        this.distanceB = getDistance(mousePosition, this.centerPoint);
        this.scaleFactor = this.distanceB / this.distanceA;

        this.lineReference.setAttribute("x1", mousePosition.x);
        this.lineReference.setAttribute("y1", mousePosition.y);
        this.currentPointReference.setAttribute("cx", mousePosition.x);
        this.currentPointReference.setAttribute("cy", mousePosition.y); 

        this.scale();
    }

    keydown(e, eventData) {
        const key = e.key.toUpperCase();

        switch (key) {
            case "X":
                this.lockAxis = this.lockAxis === "X" ? "" : "X";
                this.transformContainer.disable(1);
                this.scale();
                return;

            case "Y":
                this.lockAxis = this.lockAxis === "Y" ? "" : "Y";
                this.transformContainer.disable(0);
                this.scale();
                return;

            case "ENTER":
                e.preventDefault();
                this.apply();
                this.dispose();
                this.setCurrentTransformation();

            case "ESCAPE":
                this.dispose();
                this.setCurrentTransformation();
                return;
        }

        const validChars = /[.0-9-]/;

        switch (this.mode) {
            case "mousemove":
                if (validChars.test(key) && key.length === 1) {
                    this.mode = "keydown";
                    this.clearReferences();
                    this.transformContainer.selectAll();
                    this.transformContainer.keydown(e, eventData);
                    this.scale();
                }
                break;

            case "keydown":
                this.transformContainer.keydown(e, eventData);
                this.scale();
                break;
        }
    }

    scale() {
        switch (this.mode) {
            case "mousemove": {
                const scaleX = this.lockAxis === "Y" ? 1 : this.scaleFactor;
                const scaleY = this.lockAxis === "X" ? 1 : this.scaleFactor;

                this.transform(scaleX, scaleY);
                this.transformContainer.update([scaleX.toFixed(4), scaleY.toFixed(4)]);
            } break;

            case "keydown": {
                const scaleX = parseFloat(this.lockAxis === "Y" ? 1 : this.transformContainer.dataElementTexts[0]);
                const scaleY = parseFloat(this.lockAxis === "X" ? 1 : this.transformContainer.dataElementTexts[1]);

                if (scaleX && scaleY) {
                    this.transform(scaleX, scaleY);
                }

                this.transformContainer.update([this.lockAxis === "Y" ? 1 : this.transformContainer.dataElementTexts[0], this.lockAxis === "X" ? 1 : this.transformContainer.dataElementTexts[1]]);
            } break;
        }
    }

    transform(scaleX, scaleY) {
        this.selectedPaths.forEach((path) => {
            Transform.clear(path.element);
            Transform.scaleCenter(path.element, scaleX, scaleY);
        });
    }

    apply() {
        this.selectedPaths.forEach((path) => {
            Path.applyTransformation(path, true);
        });
    }

    clearReferences() {
        this.currentPointReference?.remove();
        this.lineReference?.remove();
        this.centerPointReference?.remove();
    }

    dispose() {
        this.selectedPaths.forEach((path) => {
            Transform.clear(path.element);
        });
        
        this.clearReferences();
        this.transformContainer.containerElement.innerHTML = "";
    }
}