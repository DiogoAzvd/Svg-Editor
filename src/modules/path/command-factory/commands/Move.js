import { Command } from "./Command.js";

const PRIVATE_KEY = Symbol("placeholder");

export class Move extends Command {
    constructor(key, x, y) {
        if (key !== PRIVATE_KEY) {
            throw new Error("placeholder");
        }

        super();

        this.type = "M";
        this.x = x;
        this.y = y;
    }

    static create(commandArray) {
        const [x, y] = commandArray;
        return new Move(PRIVATE_KEY, x, y)
    }

    static createByEvent({endPoint}) {
        return new Move(PRIVATE_KEY, endPoint.x, endPoint.y);
    }    
}