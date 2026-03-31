import { Transform } from "../../transform/Transform.js";
import { TransformContainer } from "../../transform/TransformContainer.js";
import { Path } from "../../path/Path.js";

// Not applying translate directly results in a visual bug
// Probably because anti-aliasing, subpixel, transform optmization etc

export class ObjectModeTranslate {
    constructor(setCurrentTransformation, selectedPaths) {
        this.setCurrentTransformation = setCurrentTransformation;
        this.selectedPaths = selectedPaths;

        this.translation = {x: 0, y: 0};

        this.mode = "mousemove";

        const contentString = `
            Translate: (<span class="transform-data">0</span>, <span class="transform-data">0</span>)
        `;

        this.transformContainer = new TransformContainer(contentString);
    }

    click() {
        this.apply();
        this.dispose();
        this.setCurrentTransformation();
    }

    mousemove({mouseMoviment}) {
        this.translation.x += mouseMoviment.x;
        this.translation.y += mouseMoviment.y;
        this.translate();
    }

    keydown(e, eventData) {
        const key = e.key.toUpperCase();

        switch (key) {
            case "X":
                this.lockAxis = this.lockAxis === "X" ? "" : "X";
                this.transformContainer.disable(1);
                this.translate();
                return;

            case "Y":
                this.lockAxis = this.lockAxis === "Y" ? "" : "Y";
                this.transformContainer.disable(0);
                this.translate();
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
                    this.transformContainer.selectAll();
                    this.transformContainer.keydown(e, eventData);
                    this.translate();
                }
                break;

            case "keydown":
                this.transformContainer.keydown(e, eventData);
                this.translate();
                break;
        }
    }

    translate() {
        switch (this.mode) {
            case "mousemove": {
                const x = this.lockAxis === "Y" ? 0 : this.translation.x;
                const y = this.lockAxis === "X" ? 0 : this.translation.y;

                this.transform(x, y);

                this.transformContainer.update([x.toFixed(4), y.toFixed(4)]);
            } break;

            case "keydown": {
                const x = parseFloat(this.lockAxis === "Y" ? 0 : this.transformContainer.dataElementTexts[0]);
                const y = parseFloat(this.lockAxis === "X" ? 0 : this.transformContainer.dataElementTexts[1]);

                if (!isNaN(x) && !isNaN(y)) {
                    this.transform(x, y);
                }

                this.transformContainer.update([this.lockAxis === "Y" ? 0 : this.transformContainer.dataElementTexts[0], this.lockAxis === "X" ? 0 : this.transformContainer.dataElementTexts[1]]);
            } break;
        }
    }

    transform(x, y) {
        this.selectedPaths.forEach((path) => {
            Transform.clear(path.element);
            Transform.translate(path.element, x, y);
        });
    }

    dispose() {
        this.selectedPaths.forEach((path) => {
            Transform.clear(path.element);
        });
        
        this.transformContainer.containerElement.innerHTML = "";
    }

    apply() {
        this.selectedPaths.forEach((path) => {
            Path.applyTransformation(path);
        });
    }
}