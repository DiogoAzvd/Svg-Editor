import { Move } from "./commands/Move.js";
import { Line } from "./commands/Line.js";
import { Quadratic } from "./commands/Quadratic.js";
import { T } from "./commands/T.js";
import { Cubic } from "./commands/Cubic.js";
import { S } from "./commands/S.js";
import { Arc } from "./commands/Arc.js";
import { Z } from "./commands/Z.js";

export class CommandFactory {
    constructor() {
        throw new Error("Can't instantiate CommandFactory");
    }

    static CommandMap = {
        M: Move,
        L: Line,
        Q: Quadratic,
        T: T,
        C: Cubic,
        S: S,
        A: Arc,
        Z: Z
    }

    static create(type, values, startingPoint) {
        let command;

        switch (type) {
            case "H":
                values[1] = startingPoint.y;
                command = this.CommandMap["L"].create(values);
                return command;

            case "h":
                values[0] += startingPoint.x;
                values[1] = startingPoint.y;
                command = this.CommandMap["L"].create(values);
                return command;

            case "V":
                values[1] = values[0];
                values[0] = startingPoint.x;
                command = this.CommandMap["L"].create(values);
                return command;

            case "v":
                values[1] = values[0] + startingPoint.y;
                values[0] = startingPoint.x;
                command = this.CommandMap["L"].create(values);
                return command;

            case "z": case "Z":
                values[0] = startingPoint.x;
                values[1] = startingPoint.y;
                command = this.CommandMap["Z"].create(values);
                return command;

            default:
                command = this.CommandMap[type.toUpperCase()].create(values);

                if (/[a-z]/.test(type)) {
                    const points = command.points;

                    Object.entries(points).forEach(([key, value]) => {
                        value.x += startingPoint.x;
                        value.y += startingPoint.y;

                        command[key] = value;
                    });
                }

                return command;
        }
    }

    static createByEvent(type, points) {
        const Command = this.CommandMap[type];
        return Command.createByEvent(points);
    }
}