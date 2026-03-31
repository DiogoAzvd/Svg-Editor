import { Transform } from "../../transform/Transform.js";
import { TransformContainer } from "../../transform/TransformContainer.js";
import { Path } from "../../path/Path.js";
import { createReferencePoint, createReferenceLine } from "./ObjectModeUtils.js";

export class ObjectModeRotate {
    constructor(setCurrentTransformation, selectedPaths, startPoint, centerPoint, svg) {
        this.setCurrentTransformation = setCurrentTransformation;
        this.selectedPaths = selectedPaths;
        this.centerPoint = centerPoint;
        this.angle = 0;

        this.centerPointReference = createReferencePoint(centerPoint, svg);
        this.currentPointReference = createReferencePoint(startPoint, svg);
        this.lineReference = createReferenceLine(startPoint, centerPoint, svg);

        this.mode = "mousemove";

        const contentString = `
            Rotate: (<span class="transform-data">0</span>)
        `;

        this.transformContainer = new TransformContainer(contentString);
    }

    click() {
        this.apply();
        this.dispose();
        this.setCurrentTransformation();
    }

    mousemove({previousMousePosition, mousePosition}) {
        if (this.mode !== "mousemove") return;
        this.updateAngle(previousMousePosition, mousePosition);

        this.lineReference.setAttribute("x1", mousePosition.x);
        this.lineReference.setAttribute("y1", mousePosition.y);
        this.currentPointReference.setAttribute("cx", mousePosition.x);
        this.currentPointReference.setAttribute("cy", mousePosition.y);

        this.rotate();
    }

    keydown(e, eventData) {
        const key = e.key.toUpperCase();

        switch (key) {
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
                    this.rotate();
                }
                break;

            case "keydown":
                this.transformContainer.keydown(e, eventData);
                this.rotate();
                break;
        }
    }

    rotate() {
        switch (this.mode) {
            case "mousemove": {
                const angle = parseInt(this.angle);
                this.transform(angle);
                this.transformContainer.update([angle]);
            } break;

            case "keydown": {
                const angle = parseFloat(this.transformContainer.dataElementTexts[0]);

                if (angle) {
                    this.transform(angle);
                }

                this.transformContainer.update([this.transformContainer.dataElementTexts[0]]);
            } break;
        }
    }

    updateAngle(previousMousePosition, mousePosition) {
        const previousAngle = Math.atan2(
            previousMousePosition.y - this.centerPoint.y,
            previousMousePosition.x - this.centerPoint.x
        );

        const currentAngle = Math.atan2(
            mousePosition.y - this.centerPoint.y,
            mousePosition.x - this.centerPoint.x
        );

        this.angle += (currentAngle - previousAngle) * 180 / Math.PI;
    }

    transform(angle) {
        this.selectedPaths.forEach((path) => {
            Transform.clear(path.element);
            Transform.rotate(path.element, angle);
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

    apply() {
        this.selectedPaths.forEach((path) => {
            Path.applyTransformation(path);
        });
    }
}