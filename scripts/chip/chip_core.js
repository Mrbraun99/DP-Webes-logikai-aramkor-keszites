class ChipCore {
    constructor(pos, code, size, name, iPinsData, oPinsData) {
        this.pos = pos;
        this.code = code;
        this.size = { x: size.x, y: size.y };
        this.name = name;
        this.visitCount = 0;
        this.rotation = 0;

        this.isSelected = false;
        this.isDragging = false;
        this.offset = { x: 0, y: 0 };

        this.iPins = Object.assign({}, ...Object.keys(iPinsData).map(key => { return { [key]: new InputPin(iPinsData[key].offset, key, this) } }));
        this.oPins = Object.assign({}, ...Object.keys(oPinsData).map(key => { return { [key]: new OutputPin(oPinsData[key].offset, key, this, oPinsData[key].state) } }));
    }

    setOutputs(state) {
        for (const pin of Object.values(this.oPins)) pin.setState(state);
    }

    getPinRelativeDirection(pin, invert = false) {
        let dir;

        if (Math.abs(pin.offset.x) * 2 >= this.size.x) dir = (Math.sign(pin.offset.x) == 1) ? Direction.RIGHT : Direction.LEFT;
        if (Math.abs(pin.offset.y) * 2 >= this.size.y) dir = (Math.sign(pin.offset.y) == 1) ? Direction.DOWN : Direction.UP;

        if (invert && dir == Direction.RIGHT) return Direction.LEFT;
        if (invert && dir == Direction.LEFT) return Direction.RIGHT;
        if (invert && dir == Direction.DOWN) return Direction.UP;
        if (invert && dir == Direction.UP) return Direction.DOWN;

        return dir;
    }

    mouseDragged() {
        if (this.isSelected) {
            let oldX = this.pos.x;
            let oldY = this.pos.y;

            this.pos.x = Math.round((Viewport.getGlobalMousePosX() + this.offset.x) / GRID_SIZE) * GRID_SIZE;
            this.pos.y = Math.round((Viewport.getGlobalMousePosY() + this.offset.y) / GRID_SIZE) * GRID_SIZE;

            if (this.pos.x != oldX || this.pos.y != oldY) this.isDragging = true;
        }
    }

    isMouseOver() {
        if (Viewport.getGlobalMousePosX() < this.pos.x - this.size.x * GRID_SIZE / 2) return false;
        if (Viewport.getGlobalMousePosY() < this.pos.y - this.size.y * GRID_SIZE / 2) return false;
        if (Viewport.getGlobalMousePosX() > this.pos.x + this.size.x * GRID_SIZE / 2) return false;
        if (Viewport.getGlobalMousePosY() > this.pos.y + this.size.y * GRID_SIZE / 2) return false;

        return true;
    }

    select() {
        this.isSelected = true;
        this.offset.x = this.pos.x - Viewport.getGlobalMousePosX();
        this.offset.y = this.pos.y - Viewport.getGlobalMousePosY();
    }

    deselect() {
        if (this.isSelected && !this.isDragging) this.interact();
        this.isSelected = false;
        this.isDragging = false;
    }

    getOutputState(oPinName) {
        return this.oPins[oPinName].getState();
    }

    getInputState(iPinName) {
        return this.iPins[iPinName].getState();
    }

    rotate() {
        this.size = { x: this.size.y, y: this.size.x };
        for (const pin of [...Object.values(this.iPins), ...Object.values(this.oPins)]) pin.offset = { x: -pin.offset.y, y: pin.offset.x };
        this.rotation = (this.rotation + 1) % 4;
    }

    update() {
        this.display();
        for (const pin of [...Object.values(this.iPins), ...Object.values(this.oPins)]) pin.update();
    }

    interact() { }

    evaluate() { }

    display() { }

    copy() { }
}