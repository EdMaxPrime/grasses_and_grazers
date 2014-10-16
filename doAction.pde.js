void doAction(String action) {
    String[] actions = split(action, ";");
    for(int i = 0; i < actions.length; i++) {
        String cmd = split(actions[i], "=")[0];
        String val = join(subset(split(actions[i], "="), 1), "=");
        if(cmd.equals("go") == true) {
            last = place;
            if(val.indexOf("?") == 0) {
                doAction(val.substring(1, val.length));
            } else {
                place = val;
            }
        }
        else if(cmd.equals("increase") == true) {
            String varname = split(val, ",", 2)[0];
            float varval = float(split(val, ",", 2)[1]);
            if(varname.equals("speed")) {
                current.speed += varval;
            }
            else if(varname.equals("vegetation")) {
                current.vegetation += varval; 
            }
            else if(varname.equals("terrain")) {
                current.terrain += varval; 
            }
            else if(varname.equals("gradient")) {
                current.gradient += varval; 
            }
        }
        else if(cmd.equals("decrease") == true) { 
            String varname = split(val, ",", 2)[0];
            float varval = float(split(val, ",", 2)[1]);
            if(varname.equals("speed")) {
                current.speed -= varval;
            }
            else if(varname.equals("vegetation")) {
                current.vegetation -= varval;
            }
            else if(varname.equals("terrain")) {
                current.terrain -= varval;
            }
            else if(varname.equals("gradient")) {
                current.gradient -= varval;
            }
        }
        else if(cmd.equals("render") == true) {
            place = val;
            draw();
        }
        else if(cmd.equals("log") == true) {
            console.log(val);
        }
        else if(cmd.equals("reload") == true) {
            if(val.equals("script") == true) {
                var child = document.getElementById("soasScript");
                child.parentNode.removeChild(child);
                var script = document.createElement("script");
                script.id = "soasScript";
                script.type = "text/javascript";
                script.src = "https://rawgit.com/nnnick/Chart.js/master/Chart.js";
                document.body.appendChild(script);
            }
            else if(val.equals("world") == true) {
                current.reset();
            }
        }
        else if(cmd.equals("save") == true) {
            if(val.equals("temp") == true) {
                saves.push(current);
            }
            else if(val.equals("storage") == true) {
                if(window.localStorage) {
                    localStorage
                } else {
                    place = place + "?box=Your browser does not support this feature.";
                }
            }
            else if(val.equals("editing") == true) {
                
            }
            else if(val.equals("link") == true) {
                
            }
        }
        else if(cmd.equals("pause") == true) {
            if(val.equals("true") == true) {
                clearInterval(updateID);
            }
            else if(val.equals("false") == true) {
                updateID = setInterval(function() {
                  Date st = new Date();
                  var ends = Processing.getInstanceById("pjsComplexSketch").getWorld().startCycle();
                  Processing.getInstanceById("pjsComplexSketch").addTime(ends - st.getTime());
                },
                (11 - current.speed)*40
                );
            }
            else if(val.equals("toggle") == true) {
                if(place.equals("/world/pause") == true) {
                    doAction("pause=false");
                } else {
                    doAction("pause=true");
                }
            }
        }
        else if(cmd.equals("chart") == true) {
            if(parseInt(val) == NaN) {
                editing = val;
                return;
            }
            val = int(val);
            var opts = {pointHitDetectionRadius : 10};
            Chart.defaults.global.responsive = true;
            if(val < 0) {
                editing = editing.replace("+" + abs(val), "");
            } else if(val == 0) {
                editing = "0";
            } else if(val == 99) { //harcoded number meaning "generate chart"
                if(getWorld().day == 0) { //if this is the first day, throw an error
                    doAction("go=" + place + "?box=No charts are available on the first day. Please wait until the next day to do this.");
                }
                if(editing.length < 3) { //if there are no variables chosen, throw an error
                    doAction("go=" + place + "?box=You must specify at least one variable!");
                }
                String[] datacodes = split(editing, "+");
                int xInterval = 1; //default value
                if(getWorld().day > 21) {
                    var factors = factorsOf(getWorld().day - 1, 20);
                    if(factors.length == 1) {
                        factors = factorsOf(getWorld().day - 2, 20);
                        xInterval = (getWorld().day - 2) / max(factors);
                    }
                    else {
                        xInterval = (getWorld().day - 1) / max(factors);
                    }
                } else {
                    xInterval = 1;
                }
                for(int i = 1; i < datacodes.length; i++) { //i is 1 because we want to skip the first dummy code '0'
                    datacodes[i] = int(datacodes[i]); //to integer
                    var cdataData = new Array(); //make empty array, holds actual data
                    for(int d = 0; d <= (getWorld().day - 1); d += xInterval) { //loop through every nth day(n = xInterval)
                        if(xInterval > 1 && d > 0) {
                            int total = 0;
                            for(int skippedDay = d - xInterval + 1; skippedDay <= d; skippedDay++) {
                                total += getWorld().getStat(datacodes[i], d);
                            }
                            cdataData.push(total/xInterval);
                        } else {
                            cdataData.push(getWorld().getStat(datacodes[i], d)); //add data for that day
                        }
                        if(datacodes[i] == 2) { //this is solely for grass population
                            cdataData[cdataData.length - 1] /= 5; //divide by 5 to show the amount of grass tiles, not steps
                        }
                    }
                    switch(datacodes[i]) {
                        case 1:
                            chartData.datasets.push({
                                label : "Grass Eaten",
                                fillColor : "rgba(255, 255, 255, 0.1)",
                                strokeColor : "rgb(128, 255, 128)",
                                pointColor : "rgb(128, 255, 128)",
                                pointStrokeColor : "rgb(114, 230, 114)",
                                pointHighlightFill : "#ffffff",
                                pointHighlightStroke : "rgb(164, 255, 164)",
                                data : cdataData
                            });
                        break;
                        case 2:
                            chartData.datasets.push({
                                label : "Grass Population",
                                fillColor : "rgba(255, 255, 255, 0.1)",
                                strokeColor : "rgb(80, 156, 80)",
                                pointColor : "rgb(80, 156, 80)",
                                pointStrokeColor : "rgb(70, 180, 70)",
                                pointHighlightFill : "#ffffff",
                                pointHighlightStroke : "rgb(128, 255, 128)",
                                data : cdataData
                            });
                        break;
                        case 3:
                            chartData.datasets.push({
                                label : "Animal Population",
                                fillColor : "rgba(255, 255, 255, 0.1)",
                                strokeColor : "rgb(255, 128, 128)",
                                pointColor : "rgb(255, 128, 128)",
                                pointStrokeColor : "rgb(230, 114, 114)",
                                pointHighlightFill : "#ffffff",
                                pointHighlightStroke : "rgb(255, 164, 164)",
                                data : cdataData
                            });
                        break;
                        case 4:
                            chartData.datasets.push({
                                label : "Animal Deaths",
                                fillColor : "rgba(255, 255, 255, 0.1)",
                                strokeColor : "rgb(192, 96, 96)",
                                pointColor : "rgb(156, 80, 80)",
                                pointStrokeColor : "rgb(180, 70, 70)",
                                pointHighlightFill : "#ffffff",
                                pointHighlightStroke : "rgb(192, 96, 96)",
                                data : cdataData
                            });
                        break;
                        case 5:
                            chartData.datasets.push({
                                label : "Animal Births",
                                fillColor : "rgba(255, 255, 255, 0.1)",
                                strokeColor : "rgb(255, 192, 192)",
                                pointColor : "rgb(255, 192, 192)",
                                pointStrokeColor : "rgb(230, 162, 162)",
                                pointHighlightFill : "#ffffff",
                                pointHighlightStroke : "rgb(255, 192, 192)",
                                data : cdataData
                            });
                        break;
                        case 6:
                            chartData.datasets.push({
                                label : "Movement",
                                fillColor : "rgba(255, 255, 255, 0.1)",
                                strokeColor : "#AD8326",
                                pointColor : "#AD8326",
                                pointStrokeColor : "#634A12",
                                pointHighlightFill : "#ffffff",
                                pointHighlightStroke : "#AD8326",
                                data : cdataData
                            });
                        break;
                        case 7:
                            chartData.datasets.push({
                                label : "Average Age",
                                fillColor : "rgba(255, 255, 255, 0.1)",
                                strokeColor : "#000000",
                                pointColor : "#000000",
                                pointStrokeColor : "#000000",
                                pointHighlightFill : "#ffffff",
                                pointHighlightStroke : "#000000",
                                data : cdataData
                            });
                        break;
                        case 8:
                            chartData.datasets.push({
                                label : "Sea Level",
                                fillColor : "rgba(255, 255, 255, 0.1)",
                                strokeColor : "#221CD9",
                                pointColor : "#221CD9",
                                pointStrokeColor : "#1E18CC",
                                pointHighlightFill : "#ffffff",
                                pointHighlightStroke : "#1E18CC",
                                data : cdataData
                            });
                        break;
                        default:
                            console.log("Unknown Code");
                        break;
                    }
                }
                for(int d = 0; d <= getWorld().day; d+= xInterval) {
                    chartData.labels.push("Day " + d);
                }
                lchart = new Chart(Processing.getInstanceById("pjsComplexSketch").externals.context).Line(chartData, chartOpts);
            } else {
                editing += "+" + val;
            }
        }
        else if(cmd.equals("size") == true) { //resize the sketch
            int w = int(split(val, ",", 2)[0]);
            int h = int(split(val, ",", 2)[1]);
            Processing.getInstanceById("pjsComplexSketch").size(w, h);
            translate(abs(w-width), abs(h-height));
            width = w;
            height = h;
        }
        else if(cmd.equals("kill") == true) { //destroy the chart
            lchart.destroy();
            chartData = { labels : [], datasets : [] };
        }
        else if(cmd.equals("toggle") == true) {
            if(val.equals("rightClick") == true) {
                rightClick = rightClick? false : true;
                rightClickCoords = [3 * width/5, 0.72 * height];
            }
        }
        else if(cmd.equals("add_event") == true) {
            current.calendar.add(val);
        }
        else if(cmd.equals("editing") == true) {
            editing = val;
        }
    }
}