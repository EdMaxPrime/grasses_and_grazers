void draw() {  //draw function loops 
  whenclicked++;
  if(place.indexOf("/world/create/speed") >= 0) {
      editing = "speed"; last = "/world/create/speed"; next = "/world/create/vegetation";
      background(backGround);
      title("World Speed: " + current.speed, 10);
      slider(70, 1, 10, 9, current.speed, editing);
      button(120, 450, "Next", "go=/world/create/vegetation");
  }
  else if(place.indexOf("/world/create/vegetation") >= 0) {
      editing = "vegetation"; last = "/world/create/speed"; next = "/world/create/terrain";
      background(backGround);
      title("Plant Coverage: " + current.vegetation, 10);
      slider(70, 1, 10, 9, current.vegetation, editing);
      button(80, 450, "Back", "go=/world/create/speed");
      button(160, 450, "Next", "go=/world/create/terrain");
  }
  else if(place.indexOf("/world/create/terrain") >= 0) {
      editing = "terrain"; last = "/world/create/vegetation"; next = "/world/create/gradient";
      background(backGround);
      title("Terrain Smoothness: " + current.terrain, 10);
      slider(70, 1, 10, 9, current.terrain, editing);
      button(80, 450, "Back", "go=/world/create/vegetation");
      button(160, 450, "Next", "go=/world/create/gradient");
  }
  else if(place.indexOf("/world/create/gradient") >= 0) {
      editing = "gradient"; last = "/world/create/terrain"; next="/world/make";
      background(backGround);
      title("Mountain Height: " + current.gradient, 10);
      slider(70, 1, 20, 19, current.gradient, editing);
      current.startedGeneration = new Date().getTime();
      button(80, 450, "Back", "go=/world/create/terrain");
      button(160, 450, "Next", "go=/world/make");
  }
  else if(place.indexOf("/world/make") >= 0) {
      last = "/world/create/gradient";
      background(backGround);
      int timeNow = new Date().getTime();
      title("Generating World...", 10);
      slider(70, 0, 5, 6, floor((timeNow - current.startedGeneration)/1000), "time");
      noStroke();
      fill(backGround);
      rect(80, 90, 140, 50);
      button(120, 100, "Cancel", "go=/world/create/gradient");
      if(floor((timeNow - current.startedGeneration)/1000) >= 6) {
          current.reset();
          current.generateHeightMap();
          current.generateWorld();
          doAction("go=/world/play");
          updateID = setInterval(function() {
                  Date st = new Date();
                  var ends = Processing.getInstanceById("pjsComplexSketch").getWorld().startCycle();
                  Processing.getInstanceById("pjsComplexSketch").addTime(ends - st.getTime());
              },
              (11 - current.speed)*40
          );
          console.log(updateID);
      }
  }
  else if(place.indexOf("/world/play") >= 0) {
      msgOffset -= 0.5; //deprecated
      if(msgOffset < -width/2 - current.message.length*10) {
          msgOffset = width;
      }
      background(200);
      current.renderAll();
      fill(textDark);
      textSize(14);
      text("Day #" + current.day + ": " + current.message, 0, height - 2);
      minibutton(width - 15, height - 18, "\u22EE", "toggle=rightClick");
      if(rightClick == true) {
          var list = ["Pause", "Quit", "About 1.7", "Save...", "Share"];
          var listActions = [
            "pause=true;go=/world/pause",
            "pause=true;reset=world;go=/world/speed",
            "pause=true;go=/world/info",
            "go=/world/play?box=Saving is not yet supported. Closing your browser tab will delete the world.",
            "go=/world/play?box=Sharing is not yet supported."
          ];
          for(int i = 0; i < 5; i++) {
              noStroke();
              if(mouseX >= rightClickCoords[0] && mouseX <= rightClickCoords[0] + 100 &&
              mouseY >= rightClickCoords[1] + i * 25 && mouseY <= rightClickCoords[1] + (i + 1) * 25) {
                  fill(96, 134, 219);
                  if(mousePressed == true) {
                      if(mouseButton == LEFT) doAction(listActions[i]);
                  }
              } else {
                  fill(255);
              }
              rect(rightClickCoords[0], rightClickCoords[1] + i * 25, 100, 25);
              fill(160);
              text(list[i], rightClickCoords[0] + 5, rightClickCoords[1] + (i + 1) * 25 - 5);
          }
      }
  }
  else if(place.indexOf("/world/pause") >= 0) {
      stroke(0);
      fill(pauseMenu); noStroke();
      rect(60, 80, 160, 360);
      title("          Paused", 100);
      fill(textTile1); rect(70, 142, 140, 30);
      fill(textLight); textSize(16);
      text("Day #" + getWorld().day, 85, 160);
      fill(textTile2); rect(70, 172, 140, 40); fill(textLight);
      text("Time is " + int(floor((getWorld().cycles*48)/60)) + ":" + nf(getWorld().cycles*48 % 60, 2), 85, 190);
      textSize(12); fill(textLight); text("*24-hour format", 85, 205); textSize(14);
      fill(textTile1); rect(70, 212, 140, 40); fill(textLight);
      text("Charts api is", 85, 230); textSize(12); fill(textLight);
      text("   " + ((Chart)? "loaded" : "unloaded"), 85, 245); textSize(14);
      fill(textTile2); rect(70, 252, 140, 30);
      fill(textLight); textSize(14);
      text("Weather: " + getWorld().weather, 85, 270);
      button(110, 305, "extra:13:Edit Events", "editing=select;go=/events/show?from=0");
      if(Chart) {button(110, 335, "extra:13:See Charts", "chart=0;go=/chart/make");}
      else {button(110, 335, "extra:13:API Unloaded?", "chart=loading;go=/chart/error");}
      button(110, 365, "extra:13:Options", "go=/world/options?err=Nothing to see here.");
      button(110, 395, "extra:13:Unpause", "pause=false;go=/world/play");
      
  }
  else if(place.indexOf("/chart/make") >= 0) {
      if(editing.length > 1 && editing.indexOf(",") > -1) { //valid chart string
          next = "/chart/show";
      } else {
          next = "/error/params?err=You did not select any data to be shown.\nPlease go back and fix this.";
      }
      last = "?render=/world/play;go=/world/pause";
      background(backGround);
      title("Choose A Graph", 10);
      fill(#C18A0D); noStroke(); textSize(14);
      text("The amount of grass eaten  each day", 10, 75, 200, 40);
      if(editing.indexOf("1") == -1)  { button(230, 70, "Add", "chart=1"); } //old code: size=500,300;go=/chart/any;chart=0
      else { button(230, 70, "Remove", "chart=-1"); }
      stroke(255);
      line(20, 110, 280, 110); textSize(14);
      text("The total amount of grass each day (Cumulative)", 10, 120, 200, 40);
      if(editing.indexOf("2") == -1)  { button(230, 115, "Add", "chart=2"); }
      else { button(230, 115, "Remove", "chart=-2"); }
      stroke(255);
      line(20, 155, 280, 155); textSize(14);
      text("The Grazer population for each day", 10, 165, 200, 40);
      if(editing.indexOf("3") == -1)  { button(230, 160, "Add", "chart=3"); } //old code: size=500,300;go=/chart/any;chart=2
      else { button(230, 160, "Remove", "chart=-3"); }
      stroke(255);
      line(20, 200, 280, 200); textSize(14);
      text("The deaths in the Grazer population each day", 10, 210, 200, 40);
      if(editing.indexOf("4") == -1)  { button(230,205,"Add", "chart=4"); }
      else { button(230,205,"Remove", "chart=-4"); }
      stroke(255);
      line(20, 245, 280, 245); textSize(14);
      text("The births of Grazers each day", 10, 255, 200, 40);
      if(editing.indexOf("5") == -1)  { button(230,250,"Add", "chart=5"); }
      else { button(230,250,"Remove", "chart=-5"); }
      stroke(255);
      line(20, 290, 280, 290);
      text("How much the Grazers moved in total for each day", 10, 300, 200, 40);
      if(editing.indexOf("6") == -1) { button(230,295,"Add", "chart=6"); }
      else { button(230,295,"Remove", "chart=-6"); }
      stroke(255);
      line(20, 335, 280, 335);
      text("Average Grazer ages for each day", 10, 345, 200, 40);
      if(editing.indexOf("7") == -1) { button(230,340,"Add", "chart=7"); }
      else { button(230,340,"Remove", "chart=-7"); }
      stroke(255);
      line(20, 380, 280, 380);
      text("Sea Level", 10, 390, 200, 40);
      if(editing.indexOf("8") == -1) { button(230,385,"Add", "chart=8"); }
      else { button(230,385,"Remove", "chart=-8"); }
      button(100, 450, "Back", "render=/world/play;go=/world/pause");
      button(180, 450, "Go =>", "size=500,300;go=/chart/show;chart=99");
  }
  else if(place.indexOf("/chart/show") >= 0) {
      last = "?kill;size=300,500;go=/chart/make";
      button(50, 0, "Back", "kill;size=300,500;go=/chart/make");
  }
  else if(place.indexOf("/chart/error") >= 0) {
      background(backGround);
      last = "?render=/world/play;go=/world/pause";
      title("Charts API", 10);
      fill(#97F088);
      textSize(14);
      String loaded = Chart? "loaded" : "unloaded";
      text("The Chart.js library is: " + loaded, 5, 90);
      fill(255);
      text("The javascript version of this sketch(the one you are seeing now) uses Chart.js to display the charts. Since Chart.js is a separate" +
      " javascript library, it must be loaded by the browser. This sketch attaches a <script> to the document, and the browser loads Chart.js" +
      " asynchronously. This means it does not load it before the game starts, it loads it while the simulation is running." , 5, 100, width - 10, height);
      fill(180);
      rect(0, height/2 - 10, width, 70);
      fill(234);
      text("The reason you are seeing this page is because either:" + 
        "\n\u2022 Chart.js has not yet loaded" + 
        "\n\u2022 Or because it failed to load", 5, height/2, width - 10, height);
      fill(#DBDBA2);
      rect(0, height/2 + 60, width, 70);
      fill(#F5AB45);
      text("What you can do is you can wait for it to load, or press the reload button below (may take a few seconds). OR you can view it on an external website.", 5, height/2 + 70, width - 10, height);
      button(60, 440, "Back", "render=/world/play;go=/world/pause");
      button(120, 440, "Link", "go=/chart/error?box=The website is currently not finished, we hope to have it up soon!");
      button(180, 440, "Reload", "reload=script");
  }
  else if(place.indexOf("/world/info") >= 0) {
      background(backGround);
      title("Version 1.7", 10);
      fill(#C18A0D);
      textSize(14);
      text("Features include:", 5, 100);
      text("\u2022 Better support for keyboard (use \nN and B keys)", 15, 120);
      text("\u2022 Animals now show their \ngenetic traits", 15, 160);
      text("\u2022 Added inheritance and \nrandom mutations", 15, 180);
      text("\u2022 Added the events system", 15, 220);
      text("\u2022 Many many bugfixes", 15, 240);
      text("\u2022 Performance improvments \nand better animal movement", 15, 260);
      text("\u2022 Fixed the 'average age' \nstatistic for charts", 15, 300);
      button(90, 400, "Back", "render=/world/play;go=" + last);
      //button(150, 300, " More", "link=http://mod.zlotskiy.com/EdMaxPrime/pjs/soas.html");
  }
  else if(place.indexOf("/events/show") >= 0) {
      background(backGround);
      int start = int(getParam("from"));
      int end = start + floor((height - 150)/80);
      if(end < current.calendar.length) next = "/events/show?from=" + end;
      title("Calendar", 10);
      String[][] events = current.calendar.getFrom(start, end);
      for(int i = 0; i < events.length; i++) {
        if(events[i][0].equals("") == false && events[i][1].equals("") == false) {
          stroke(textTile1);
          if(editing.indexOf("+" + (start + i)) == -1) fill(textTile1);
          else fill(textTile2);
          rect(15, 50 + i * 80, 270, 70);
          fill(255);
          textSize(20);
          text(events[i][0], 20, 75 + i * 80);
          if(editing.indexOf("+" + (i + start)) == -1) {
              checkbox(width - 80, 55 + i * 80, i + start, false);
          } else {
              checkbox(width - 80, 55 + i * 80, i + start, true);
          }
          button(width - 80, 85 + i * 80, "Edit", "go=/events/edit?id=" + (i + start));
          textSize(14);
          text(events[i][1], 20, 85 + i * 80, width - 16, 40);
        }
      }
      if(start == 0) button(12, 440, "Back", "render=/world/play;go=/world/pause");
      else if(start > 0) button(12, 440, "Back", "go=/events/show?from=" + (start - (end - start)));
      if(current.calendar.events.length > 1 && editing.indexOf("+") != -1) button(84, 440, "Delete", "delete_event=" + editing);
      else {
          stroke(buttonDisabled);
          fill(buttonDisabled);
          textSize(16);
          rect(84, 440, 60, 30);
          fill(250);
          text("Delete", 89, 460);
          textSize(14);
      }
      if(current.calendar.events.length < 98) button(156, 440, "Add", "go=/events/create");
      else button(156, 440, "Add", "go=/events/show?from=" + start + "&box=The calendar is too full.");
      if(end < current.calendar.events.length) button(228, 440, "Next", "go=/events/show?from=" + end);
      else {
          stroke(buttonDisabled);
          fill(buttonDisabled); //#7ABCF5
          textSize(16);
          rect(228, 440, 60, 30);
          fill(250);
          text("Next", 233, 460);
          textSize(14);
      }
  }
  else {
      background(backGround);
      fill(#C18A0D);
      textSize(34);
      text("Error", 5, 50);
      textSize(16);
      fill(255, 128, 128);
      text(getParam("err"), 10, 80);
      fill(255, 255, 0);
      text(place, 10, 200);
      button(120, 240, "Back", "go=" + last);
  }
  if(getParam("box").equals("Something went wrong. Sorry!") == false && getParam("box").equals("No parameters") == false) {
      stroke(0);
      fill(pauseMenu);
      rect(width/6, 2*height/5, 2*width/3, height/5);
      fill(textLight);
      text(getParam("box"), width/6 + 5, 2*height/5 + 25, 2*height/5 - 10, 80);
      stroke(textDark)
      fill(titleLabel);
      rect(width/6, 2*height/5, 2*width/3, 20, 6);
      fill(titleText);
      text("Error", width/6 + 5, 2*height/5 + 16);
      button(120, 270, "Ok", "go=" + place.replace("box=" + getParam("box")));
  }
}