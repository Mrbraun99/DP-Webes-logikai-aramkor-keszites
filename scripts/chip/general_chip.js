class GeneralChip extends ChipCore {
    constructor(pos, code, size, name, color, evaluation, iPinsData, oPinsData) {
        super(pos, code, size, name, iPinsData, oPinsData);

        this.color = color;
        this.evaluation = evaluation;
    }

    evaluate() {
        let result = this.evaluation.evaluate(Object.assign({}, ...Object.entries(this.iPins).map(([key, pin]) => ({ [key]: pin.getState() }))));
        for (let [key, value] of Object.entries(result)) this.oPins[key].setState(value);
    }

    display() {
        rectMode(CENTER);
        stroke(0);
        strokeWeight(3);
        fill(this.color);
        rect(this.pos.x, this.pos.y, this.size.x * GRID_SIZE, this.size.y * GRID_SIZE);

        noStroke();
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(25);

        if (this.size.x * GRID_SIZE < textWidth(this.name)) displayVerticalText(this.name, this.pos.x, this.pos.y);
        else text(this.name, this.pos.x, this.pos.y);
    }
}