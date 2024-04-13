const POINT_SIZE = GRID_SIZE / 2;

class WirePoint {
    static INPUT_PIN = "INPUT_PIN";
    static OUTPUT_PIN = "OUTPUT_PIN";
    static NON_PIN = "NON_PIN";

    constructor(wire) {
        this.neighbours = [];
        this.wire = wire;
        this.wire.points.push(this);
        this.visited = false;
    }

    getState() { }

    setState(state) { }

    getGlobalPos() {
        return { x: this.getGlobalPosX(), y: this.getGlobalPosY() };
    }

    getGlobalPosX() { }

    getGlobalPosY() { }

    connect(wirePoint) {
        this.neighbours.push(wirePoint);
    }

    getAllConnectedPoint() {
        let connectedPoints = [];
        let visitedPoints = [];
        let queue = [this];

        while (queue.length != 0) {
            let wirePoint = queue.pop();
            if (wirePoint.visited) continue;

            wirePoint.visited = true;
            visitedPoints.push(wirePoint);
            connectedPoints.push(wirePoint);

            for (const neighbour of wirePoint.neighbours) queue.push(neighbour);
        }

        for (const p of visitedPoints) p.visited = false;
        return connectedPoints;
    }

    isMouseOver() {
        return (this.getGlobalPosX() == Viewport.getGlobalMousePosX(true) && this.getGlobalPosY() == Viewport.getGlobalMousePosY(true));
    }

    update() {
        noStroke();
        fill(getStateColor(this.getState()));
        circle(this.getGlobalPosX(), this.getGlobalPosY(), POINT_SIZE);
    }
}