import { CommandFactory } from "./command-factory/CommandFactory.js";

export class Path {
    constructor(layer, element) {
        this.element = element ? Path.normalize(element) : Path.create(layer);
        this.commands = element ? Path.createCommands(element) : [];

        layer.appendChild(this.element);
        this.element.classList.add("element");
    }

    static create() {
        // LATER - Calculate layer size to adjust stroke-width
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");

        const attributes = {
            fill: "transparent",
            stroke: "#303030",
            "stroke-width": .3,
            "stroke-linejoin": "round",
        }

        Object.entries(attributes).forEach(([key, value]) => {
            path.setAttribute(key, value);
        });

        return path;
    }

    static normalize(path) {
        let d = path.getAttribute("d");
        
        d = d.replace(/[-]/g, " -");
        d = d.replace(/([a-df-z])/gi, "$1 ");
        d = d.replace(/(\.\d+)/g, '$1 ');
        d = d.replace(/[, \s]+/g, " ");
        d = d.replace(/( )([a-z])/gi, "$2");
        d = d.trim();

        const validCommandType = /[mlhvqtcsaz]/i;
        const charIndex = [];

        for (let i = 0; i < d.length; i++) {
            if ( validCommandType.test(d[i]) ) {
                charIndex.push(i);
            }
        }

        function normalizeImplicitCommand(command) {
            const expectedSize = {
                M: 2,
                L: 2,
                H: 1,
                V: 1,
                Q: 4,
                T: 2,
                C: 6,
                S: 4,
                A: 7,
            }

            const args = command.split(" ");
            const type = args[0];

            if (type === "Z" || type === "z") return command;

            const values = args.slice(1);

            const argSize = expectedSize[type.toUpperCase()];
            const isImplicit = values.length > argSize;

            let newCommand = "";

            if (isImplicit) {
                switch ( type.toUpperCase() ) {
                    case "M":
                        for (let i = 0; i < values.length / argSize; i++) {
                            const nextCommand = type === "M" ? "L " : "l ";
                            const dividedValues = values.slice(i * argSize, (i + 1) * argSize);
                            newCommand += nextCommand + dividedValues.join(" ");
                        }
                        return newCommand;

                    default:
                        for (let i = 0; i < values.length / argSize; i++) {
                            const dividedValues = values.slice(i * argSize, (i + 1) * argSize);
                            newCommand += type + " " + dividedValues.join(" ");
                        }
                        return newCommand;
                }
            }

            return command;
        }

        let newD = "";

        for (let i = 0; i < charIndex.length; i++) {
            const command = d.slice(charIndex[i], charIndex[i + 1]);
            const newCommand = normalizeImplicitCommand(command);

            newD += newCommand;
        }

        path.setAttribute("d", newD);
        return path;
    }

    static createCommands(path) {
        const d = path.getAttribute("d");     

        const validCommandType = /[mlqtcsaz]/i;
        const charIndex = [];

        for (let i = 0; i < d.length; i++) {
            if ( validCommandType.test(d[i]) ) {
                charIndex.push(i);
            }
        }

        const commands = [];
        let startingPoint = {x: 0, y: 0};

        for (let i = 0; i < charIndex.length; i++) {
            const command = d.slice(charIndex[i], charIndex[i + 1]);
            const args = command.split(" ");
            const type = args[0];
            const values = args.slice(1).map(Number);

            const commandObj = CommandFactory.create(type, values, startingPoint);
            startingPoint = commandObj.xy;
            commands.push(commandObj);    
        }

        let newD = "";

        commands.forEach((command) => {
            newD += " " + command.parse();
        })

        path.setAttribute("d", newD.trim());
        return commands;
    }

    static applyTransformation(path, scale = false) {
        let newD = "";

        const transformList = path.element.transform.baseVal;
        const matrix = transformList.consolidate()?.matrix;

        if (!matrix) return;

        path.commands.forEach((command) => {
            const points = command.points;

            Object.entries(points).forEach(([key, value]) => {
                const newPoint = DOMPoint.fromPoint(value).matrixTransform(matrix);
                command[key] = newPoint;
            });

            if (command.type === "A" && scale) {
                const newRadius = {
                    x: command.rx * matrix.a,
                    y: command.ry * matrix.d
                }
                
                command.rx = newRadius.x;
                command.ry = newRadius.y;
            }

            newD += " " + command.parse();
        });

        transformList.clear();
        path.element.setAttribute("d", newD.trim());
    }    
}