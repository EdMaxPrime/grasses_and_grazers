class Tile {
    int elevation;
    int xpos;
    int ypos;
    int grassStage;
    static float growthPerStage = 1.0;
    float grassGrowth;
    boolean hasCreature;
    boolean hasWater;
    static float frozenElevation = 60.0;
    int creatureIndex;
    
    Tile(int x, int y, int e, int g) {
        xpos = x;
        ypos = y;
        elevation = e;
        grassStage = g;
        hasCreature = false;
        hasWater = (e < getWorld().seaLevel)? true : false;
        creatureIndex = -1;
        grassGrowth = 0.0;
    }
    
    int getIndex() { //grid is 20x32
        return 20*ypos + xpos;
    }
    
    int eatGrass(int amount) {
        if(this.grassStage >= amount) {
            grassStage -= amount;
            getWorld().stat_grassEaten[getWorld().day] += amount;
            getWorld().stat_vegetation[getWorld().day] -= amount;
            return amount;
        } else {
            int howMuchWasEaten = grassStage;
            grassStage = 0;
            getWorld().stat_grassEaten[getWorld().day] += howMuchWasEaten;
            getWorld().stat_vegetation[getWorld().day] -= howMuchWasEaten;
            return howMuchWasEaten;
        }
    }
    
    void growGrass(boolean newDay) {
        if(growthPerStage >= 0) { 
        if(grassStage == -1) {
            if(current.getTile(xpos, ypos-1).grassStage >= 0 ||
               current.getTile(xpos, ypos+1).grassStage >= 0 ||
               current.getTile(xpos-1, ypos).grassStage >= 0 ||
               current.getTile(xpos+1, ypos).grassStage >= 0) {
                this.grassGrowth += 0.1;
                //console.log("(" + xpos + "," + ypos + ") - " + grassStage + "|" + grassGrowth);
            }
        }
        else if(grassStage < 5) {
            grassGrowth += 0.1;
        }
        if(grassGrowth >= growthPerStage) {
            grassGrowth = 0.0;
            grassStage++;
        }
        } else {
            grassGrowth = 0.0;
            if(elevation <= abs(growthPerStage)) {
                grassStage = -1;
            }
        }
        if(grassStage >= 1 && newDay == true) {
            getWorld().stat_vegetation[getWorld().day] += grassStage;
        }
        if(hasWater == true) {
            grassStage = -1;
            grassGrowth = 0.0;
        }
    }
    
    void display() {
        noStroke();
        if(elevation < Tile.frozenElevation) {
            if(hasWater == false) fill(#573B0C); //dirt
            else {fill(15, 186-elevation, 186 + elevation*4);} //water
        } else {
            if(hasWater == false) fill(240, 240, 240); //snow
            else {fill(160, 222 - elevation, 222 + elevation);} //ice
        }
        rect(xpos*15, ypos*15, 15, 15);
        if(grassStage >= 0 && elevation < Tile.frozenElevation) {
            fill(40 + 4*this.elevation, 128 + 3*this.elevation, 10);
            rectMode(CENTER);
            rect(xpos*15 + 7, ypos*15 + 7, grassStage*3, grassStage*3);
            rectMode(CORNER);
        }
        if(mouseX >= xpos*15 && mouseX <= xpos*15 + 15 && mouseY >= ypos*15 && mouseY <= ypos*15 + 15) {
            getWorld().message = elevation;
        }
    }
}