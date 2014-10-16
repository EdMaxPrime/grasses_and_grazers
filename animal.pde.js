class Animal { //TODO: creatureHasLeftBlock and the actual traveling
    int energy;
    int age;
    int index;
    int xpos;
    int ypos;
    int stat1;
    int stat2;
    int stat3;
    int birthCooldown;
    int leaderIndex;
    boolean alive;
    Array goWhere;
    Array followers;
    int[] lastTile;
    
    Animal(int i, int x, int y) {
        index = i;
        xpos = x;
        ypos = y;
        stat1 = int(random(0, 5));
        stat2 = int(random(0, stat1 * 2));
        stat3 = int(random(stat1, stat2));
        age = 0;
        birthCooldown = 0;
        energy = 20; //maximum is 20
        goWhere = new Array();
        int ytile = int(floor(y/15));
        int xtile = int(floor(x/15));
        lastTile = [xtile, ytile];
        alive = true;
        followers = new Array();
        leaderIndex = index;
    }
    
    void update(boolean dayHasPassed, int newIndex) {
        if(alive == false) {
            return;
        }
        int xtile = floor(xpos/15);
        int ytile = floor(ypos/15);
        birthCooldown--;
        index = newIndex;
        Tile myTile = getWorld().getTile(xtile, ytile);
        if(goWhere.length == 0) {
            if(energy < 20) {
                if(myTile.grassStage >= 2) {
                    int amountToEat = 20 - energy;
                    int amountEaten = getWorld().tiles[ytile*20 + xtile].eatGrass(amountToEat);
                    energy = energy + amountEaten;
                    //console.log(index + " needs to eat " + amountToEat + " grasses, but ate " + amountEaten + " grasses, now at " + energy + "e");
                } else {
                    this.chooseDestination(1);
                }
            } else {
                this.chooseDestination(5);
            }
        } else {
            if(goWhere[0][0]>xpos) {
                xpos++;
                if(xpos % 15 == 0) {
                    lastTile = [xtile, ytile];
                    xtile++;
                }
            }
            else if(goWhere[0][0] < xpos) {
                xpos--;
                if(xpos % 15 == 14) {
                    lastTile = [xtile, ytile];
                    xtile--;
                }
            }
            else if(goWhere[0][1] > ypos) {
                ypos++;
                if(ypos % 14 == 0) {
                    lastTile[1] = ytile;
                    ytile++;
                }
            }
            else if(goWhere[0][1] < ypos) {
                ypos--;
                if(ypos % 15 == 14) {
                    lastTile[1] = ytile;
                    ytile--;
                }
            } else {
                goWhere = new Array();
                int newx = floor(xtile/15);
                int newy = floor(ytile/15);
                getWorld().tiles[newy*20 + newx].hasCreature = true;
                getWorld().tiles[newy*20 + newx].creatureIndex = this.index;
                getWorld().stat_moved[getWorld().day] -= 1;
            }
            try {
              getWorld().tiles[lastTile[1]*20 + lastTile[0]].hasCreature = false;
              getWorld().tiles[lastTile[1]*20 + lastTile[0]].creatureIndex = -1;
            } catch(err) {
              console.log(err);
              console.log("Thrown by " + index + " from: " + lastTile.join(", "));
            } finally {
              getWorld().stat_moved[getWorld().day] += 1;
            }
        }
        if(dayHasPassed == true) {
            age++;
            if(age % 3 == 0) { 
                energy-= 2;
            }
            if(age >= 15) {
                energy -= 3;
            }
            else if(age >= 10) {
                energy--;
            }
            getWorld().stat_population[getWorld().day + 1]++;
        }
        if(age > 5 && age < 10) {
            birthCooldown--;
            if(getWorld().cycles < 20) {
              Tile closestAnimal = searchForAnimal(1);
              if(birthCooldown <= 0 && closestAnimal != null) {
                  Animal baby = new Animal(getWorld().animals.length, xpos, ypos);
                  Animal mother = getWorld().animals[closestAnimal.creatureIndex];
                  try {
                    if(mother.birthCooldown <= 0) {
                      baby.stat1 = int((stat1 + mother.stat1)/2); //inheritance
                      baby.stat2 = int((stat2 + mother.stat2)/2);
                      baby.stat3 = int((stat3 + mother.stat3)/2);
                      getWorld().requestBirth(baby);
                      birthCooldown = 300;
                      getWorld().stat_births[getWorld().day]++;
                      getWorld().stat_population[getWorld().day]++;
                    }
                  } catch(err) { console.log("Undefined loophole");}
              }
            }
        }
        else if(age >= 20 || energy < -2) {
            getWorld().stat_deaths[getWorld().day]++;
            getWorld().stat_population[getWorld().day]--;
            getWorld().requestDeath(index);
            alive = false;
        }
        getWorld().tiles[ytile*20 + xtile].hasCreature = true;
        getWorld().tiles[ytile*20 + xtile].creatureIndex = this.index;
        int rnd = floor(random(0, 300));
        if(rnd == 0) {stat1++; stat1 = min(stat1, 20);}
        else if(rnd == 10) {stat2++; stat2 = min(stat2, 20);}
        else if(rnd == 20) {stat3++; stat3 = min(stat3, 20);}
    }
    
    void chooseDestination(int howfar) {
        int ytile = floor(ypos/15);
        int xtile = floor(xpos/15);
        Tile myTile = getWorld().getTile(xtile, ytile);
        switch(int(floor(random(1, 5)))) {
            case 1: //North
                if(ytile > howfar && getWorld().getTile(xtile, ytile-howfar).hasWater == false) {
                    goWhere.push({xtile*15+8, (ytile-howfar)*15-7});
                    requiredEnergy = howfar;
                    if(getWorld().getTile(xtile, ytile-howfar).elevation > myTile.elevation) {
                      requiredEnergy += getWorld().getTile(xtile, ytile-howfar).elevation - myTile.elevation;
                    }
                    energy -= requiredEnergy;
                }
            break;
            case 2: //East
                if(xtile < 19 - howfar && getWorld().getTile(xtile+howfar, ytile).hasWater == false) {
                    goWhere.push({(xtile+howfar)*15+8, ytile*15+8});
                    requiredEnergy = howfar;
                    if(getWorld().getTile(xtile+howfar, ytile).elevation > myTile.elevation) {
                      requiredEnergy += getWorld().getTile(xtile+howfar, ytile).elevation - myTile.elevation;
                    }
                    energy -= requiredEnergy;
                    }
            break;
            case 3: //South
                if(ytile < 31 - howfar && getWorld().getTile(xtile, ytile+howfar).hasWater == false) {
                    goWhere.push({xtile*15+8, (ytile+howfar)*15+8});
                    requiredEnergy = howfar;
                    if(getWorld().getTile(xtile, ytile+howfar).elevation > myTile.elevation) {
                      requiredEnergy += getWorld().getTile(xtile, ytile+howfar).elevation - myTile.elevation;
                    }
                    energy -= requiredEnergy;
                }
            break;
            case 4: //West
                if(xtile > howfar && getWorld().getTile(xtile-howfar, ytile).hasWater == false) {
                    goWhere.push({(xtile-howfar)*15-7, ytile*15+8});
                    requiredEnergy = howfar;
                    if(getWorld().getTile(xtile-howfar, ytile).elevation > myTile.elevation) {
                      requiredEnergy += getWorld().getTile(xtile-howfar, ytile).elevation - myTile.elevation;
                    }
                    energy -= requiredEnergy;
                }
            break;
        }
    }
    
    Tile searchForAnimal(int radius) {
        Tile closest = null;
        int xtile = floor(xpos/15);
        int ytile = floor(ypos/15);
        if(radius <= 0) { //That means we search infinitely until we find something
            radius = 1;
            whileSearchLoop : while(radius + xpos < 20 && radius + ypos < 32 && xpos - radius >= 0 && ypos - radius >= 0) {
                closest = searchForAnimal(radius);
                if(closest != null) {
                    break whileSearchLoop;
                }
                radius++;
            }
        } else {
            //add code for this
            forSearchLoop : for(int x = -1*radius; x <= radius; x++) {
                for(int y = -1*radius; y <= radius; y++) {
                    if(x > -1*radius && x < radius && y == -1*radius + 1) {
                        y = radius;
                    } else {
                        if(getWorld().getTile(xtile + x, ytile + y).hasCreature == true &&
                           getWorld().getTile(xtile + x, ytile + y).creatureIndex != this.index) {
                            closest = getWorld().getTile(xtile + x, ytile + y);
                            break forSearchLoop;
                        }
                    }
                }
            }
        }
        return closest;
    }
    
    void display() { //originally all 4 spaces
      if(alive == true) {
        ellipseMode(CENTER);
        noStroke();
        fill(stat1 * 12, stat2 * 12, stat3 * 12);
        ellipse(xpos, ypos, 14, 14);
        fill(energy * 12);
        ellipse(xpos, ypos, 5, 5);
        ellipseMode(CORNER);
        fill(255);
        textSize(14);
        text(index, xpos-7, ypos-7);
      }
    }
}