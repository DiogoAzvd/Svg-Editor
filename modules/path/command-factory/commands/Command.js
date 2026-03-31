export class Command {
    constructor() {
        if (new.target === Command) {
            throw new Error("Can't instantiate Command directly");
        }

        this.type;
        this.x;
        this.y;
    }

    get xy() {
        return {
            x: this.x,
            y: this.y
        }
    }

    set xy(point) {
        this.x = point.x;
        this.y = point.y;
    }

    get points() {
        return {
            xy: this.xy
        };
    }

    parse() {
        const values = Object.values(this);
        return values.join(" ");
    }
}