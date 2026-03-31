import { Command } from "./Command.js";

const PRIVATE_KEY = Symbol("placeholder");

export class Z extends Command {
    constructor(key, x, y) {
        if (key !== PRIVATE_KEY) {
            throw new Error("placeholder");
        }

        super();

        this.type = "Z";
        this.x = x;
        this.y = y;
    }

    parse() {
        return "Z";
    }

    static create(commandArray) {
        const [x, y] = commandArray;
        return new Z(PRIVATE_KEY, x, y)
    }

    static createByEvent({endPoint}) {
        return new Z(PRIVATE_KEY, endPoint.x, endPoint.y);
    }
}