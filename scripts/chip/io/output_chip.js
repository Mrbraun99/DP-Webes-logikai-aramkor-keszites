class OutputChip extends ChipCore {
    constructor(pos) {
        super(pos, BuiltinChipCode.OUTPUT, { x: 2, y: 2 }, "Out", { "In": { "offset": { "x": -2, "y": 0 } } }, {});
    }

    rename() {
        this.name = prompt("New name: ", this.name);
        if (this.name == null || this.name == "") this.name = "Out";
    }

    display() {
        stroke(0);
        strokeWeight(8);
        line(this.pos.x, this.pos.y, this.iPins["In"].getGlobalPosX(), this.iPins["In"].getGlobalPosY());

        rectMode(CENTER);
        stroke(0);
        strokeWeight(3);
        fill(getStateColor(this.getInputState("In")));
        rect(this.pos.x, this.pos.y, this.size.x * GRID_SIZE, this.size.y * GRID_SIZE);

        Label.display(this.name, this.getPinRelativeDirection(this.iPins["In"], true), this.pos, GRID_SIZE + 10);
    }
}