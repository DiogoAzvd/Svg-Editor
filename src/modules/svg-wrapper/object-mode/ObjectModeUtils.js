export function getDistance(pointA, pointB) {
    return Math.sqrt((pointA.x - pointB.x) ** 2 + (pointA.y - pointB.y) ** 2);
}

export function createReferencePoint(point, svg) {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.classList.add("non-scaling-circle");

    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);

    svg.appendChild(circle);
    return circle;
}

export function createReferenceLine(pointA, pointB, svg) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("non-scaling-line");

    line.setAttribute("x1", pointA.x);
    line.setAttribute("y1", pointA.y);
    line.setAttribute("x2", pointB.x);
    line.setAttribute("y2", pointB.y);

    svg.appendChild(line);
    return line;
}
