import { Command } from "./Command.js";

const PRIVATE_KEY = Symbol("placeholder");

export class T extends Command {
    constructor(key, x, y) {
        if (key !== PRIVATE_KEY) {
            throw new Error("placeholder");
        }

        super();

        this.type = "T",
        this.x = x;
        this.y = y;
    }

    static create(commandArray) {
        const [x, y] = commandArray;
        return new T(PRIVATE_KEY, x, y)
    }

    static createByEvent({endPoint}) {
        return new T(PRIVATE_KEY, endPoint.x, endPoint.y);
    }    
}