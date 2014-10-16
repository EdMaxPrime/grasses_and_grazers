String getParam(String name) {
    if(split(place, "?").length < 2) {
        return "No parameters";
    }
    String[] params = split(split(place, "?", 2)[1], "&");
    for(int i = 0; i < params.length; i++) {
        String n = split(params[i], "=", 2)[0];
        String v = split(params[i], "=", 2)[1];
        if(n.equals(name) == true) {
            return v;
        }
    }
    return "Something went wrong. Sorry!";
}

void title(String txt, int y) {
    fill(titleLabel);
    rect(0, y, width, 35);
    fill(titleText);
    textSize(28);
    text(txt, 10, y+30);
}

void slider(int y, float min, float max, float intervals, float current, String action) {
    float intervalValue = (max - min)/intervals;
    float pixelsPerInterval = 210/intervals;
    stroke(sliderBg);
    fill(sliderBg);
    rect(30, y, 240, 5, 3);
    fill(sliderFg);
    rect(15 + (current/intervalValue)*pixelsPerInterval, y-15, 10, 30);
    if(current > min) {
    button(90, y + 30, "<<<", "decrease=" + action + "," + intervalValue);
    }
    if(current < max) {
    button(150, y + 30, ">>>", "increase=" + action + "," + intervalValue);
    }
}

void button(int x, int y, String txt, String action) {
    stroke(buttonNormal);
    fill(buttonNormal);
    int extra = 0;
    if(txt.indexOf("extra:") > -1) {
        extra = int(split(txt, ":" , 3)[1]) * 6;
        txt = split(txt,":",3)[2];
    }
    if(mouseX >= x-extra/2 && mouseX <= x+60+extra/2 && mouseY >= y && mouseY <= y+30) { 
        fill(buttonHover);
        if(whenclicked < 2) {
            if(mouseButton == LEFT) doAction(action);
        }
    }
    textSize(16);
    rect(x-extra/2, y, 60+extra, 30);
    fill(textLight);
    text(txt, x - extra/2 + ((60 + extra) - externals.context.measureText(txt).width)/2, y+20);
    textSize(14);
}

void checkbox(int x, int y, String ifPressed, boolean checked) {
    stroke(buttonNormal);
    fill(buttonNormal);
    if(mouseX >= x && mouseX <= x+60 && mouseY >= y && mouseY <= y+30) {
        fill(buttonHover);
        if(whenclicked < 2) {
            console.log(editing + " and " + ifPressed);
            if(checked == false) {
                editing += ("+" + ifPressed);
                checked = true;
            }
            else {
                if(editing.indexOf(ifPressed) != -1) {editing = editing.replace("+" + ifPressed, ""); checked = false;}
            }
        }
    }
    textSize(26);
    rect(x, y, 60, 30);
    fill(textLight);
    if(checked == true) text("\u2611", x + (60 - externals.context.measureText("\u2611").width)/2, y + 20);
    else text("\u2610", x + (60 - externals.context.measureText("\u2610").width)/2, y + 20);
    textSize(14);
}

void minibutton(int x, int y, String txt, String action) {
  fill(textDark);
  if(mouseX >= x && mouseX <= x + 16 && mouseY >= y && mouseY <= y + 16) {
    fill(255, 64);
    rect(x-4, y, 16, 16);
    fill(255, 255, 0);
    if(whenclicked < 2) {
        if(mouseButton == LEFT) doAction(action);
    }
  }
  textSize(16);
  text(txt, x, y + 16);
  textSize(14);
}

void addTime(int time) {
    if(time == -1) { return cycleTimes; }
    else if(time == -2) { cycleTimes = new Array(); }
    else { cycleTimes.push(time); }
}

void keyReleased() {
    if(key == CODED) {
        if(place.indexOf("/world/create") >= 0) {
            if(keyCode == LEFT) {
                doAction("decrease=" + editing + "," + 1);
            }
            else if(keyCode == RIGHT) {
                doAction("increase=" + editing + "," + 1);
            }
        }
        if(keyCode == UP) scrollIndex--;
        else if(keyCode == DOWN) scrollIndex++;
    } else {
        if(key == "\n" || key == 'n' || key == 'N') {
            doAction("go=" + next);
        }
        else if(key == 'b' || key == 'B') {
            doAction("go=" + last);
        }
        if(key == 'q' || key == 'Q') {
            clearInterval(updateID);
            console.log(current.stat_grassEaten);
            doAction("go=/world/create/speed");
        }
        else if(key == 'g' || key == 'G') {
            doAction("go=" + prompt("Where would you like to go?"));
        }
        else if(key == 's' || key == 'S') {
            console.log(current.animals[0].searchForAnimal(5));
        }
        else if(key == ' ') {
            if(place.indexOf("/world/pause") >= 0) {
                updateID = setInterval(function() {
                      Date st = new Date();
                      var ends = Processing.getInstanceById("pjsComplexSketch").getWorld().startCycle();
                      Processing.getInstanceById("pjsComplexSketch").addTime(ends - st.getTime());
                  },
                    (11 - current.speed)*50
                );
                doAction("go=/world/play");
            }
            else if(place.indexOf("/world/play") >= 0) {
                clearInterval(updateID);
                doAction("go=/world/pause");
            }
        }
        else if(key == '+' || key == 43) {
            current.raiseSeaLevel(current.seaLevel + 1);
        }
        else if(key == '-' || key == 189) {
            current.raiseSeaLevel(current.seaLevel - 1);
        }
        else if(key == 'e' || key == 'S') {
            String s = prompt("Which event would you like to add?");
            current.calendar.add(s);
        }
    }
}

void mouseReleased() {
    whenclicked = 0;
    if(mouseButton == RIGHT) {
        rightClick = true;
        rightClickCoords = [mouseX, mouseY];
    } else {
        rightClick = false;
    }
}

World getWorld() {
    return current;
}

int[] factorsOf(int n, int maximum) {
    var factors = new Array();
    for(int i = 1; i <= maximum; i++) {
        if(n % i == 0) factors.push(i);
    }
    return factors;
}