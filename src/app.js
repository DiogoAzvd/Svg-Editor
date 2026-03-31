import { SvgWrapper } from "./modules/svg-wrapper/SvgWrapper.js";

function main() {
    class App {
        constructor() {
            this.svgWrapper = new SvgWrapper();
        }
    }

    const app = new App();
}

main();