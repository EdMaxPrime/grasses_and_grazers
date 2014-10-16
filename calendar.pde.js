class Calendar {
    Array events;
    Array temperature;
    Array archive;
    Calendar() { events = new Array(); archive = new Array(); } //constructor
    void add(var event) {
        if(event instanceof String == true) {
            String[] params = split(event, "_");
            if(params[0].equals("rain") || params[0].equals("sun") || params[0].equals("flood") || params[0].equals("drought")) {
                var t = new Array();
                for(int i = 0; i < int(params[1]); i++) {
                    if(i < int(params[2])) t.push("hot");
                    else t.push("cold");
                }
                events.push({
                    name : params[0], 
                    type : "weather", 
                    duration : int(params[1]), 
                    sea: 0,
                    began : -1,
                    until : -1,
                    temperature : t,
                    toString : function() {
                        return "Event {name : " + this.name + ", type : 'weather', duration : " + this.duration +
                        ", sea : " + this.sea + ", began : " + this.began + ", until : " + this.until + "}";
                    },
                    formatted : function() {
                        return ["Weather Event", this.name + " for " + this.duration + " days", (this.until - getWorld().day) + " days left."];
                    },
                    start : function() {
                        getWorld().message = "Forecast: " + this.name + " for " + this.duration + " days";
                        getWorld().weather = this.name;
                        this.began = getWorld().day;
                        this.until = this.began + this.duration;
                        this.sea = getWorld().seaLevel;
                    }
                });
                archive.push(events[events.length - 1]);
            }
            else if(params[0].equals("animals") || params[0].equals("grasses")) {
                events.push({
                    type : "population",
                    name : params[0],
                    duration : int(params[1])
                });
                archive.push(events[events.length - 1]);
            }
            else if(current.diseases.indexOf(params[0]) != -1) {
                params[1] = int(params[1]);
                events.push({name : params[0], type : "disease", source : params[1], power : params[2]});
            }
        }
    }
    void remove(int index) {
        events.splice(index, 1);
    }
    String[] getFrom(int start, int end) {
        String[][] evts = new String[end - start][2];
        for(int i = 0; i < evts.length; i++) {
            if((i + start) < events.length) {
                evts[i] = events[i + start].formatted();
            } else {
                evts[i] = ["", ""];
            }
        }
        return evts;
    }
    String getTemperature(int day) {
        return events[0].temperature[day - events[0].began];
    }
    void update(int day, int cycle) {
        if(events[0].until == day || events[0].began == -1) {
            events.shift();
            if(events.length == 0) {
                add("sun_20_0");
            }
            events[0].start();
        }
        switch(events[0].name) {
            case "rain":
                if(getWorld().cloudStage < height) {
                  getWorld().cloudStage += ceil((height - getWorld().cloudStage)*(1/(4*events[0].duration))); //advance clouds
                }
                if(getTemperature(day).equals("hot") == true) {
                    if(cycle == 0 && getWorld().seaLevel < getWorld().highest - 1) {
                        if((events[0].until - day) % 5 == 0)getWorld().raiseSeaLevel(getWorld().seaLevel + 1);
                    }
                } else { //cold weather = snow
                    if(Tile.frozenElevation > getWorld().highest) Tile.frozenElevation = getWorld().highest;
                    else {
                        if(cycle == 0) Tile.frozenElevation--;
                    }
                }
            break;
            case "flood":
                int until = events[0].began + events[0].duration;
                if(day + 1 == events[0].until && cycle == 29) {
                    getWorld().raiseSeaLevel(events[0].sea); //sea level back to normal
                    Tile.frozenElevation = 60;
                } else {
                    if(cycle % 5 == 0 && getWorld().seaLevel < getWorld().highest - 1) { //every 5 cycles raise sea level
                        getWorld().raiseSeaLevel(getWorld().seaLevel + 1); //raise sea
                    }
                }
                if(getTemperature(day).equals("cold") == true) {
                    Tile.frozenElevation = getWorld().highest - 3;
                }
            break;
            case "drought":
                if(getTemperature(day).equals("hot") == true) {
                    if(Tile.growthPerStage >= 0) Tile.growthPerStage = -1;
                    else {
                        if(cycle == 0) {
                            if(-1*Tile.growthPerStage < getWorld().highest) Tile.growthPerStage--;
                        }
                    }
                } else {
                    Tile.growthPerStage = 500.0;
                }
                if(day + 1 == events[0].until && cycle == 29) {
                    getWorld().raiseSeaLevel(events[0].sea); // sea level back to normal
                    Tile.growthPerStage = 1.0;
                } else {
                    if(cycle % 5 == 0 && getWorld().seaLevel > 0) { //every 5 cycles lower sea level
                        getWorld().raiseSeaLevel(getWorld().seaLevel - 1); //lower sea
                    }
                }
            break;
            case "sun":
                if(getWorld().cloudStage >= -1*height) {
                    getWorld().cloudStage += ceil((-1*height - getWorld().cloudStage)*0.25); //fade clouds
                }
                if(getTemperature(day).equals("hot") == true) {
                    if((events[0].until - day) % 10 == 0 && getWorld().seaLevel > 0 && cycle == 0) {
                        getWorld().raiseSeaLevel(getWorld().seaLevel - 1);
                    }
                }
            break;
            default:
            break;
        }
    }
    String toString() {
        String evts = "";
        for(int i = 0; i < events.length; i++) {
            
        }
    }
}