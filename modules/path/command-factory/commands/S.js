import { Command } from "./Command.js";

const PRIVATE_KEY = Symbol("placeholder");

export class S extends Command {
    constructor(key, x1, y1, x, y) {
        if (key !== PRIVATE_KEY) {
            throw new Error("placeholder");
        }

        super();

        this.type = "S",
        this.x1 = x1;
        this.y1 = y1;
        this.x = x;
        this.y = y;
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
            xy1: this.xy1,
            xy: this.xy
        };
    }

    static create(commandArray) {
        const [x1, y1, x, y] = commandArray;
        return new S(PRIVATE_KEY, x1, y1, x, y)
    }

    static createByEvent({endPoint, startingPoint}) {
        const offset = {
            x: endPoint.x - startingPoint.x,
            y: endPoint.y - startingPoint.y
        }

        const x1 = endPoint.x - offset.x / 4;
        const y1 = endPoint.y - offset.y / 4;

        return new S(PRIVATE_KEY, x1, y1, endPoint.x, endPoint.y);
    }    
}