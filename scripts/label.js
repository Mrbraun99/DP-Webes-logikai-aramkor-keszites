class Label {
    static display(name, direction, point, offset) {
        switch (direction) {
            case Direction.RIGHT:
            case Direction.LEFT:
                {
                    let dir = (direction == Direction.RIGHT) ? 1 : -1;
                    let pos = { x: point.x + dir * (textWidth(name) / 2 + offset), y: point.y }

                    rectMode(CENTER);
                    noStroke();
                    fill(0);
                    rect(pos.x, pos.y, textWidth(name) + 10, 30, 5, 5, 5, 5);

                    textAlign(CENTER, CENTER);
                    textSize(25);
                    noStroke();
                    fill(255);
                    text(name, pos.x, pos.y);
                    break;
                }
            case Direction.UP:
            case Direction.DOWN:
                {
                    let dir = (direction == Direction.DOWN) ? 1 : -1;
                    let pos = { x: point.x, y: point.y + dir * (textHeight(name) / 2 + offset) };

                    rectMode(CENTER);
                    noStroke();
                    fill(0);
                    rect(pos.x, pos.y, 30, textHeight(name) + 10, 5, 5, 5, 5);

                    textAlign(CENTER, CENTER);
                    textSize(25);
                    noStroke();
                    fill(255);
                    displayVerticalText(name, pos.x, pos.y);
                    break;
                }
        }
    }
}