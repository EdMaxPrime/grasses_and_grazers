class World {
    float speed = 5;
    int vegetation = 5;
    int terrain = 5;
    int gradient = 5;
    int day = 0; //Each day is 30 cycles
    int cycles = 0; //How many cycles we already had in this day
    int startedGeneration;
    int seaLevel;
    int cloudStage;
    int highest;
    int WIDTH = 20;
    int HEIGHT = 32;
    int PXLS = 15; //pixels per tile
    int[][] heightmap;
    float avgHeight;
    var requests = {};
    String message;
    String weather;
    String[] diseases = ["Brain freeze", "Explosiveness", "Combustion", "Overgrowth", "Ungrowing"];
    Array happening;
    Array stat_deaths = new Array();
    Array stat_births = new Array();
    Array stat_population = new Array();
    Array stat_averageAge = new Array();
    Array stat_grassEaten = new Array();
    Array stat_moved = new Array();
    Array stat_vegetation = new Array();
    Array stat_seaLevel = new Array();
    Array animals = new Array();
    Array tiles = new Array();
    Calendar calendar;
    
    World() {
        animalPos = new int[640][0];
        for(int i = 0; i < 15; i++) {
            animals[i] = new Animal(i, int(random(8, 12)*15)+7, int(random(13, 17)*15)+7);
        }
        stat_deaths.push(0);
        stat_births.push(0);
        stat_population.push(animals.length);
        stat_averageAge.push(0);
        stat_grassEaten.push(0);
        stat_moved.push(0);
        stat_vegetation.push(0);
        stat_seaLevel.push(0);
        requests = {
            emptySpots : new Array(),
            newSpots : new Array()
        };
        day = 0;
        cycles = 0;
        seaLevel = 0;
        highest = 0;
        message = "The world has begun with " + animals.length + " brave animals.";
        //happening = [{name : "sun", until : 1, type : "weather"},{name:"rain",until:10,type:"weather"},{name:"sun",until:11,type:"weather"}];
        weather = "sun";
        cloudStage = 0;
        calendar = new Calendar();
    }
    
    Tile getTile(int x, int y) {
        if( (x >= 0) == false) {
            x = 0;
        }
        if( (x <= 19) == false) {
            x = 19;
        }
        if( (y >= 0) == false) {
            y = 0;
        }
        if( (y <= 31) == false) {
            y = 31;
        }
        return tiles[y*20 + x];
    }
    
    void generateWorld() {
        int[] grassX = new int[vegetation];
        int[] grassY = new int[vegetation];
        int grassSpots = 0;
        for(int v = 0; v < vegetation; v++) {
            if(v == 0) grassX[v] = int(floor(random(3)));
            else grassX[v] = int(floor(random(grassX[v-1]+1, grassX[v-1]+3)));
            grassY[v] = int(floor(random(0, 19)));
            while(grassY[v] < 31 && heightmap[grassX[v]][grassY[v]] < avgHeight*0.8) {
                grassY[v]++;
            }
        }
        grassX = sort(grassX);
        grassY = sort(grassY);
        for(int x = 0; x < 20; x++) { //x-loop
            for(int y = 0; y < 32; y++) { //y-loop
                if(grassX[grassSpots] == x && grassY[grassSpots] == y) {
                    console.log("grass at: (" + x + "," + y + ")");
                    tiles[y*20 + x] = new Tile(x, y, heightmap[x][y], 5);
                    grassSpots++;
                } else {
                    tiles[y*20 + x] = new Tile(x, y, heightmap[x][y], -1);
                }
            }
        }
        this.stat_vegetation[this.day] += grassSpots * 5;
        console.log("v=" + vegetation + ", t=" + terrain + ", g=" + gradient + ", s=" + speed);
        calendar.add("sun_20_" + seaLevel);
    }
    
    void generateHeightMap() {
        heightmap = new int[getWorld().WIDTH][getWorld().HEIGHT];
        int totalOfAverages = 0;
        avgHeight = 0;
        int totalHeight = 0;
        for(int x = 0; x < 20; x++) { //fill with random values
            for(int y = 0; y < 32; y++) {
                heightmap[x][y] = int(floor(random(1, gradient+1)*2));
            }
        }
        for(int i = 0; i < terrain; i++) {
            for(int x = 0; x < 20; x++) {
                for(int y = 0; y < 32; y++) {
                    /*Left column*/
                    if(x == 0) {
                      if(y == 0) {
                        heightmap[x][y] = int((heightmap[x][y+1] + heightmap[x+1][y] + heightmap[x+1][y+1])/3);
                      }
                      else if(y == heightmap[x].length - 1) {
                        heightmap[x][y] = int((heightmap[x][y-1] + heightmap[x+1][y] + heightmap[x+1][y-1])/3);
                      }
                      else {
                        heightmap[x][y] = int((heightmap[x][y-1] + heightmap[x+1][y-1] + heightmap[x+1][y] + 
                        heightmap[x+1][y+1] + heightmap[x][y+1])/5);
                      }
                    }
                    /*Right column*/
                    else if(x == heightmap.length - 1) {
                      if(y == 0) {
                        heightmap[x][y] = int((heightmap[x-1][y] + heightmap[x-1][y+1] + heightmap[x][y+1])/3);
                      }
                      else if(y == heightmap[x].length - 1) {
                        heightmap[x][y] = int((heightmap[x][y-1] + heightmap[x-1][y-1] + heightmap[x-1][y])/3);
                      }
                      else {
                        heightmap[x][y] = int((heightmap[x][y-1] + heightmap[x-1][y-1] + heightmap[x-1][y] + 
                        heightmap[x-1][y+1] + heightmap[x][y+1])/5);
                      }
                    }
                    /*Top row*/
                    else if(y == 0) {
                      
                    }
                    /*Bottom row*/
                    else if(y == heightmap[x].length - 1) {
                      
                    }
                    /*Everything in the middle*/
                    else {
                      heightmap[x][y] = int((heightmap[x][y-1] + heightmap[x+1][y-1] + heightmap[x+1][y] + 
                      heightmap[x+1][y+1] + heightmap[x][y+1] + heightmap[x-1][y+1] + 
                      heightmap[x-1][y] + heightmap[x-1][y-1])/8);
                    }
                    totalHeight += heightmap[x][y];
                    highest = max(highest, heightmap[x][y]);
                }
            }
            totalOfAverages += round(totalHeight/(heightmap.length * heightmap[0].length));
        }
        avgHeight = int(totalOfAverages / terrain);
        seaLevel = round(avgHeight*0.8);
    }
    
    void raiseSeaLevel(int elevation) {
        for(int x = 0; x < 20; x++) {
            for(int y = 0; y < 32; y++) {
                if(heightmap[x][y] < elevation) {
                    tiles[y*20 + x].hasWater = true;
                    tiles[y*20 + x].grassStage = -1;
                } else {
                    tiles[y*20 + x].hasWater = false;
                }
            }
        }
        seaLevel = elevation; console.log("New E:" + seaLevel);
    }
    
    void reset() {
        stat_deaths = [0];
        stat_births = [0];
        stat_population = [0];
        stat_averageAge = [0];
        stat_grassEaten = [0];
        stat_moved = [0];
        stat_vegetation = [0];
        stat_seaLevel = [0];
        animals = new Array();
        tiles = new Array();
        requests = { emptySpots : new Array(), newSpots : new Array() };
        day = 0;
        cycles = 0;
        for(int i = 0; i < 15; i++) {
            animals[i] = new Animal(i, int(random(8, 12)*15)+7, int(random(13, 17)*15)+7);
        }
        message = "The world has begun with " + animals.length + " brave animals.";
        calendar = new Calendar();
    }
    
    int startCycle() {
        cycles++;
        stat_deaths[day] = int(stat_deaths[day]);
        stat_births[day] = int(stat_births[day]);
        stat_population[day] = int(stat_population[day]);
        stat_averageAge[day] = int(stat_averageAge[day]);
        stat_grassEaten[day] = int(stat_grassEaten[day]);
        stat_moved[day] = int(stat_moved[day]);
        stat_vegetation[day] = int(stat_vegetation[day]);
        stat_seaLevel[day] = int(stat_seaLevel[day]);
        if(cycles >= 30) { //remember to tally age and then divide by thingies.length
            stat_seaLevel[day] = seaLevel;
            day++;
            cycles = 0;
            stat_deaths.push(0);
            stat_births.push(0);
            stat_population.push(0);
            stat_averageAge.push(0);
            stat_grassEaten.push(0); stat_moved[day-1] = floor(stat_moved[day-1]/15);
            stat_moved.push(0);
            stat_vegetation.push(0);
            stat_seaLevel.push(0);
            updateTiles(true);
            updateAnimals(true);
            message = stat_deaths[day-1] + " deaths, " + stat_births[day-1] + " births.";
            console.log("Day #" + (day-1) + "=" + stat_births[day-1] + " births," + 
            stat_deaths[day-1] + " deaths," + stat_population[day-1] + " animals," + 
            stat_grassEaten[day-1] + " grass eaten," + stat_moved[day-1] + " units moved," + 
            stat_vegetation[day-1] + " grass in total.");
            console.log(addTime(-1));
            addTime(-2);
        } else {
            updateAnimals(false);
            updateTiles(false);
        }
        for(int i = 0; i < requests.newSpots.length; i++) {
            animals.push(requests.newSpots[i]);
            animals[animals.length - 1].index = i;
        }
        updateWeather();
        requests.newSpots = new Array();
        calendar.update(day, cycles);
        return new Date().getTime();
    }
    
    void updateTiles(boolean newDay) {
        for(int i = 0; i < tiles.length; i++) {
            tiles[i].growGrass(newDay);
        }
    }
    
    void requestDeath(int index) {
        if(requests.emptySpots.indexOf(index) == -1) {
            requests.emptySpots.push(index);
        }
    }
    void requestBirth(Animal a) {
        if(requests.emptySpots.length == 0) {
            requests.newSpots.push(a);
        } else {
            animals[requests.emptySpots[0]] = a;
            requests.emptySpots.shift();
        }
    }
    
    int updateAnimals(boolean newDay) {
        int value = 0;
        int ageTotal = 0;
        int animalAmount = 0;
        for(int i = 0; i < animals.length; i++) {
            animals[i].update(newDay, i);
            if(animals[i].alive == true) { ageTotal += animals[i].age; animalAmount++; }
        }
        if(cycles == 29) {
            stat_averageAge[day] = (floor(ageTotal/animalAmount));
        }
    }
    
    void renderAll() {
        for(int i = 0; i < tiles.length; i++) {
            tiles[i].display();
        }
        for(int i = 0; i < animals.length; i++) {
            animals[i].display();
        }
        noStroke();
        fill(0, 80);
        rect(0, cloudStage - height, width, height);
    }
    
    void updateWeather() {
        if(weather.equals("rain") == true) {
            if(day % 3 == 0 && cycles == 0) {
                raiseSeaLevel(seaLevel + 1);
            }
        } else if(weather.equals("sun") == true) {
            this.cloudStage = -height;
        }
    }
    
    int getStat(int intRepresentation, int day) {
        switch(intRepresentation) {
            case 1:
                return stat_grassEaten[day];
            break;
            case 2:
                return stat_vegetation[day];
            break;
            case 3:
                return stat_population[day];
            break;
            case 4:
                return stat_deaths[day];
            break;
            case 5:
                return stat_births[day];
            break;
            case 6:
                return stat_moved[day];
            break;
            case 7:
                return stat_averageAge[day];
            break;
            case 8:
                return stat_seaLevel[day];
            break;
            default:
                return 0;
            break;
        }
    }
    
}