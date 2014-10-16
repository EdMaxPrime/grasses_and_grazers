class Location {
    int gridX, gridY; //between 0-19, 0-31
    int stepX, stepY; //between 0-14
    int moveVertical, moveHorizontal;
    Location destination;
    Location(int gx, int gy, int sx, int sy) {
        gridX = gx; gridY = gy;
        stepX = sx; stepY = sy;
        moveVertical = 1;
        moveHorizontal = 1;
    }
    void moveTo(Location l) {
        int yoffset = l.gridY - gridY;
        int xoffset = l.gridX - gridX;
        destination = new Location(l.gridX, l.gridY, getWorld().PXLS/2 + 1, getWorld().PXLS/2 + 1);
        if(yoffset < 0) moveVertical = -1;
        else if(yoffset > 0) moveVertical = 1;
        else moveVertical = 0;
        if(xoffset < 0) moveHorizontal = -1;
        else if(xoffset > 0) moveHorizontal = 1;
        else moveHorizontal = 0;
    }
    void goNear(Location l, int fartherest) {
        int yoffest = floor(random(-fartherest, fartherest));
        int xoffset = floor(random(-fartherest, fartherest));
        yoffset = max(0, gridY + yoffset);
        xoffset = max(0, gridX + xoffset);
        yoffset = min(getWorld().HEIGHT, gridY + yoffset);
        xoffset = min(getWorld().WIDTH, gridX + xoffset);
        moveTo(new Location(gridX + xoffset, gridY + yoffset, 0, 0));
    }
    boolean move() {
        boolean movedToNewTile = false;
        if(destination.gridX != gridX || destination.stepX != stepX) {stepX+=moveVertical; getWorld().stat_moved[getWorld().day] += 1;}
        if(destination.gridY != gridY || destination.stepY != stepY) {stepY+=moveHorizontal; getWorld().stat_moved[getWorld().day] += 1;}
        if(stepX >= getWorld().PXLS) {
            stepX = 0;
            gridX++;
            movedToNewTile = true;
        }
        else if(stepX < 0) {
            stepX = getWorld().PXLS - 1;
            gridX--;
            movedToNewTile = true;
        }
        if(stepY >= getWorld().PXLS) {
            stepY = 0;
            gridY++;
            movedToNewTile = true;
        }
        else if(stepY < 0) {
            stepY = getWorld().PXLS - 1;
            gridY--;
            movedToNewTile = true;
        }
        return movedToNewTile;
    }
    int pixelXpos() { return (gridX * getWorld().PXLS) + stepX; }
    int pixelYpos() { return (gridY * getWorld().PXLS) + stepy; }
}