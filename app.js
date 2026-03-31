import { SvgWrapper } from "./modules/svg-wrapper/SvgWrapper.js";

function main() {
    class App {
        constructor() {
            this.svgWrapper = new SvgWrapper();
        }
    }

    const app = new App();

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 7.2 13.5 L 7.2 5.5 L 6.4 5.5 L 8 2.5 L 9.6 5.5 L 8.8 5.5 L 8.8 13.5 Z");
    path.setAttribute("fill", "#000000");
    path.classList.add("element", "svg-element", "editing");

    app.svgWrapper.layer.importElement(path);
}

main();
