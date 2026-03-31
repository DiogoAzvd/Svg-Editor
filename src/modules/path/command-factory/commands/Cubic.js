import { Command } from "./Command.js";

const PRIVATE_KEY = Symbol("placeholder");

export class Cubic extends Command {
    constructor(key, x2, y2, x1, y1, x, y) {
        if (key !== PRIVATE_KEY) {
            throw new Error("placeholder");
        }

        super();

        this.type = "C";
        this.x2 = x2;
        this.y2 = y2;
        this.x1 = x1;
        this.y1 = y1;
        this.x = x;
        this.y = y;
    }

    get xy2() {
        return {
            x: this.x2,
            y: this.y2
        }
    }

    set xy2(point) {
        this.x2 = point.x;
        this.y2 = point.y
    }

    get xy1() {
        return {
            x: this.x1,
            y: this.y1
        }
    }

    set xy1(point) {
        this.x1 = point.x;
        this.y1 = point.y;
    }
    

    get points() {
        return {
            xy2: this.xy2,
            xy1: this.xy1,
            xy: this.xy
        };
    }

    static create(commandArray) {
        const [x1, y1, x2, y2, x, y] = commandArray;
        return new Cubic(PRIVATE_KEY, x1, y1, x2, y2, x, y);
    }

    static createByEvent({endPoint, startingPoint}) {
        // Some calculation to predict x1,y1 and x2,y2
        const offset = {
            x: endPoint.x - startingPoint.x,
            y: endPoint.y - startingPoint.y
        }

        const x2 = endPoint.x - offset.x * 3  / 4;
        const y2 = endPoint.y - offset.y * 3 / 4;
        const x1 = endPoint.x - offset.x / 4;
        const y1 = endPoint.y - offset.y / 4;
        

        return new Cubic(PRIVATE_KEY, x2, y2, x1, y1, endPoint.x, endPoint.y);
    }    
}