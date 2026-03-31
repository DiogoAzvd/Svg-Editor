import { Command } from "./Command.js";

const PRIVATE_KEY = Symbol("placeholder");

export class Arc extends Command {
    constructor(key, rx, ry, rotation, lFlag, sFlag, x, y) {
        if (key !== PRIVATE_KEY) {
            throw new Error("placeholder");
        }

        super();

        this.type = "A",
        this.rx = rx;
        this.ry = ry;
        this.rotation = rotation;
        this.lFlag = lFlag;
        this.sFlag = sFlag;
        this.x = x;
        this.y = y;
    }

    static create(commandArray) {
        const [rx, ry, rotation, lFlag, sFlag, x, y] = commandArray;
        return new Arc(PRIVATE_KEY, rx, ry, rotation, lFlag, sFlag, x, y);
    }

    static createByEvent({endPoint}) {
        // Some calculation to predict the rest or init value
        return new Arc(PRIVATE_KEY, 1, 1, 0, 0, 0, endPoint.x, endPoint.y);
    }    
}