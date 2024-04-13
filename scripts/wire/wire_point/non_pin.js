class NonPin extends WirePoint {
    constructor(pos, wire) {
        super(wire);

        this.pos = pos;
    }

    getState() {
        return this.wire.state;
    }

    setState(state) {
        this.wire.state = state;
    }

    getGlobalPosX() {
        return this.pos.x;
    }

    getGlobalPosY() {
        return this.pos.y;
    }
}