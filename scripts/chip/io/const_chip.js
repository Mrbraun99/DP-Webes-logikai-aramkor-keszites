class ConstChip extends ChipCore {
    constructor(pos) {
        super(pos, BuiltinChipCode.CONST, { x: 2, y: 2 }, "", {}, { "Out": { "offset": { "x": 2, "y": 0 }, "state": WireState.OFF } });
    }

    interact() {
        switch (this.getOutputState("Out")) {
            case WireState.OFF:
                {
                    this.oPins["Out"].setState(WireState.ON);
                    break;
                }
            case WireState.ON:
                {
                    this.oPins["Out"].setState(WireState.OFF);
                    break;
                }
        }

        Circuit.evaluate([this]);
    }

    display() {
        stroke(0);
        strokeWeight(8);
        line(this.pos.x, this.pos.y, this.oPins["Out"].getGlobalPosX(), this.oPins["Out"].getGlobalPosY());

        rectMode(CENTER);
        stroke(0);
        strokeWeight(3);
        fill(getStateColor(this.getOutputState("Out")));
        rect(this.pos.x, this.pos.y, this.size.x * GRID_SIZE, this.size.y * GRID_SIZE);
    }
}