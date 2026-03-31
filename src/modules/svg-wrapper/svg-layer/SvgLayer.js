import { Path } from "../../path/Path.js";
import { Transform } from "../../transform/Transform.js";

export class SvgLayer {
    constructor(wrapper, x, y, width, height) {
        this.viewBox = {x, y, width, height};
        this.baseSize = {width, height}

        this.svg = SvgLayer.create(wrapper, this.viewBox);

        this.grid = false;
        this.tileSize = 1;

        this.paths = [];
        // Allows access from DOM element to Path Class
        this.pathMap = new WeakMap();

        this.panning = false;
        this.panStartPoint = {x: 0, y: 0};
    
        this.zoom(+1);
    }

    static create(wrapper, viewBox, tileSize = 1) {
        const viewBoxString = Object.values(viewBox).join(" ");

        const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" class="svg-layer" viewBox="${viewBoxString}" data-scale="1" data-grid="true" data-tile-size="${tileSize}">
                <defs>
                    <pattern id="grid-pattern" x="0" y="0" width="${tileSize}" height="${tileSize}" patternUnits="userSpaceOnUse">
                        <rect class="grid-tile" x="0" y="0" width="${tileSize}" height="${tileSize}"></rect>
                    </pattern>
                </defs>

                <rect class="grid" fill="url(#grid-pattern)" x="0" y="0"></rect>
                <rect class="base-rect" x="0" y="0" width="${viewBox.width}" height="${viewBox.height}"></rect>
            </svg>
        `;

        wrapper.insertAdjacentHTML("beforeend", svgString);
        const svg = wrapper.querySelector("svg:last-child");
        return svg;
    }

    snapPoint(point) {
        return {
            x: Math.round(point.x / this.tileSize) * this.tileSize,
            y: Math.round(point.y / this.tileSize) * this.tileSize,
        }
    }

    getPoint(e) {
        const point = new DOMPoint(e.x, e.y).matrixTransform( this.svg.getScreenCTM().inverse() );
        return {x: point.x, y: point.y}
    }

    setViewBox(newViewBox) {
        this.viewBox = {...newViewBox};
        this.svg.setAttribute("viewBox", Object.values(this.viewBox).join(" "));
    }

    updateGrid() {
        const layerRect = this.svg.getBoundingClientRect();

        const proportionWidth = layerRect.width / this.viewBox.width;
        const proportionHeight = layerRect.height / this.viewBox.height;

        const gridRect = {
            x: this.viewBox.x,
            y: this.viewBox.y,
            width: this.viewBox.width,
            height: this.viewBox.height
        }

        // If the viewport and viewbox proportions aren't equal, the viewBox value will not match its visual size due
        // to the aspect-ratio calculation, therefore, it should be resized.

        if (proportionWidth > proportionHeight) {
            gridRect.width *= proportionWidth / proportionHeight;
            gridRect.x -= (gridRect.width - this.viewBox.width) / 2;
        }

        else if (proportionHeight > proportionWidth) {
            gridRect.height *= proportionHeight / proportionWidth;
            gridRect.y -= (gridRect.height - this.viewBox.height) / 2;
        }

        const grid = this.svg.querySelector(".grid");

        Object.entries(gridRect).forEach(([key, value]) => {
            grid.setAttribute(key, value);
        });
    }

    zoom(e) {
        const scaleFactor = e.deltaY < 0 ? 1 / 1.1 : 1.1;
        
        const newViewBox = {...this.viewBox};

        newViewBox.width = this.viewBox.width * scaleFactor;
        newViewBox.height = this.viewBox.height * scaleFactor;

        newViewBox.x += (this.viewBox.width - newViewBox.width) / 2;
        newViewBox.y += (this.viewBox.height - newViewBox.height) / 2;

        this.setViewBox(newViewBox);
        this.updateGrid();
    }

    panMousedown(e) {
        if (e.button !== 1) return;
        e.preventDefault();
        this.panning = true;
        this.panStartPoint = this.getPoint(e);
        this.svg.style.cursor = "grab";
    }

    panMouseup(e) {
        if (!this.panning) return;
        this.panning = false;
        this.svg.style.cursor = "auto";
    }

    panMousemove(e) {
        if (!this.panning) return;
        const endPoint = this.getPoint(e);

        const newViewBox = {...this.viewBox};

        newViewBox.x -= endPoint.x - this.panStartPoint.x;
        newViewBox.y -= endPoint.y - this.panStartPoint.y;

        this.setViewBox(newViewBox);
        this.updateGrid();
    }

    importElement(pathElement) {
        const path = new Path(this.svg, pathElement);
        const bbox = path.element.getBBox(); 
        
        const largerSideName = bbox.width === bbox.height ? null :
        bbox.width > bbox.height ? "width" : "height";

        if (largerSideName) {
            if (bbox[largerSideName] > this.baseSize[largerSideName]) {
                const scale = .95 * (this.baseSize[largerSideName] / bbox[largerSideName]);
                Transform.scale(path.element, scale, scale);
                Path.applyTransformation(path, true);  
            }
        }        
        
        Transform.center(path.element, this.baseSize);
        Path.applyTransformation(path);

        path.element.classList.add("svg-element"); 
        path.element.classList.add("editing"); 
        this.svg.appendChild(path.element);

        this.paths.push(path);
        this.pathMap.set(path.element, path);
    }

    getCenterOfViewBox() {
        return {
            x: this.viewBox.x + this.viewBox.width / 2,
            y: this.viewBox.y + this.viewBox.height / 2,
        }
    }
}