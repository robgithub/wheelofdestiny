// Wheel of Destiny
// 20141012 Rob: v1.0 release to Github
/*

The MIT License (MIT)
[OSI Approved License]

The MIT License (MIT)

Copyright (c) 2014 "Rob Davis", "rob_on_earth"

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/


// declare our global namespace
var SPINWHEEL = SPINWHEEL || {};

// create the closure for the instance of the object
SPINWHEEL.wheelOfDev = (function(targetId, list){
    // canvas layers array, properties get populated as they are dynamically created
    var canvases = [{"name":'canvasMain'}, {"name":'canvasWheel'}, {"name":'canvasForeground'},{"name":'canvasSelector'}];
    var fps = 14; // anything faster than 14 is unnoticable
    var intervalHandle = null; // animation handle
    
    var spinAngle = 5; // starting offset
    var spinAngleEnd = -1; // target
    var spinRate = -1;
    var spinAlt = -1;
    var spinReverseAngle = -1;
    
    var minSpins = 1;
    var maxSpins = 8;
    
    var appWidth  = -1;
    var appHeight = -1;
    var appRadius = -1;
    var wheelRadius = -1;
    var sliceSize = -1;
    
    var pegSize = -1; // peg size is used to calculate the pointer geometry
    
    var theme = {
        "Colour1":"#ff0", 
        "Colour2":"#000",
        "WheelColour":"#fff",
        "FontColour1":"#000",
        "FontColour2":"#ff0",
        "Slice1Colour":"#006",
        "Font":"Arial",
        "PegColour1":"#fff", 
        "PegColour2":"#000",
        "PointerColour1":"#fff",
        "PointerColour2":"#000",
        "CentreColour":"#903",
        "HighlightColour":"rgba(255,100,100,0.5)",
        "SliceText":"Spin again"
    };
    
    // cannot make public but can expose a setter SetOnCompleted()
    var onCompleted = null;
    
    // initialise all the dynamic canvases
    var init = function() {
    	var targetDiv = document.getElementById(targetId);
		for (var i=0;i<canvases.length;i++) {
		    if (getCanvas(canvases[i].name)) break;
		    canvases[i]=newCanvas(targetId, canvases[i].name);
		    targetDiv.appendChild(canvases[i].canvas);
		}
		appWidth = targetDiv.offsetWidth;
		appHeight = targetDiv.offsetHeight;
        appRadius = appWidth/2;
        wheelRadius = appRadius - (appRadius/10);
        pegSize = (appRadius/20);
        sliceSize = 360/list.length;
		// setup the canvas parameters and pre-renders
		// Main
		var main = getCanvas('canvasMain');
		main.canvas.width = appWidth;
		main.canvas.height = appHeight;
		// Wheel
		var wheel = getCanvas('canvasWheel');
		wheel.canvas.width = appWidth;
		wheel.canvas.height = appHeight;
        // Foreground
		var forground = getCanvas('canvasForeground');
		forground.canvas.width = appWidth;
		forground.canvas.height = appHeight;
        // Selector
		var selector = getCanvas('canvasSelector');
		selector.canvas.width = appWidth;
		selector.canvas.height = appHeight;
    };

    
    // Draws the wheel
    var createWheel = function() {
        var wheel = getCanvas('canvasWheel');
        clearCanvasBlank(wheel.canvas, wheel.context);
        drawEllipse (wheel.context, appRadius, appRadius, wheelRadius, wheelRadius, theme.WheelColour);
        var fillStyle = '#f00';
        wheel.context.font = (wheelRadius/10)*2 +"pt " + theme.Font;
        wheel.context.textBaseline = 'middle';
        for (var i=0;i<list.length;i++) {
            wheel.context.save();
            wheel.context.translate(appRadius, appRadius);
            wheel.context.rotate(deg2Rad(90-(sliceSize*i)));
            wheel.context.translate(0-(appRadius),0-(appRadius));
            if (i%2) fillStyle = theme.Colour1;
            else fillStyle = theme.Colour2;
            if (i===0 && theme.Slice1Colour) fillStyle = theme.Slice1Colour;
            drawPieSlice(wheel.context, appRadius, appRadius, wheelRadius-(wheelRadius/50), 180-(sliceSize/2), 180+(sliceSize/2), false, fillStyle, true);
            wheel.context.save();
            if (i%2) fillStyle = theme.FontColour1;
            else fillStyle = theme.FontColour2;
            wheel.context.fillStyle = fillStyle;
            wheel.context.fillText(list[i], (appRadius-wheelRadius)*2, appRadius, ((appRadius-wheelRadius)*6));
            wheel.context.restore();
            wheel.context.restore();
        }
        // seperate draw, else the slices overlap with the pegs
        for (var i=0;i<list.length;i++) {
            wheel.context.save();
            wheel.context.translate(appRadius, appRadius);
            wheel.context.rotate(deg2Rad((sliceSize/2)+(sliceSize*i)));
            wheel.context.translate(0-(appRadius),0-(appRadius));
            // draw the pegs
            drawEllipse(wheel.context, appRadius, pegSize*5, pegSize, pegSize, theme.PegColour1, false);
            drawEllipse(wheel.context, appRadius, pegSize*5, pegSize-2, pegSize-2, theme.PegColour2, true);
            wheel.context.restore();
        }
    };    


  
    // Animation drawing
    var animateWheel = function() {
        if (spinAngleEnd<0) {
            spinAngleEnd = getSpinAmount();
            spinAngle=0;
            spinRate=10;
            spinAlt =0.15;
            spinReverseAngle = -1;
            intervalHandle = setInterval(function(){animateWheel();}, 1000/fps);
            return;
        } 
        // check for the last rotation
        if (spinAngle>spinAngleEnd-360) {
            spinRate-=spinAlt;
            if (spinRate<1) {
                spinRate=1;
            }
        }
        spinAngle+=spinRate;
        if (spinReverseAngle>=0) {
            spinReverseAngle+=spinRate;
        }
        if (spinAngle >= spinAngleEnd) {
            clearInterval(intervalHandle);
            setPointer();
            drawStage();
            highlightWinner((spinAngle-spinReverseAngle));
            spinAngleEnd=-1;
        } else {
            setPointer();
            drawStage();
        }
    }

    var getSpinAmount  = function (){
        var newAngle = getRandomRangeWhole(360*minSpins, 360*maxSpins);
        // if spinAngleEnd points to a peg then adjust
        var angle = (newAngle % 360) ;
        var distanceFromPeg = angle % sliceSize;
        if (distanceFromPeg<(pegSize/2)) {
            newAngle+=(pegSize/2);
        }
        if (distanceFromPeg>sliceSize-(pegSize/2)) {
            newAngle-=(pegSize/2);
        }
        return newAngle;
    }
    
    // Make the pointer flick as the pegs go around and offer random bounce back
    var setPointer = function(){
        // when the spinAngle is such that the pegs would interact it the pointer 
        var pointAngle = 0;
        var angle = (spinAngle % 360) + (sliceSize/2);
        var distanceFromPeg = angle % sliceSize;
        // slow enough to animate
        var offset = sliceSize;
        if (spinRate<8) {
            switch (Math.round(distanceFromPeg) ) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                    pointAngle = 30;
                    break;
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    pointAngle = 45;
                    break;
                case offset:
                case offset - 1:
                    pointAngle = 20;
                    break;
                case offset - 2:
                    pointAngle = 16;
                    break;
                case offset - 3:
                    pointAngle = 14;
                    break;
                case offset - 4:
                    pointAngle = 12;
                    break;
                case offset - 5:
                    pointAngle = 10;
                    break;
            }
            if ( 
                (spinReverseAngle < 0) &&
                (
                    (pointAngle <= 45) && 
                    (pointAngle >= 10)
                ) &&
                ((spinAngle-(pegSize*2)) >= spinAngleEnd-sliceSize)
            ) {
                // conditions are right for possible bounce back
                // spinReverseAngle has not been changed
                // the pointer angle is not fully "bent" nor "unbent"
                // the remaining angular distance is less than one "slice" taking into account peg size, else the pointer can bounce back and cover a previous peg.
                spinReverseAngle = 0;
            }

        } else {
            // flicking at speed
            if ( (distanceFromPeg <= (spinRate) ) ||
                 (distanceFromPeg >= (sliceSize - spinRate) ) ){
                pointAngle = 50;
            } else {
                pointAngle = 35;
            }
        }
        if (spinReverseAngle>0) {
            createPointer(0);
        } else {
            createPointer(-pointAngle);
        }
    }

    // Highlight a winner and initiate callback
    var highlightWinner = function(finishingAngle) {
        finishingAngle = 0-finishingAngle; // not sure why this is negated
        // divide by 360 and keep remainder
        var angle = finishingAngle % 360;
        // each slice is size
        var rawResult = angle/sliceSize;
        var result = Math.ceil(rawResult);
        var i = result;
        if (result<0) {
            result = result -(result + result);
        } 
        if (result >= list.length) {
            result -= list.length;
        }
        var selector = getCanvas('canvasSelector');
        var sliceOffset = (sliceSize/2) + ((i)*(sliceSize));
        var startAngle = 270-(angle-sliceOffset);
        if (spinReverseAngle>=0) {
            startAngle-=spinReverseAngle;
        }
        var endAngle = startAngle - sliceSize;
        var style = theme.HighlightColour;
        var clockwise = true;
        var fill= false;
        selector.context.lineWidth = (wheelRadius/20);
        if (selector.context.setLineDash)
            selector.context.setLineDash([selector.context.lineWidth]);
        drawPieSlice(selector.context, appRadius, appRadius, wheelRadius, startAngle, endAngle, clockwise, style, fill)
        createPointer(0);
        drawStage();
        if (onCompleted) {
            onCompleted(list[result]);
        }
    }

    // Draw all the canvas layers on to the main canvas
    var drawStage = function() {
        var main = getCanvas('canvasMain');
        var canvas = main.canvas;
        var context = main.context;
        clearCanvasBlank(canvas, context);
        var wheel = getCanvas('canvasWheel');
        var half = wheel.canvas.width/2;
        var angle = spinAngle;
        if (spinReverseAngle>=0) {
            angle-=(spinReverseAngle*2);
        }
        main.context.save();
        main.context.translate(half, half);
        main.context.rotate(deg2Rad(angle));
        main.context.translate(0-(half),0-(half));
        context.drawImage(wheel.canvas, 0, 0);
        main.context.restore();
        var selector = getCanvas('canvasSelector');
        context.drawImage(selector.canvas, 0, 0);
        var foreground = getCanvas('canvasForeground');
        context.drawImage(foreground.canvas, 0, 0);
    }

    // Create the pointer at a specific angle
    var createPointer = function(bentAngle) {
        var fore = getCanvas('canvasForeground');  
        clearCanvasBlank(fore.canvas, fore.context);
        // draw the centre
        var factor=15;
        drawEllipse (fore.context, appRadius, appRadius, wheelRadius/factor, wheelRadius/factor, theme.CentreColour);
        fore.context.save();
        fore.context.translate(appRadius,5);
        fore.context.rotate(deg2Rad(bentAngle));
        drawSpike(fore.context, 0, pegSize, pegSize, 0, pegSize*6, -pegSize, pegSize, theme.PointerColour1);
        fore.context.restore();
    }

    // Draw a triangle/spike
    // angle expects everything to be drawn at rotation 0,0
    var drawSpike = function(context, angle, x1, y1, x2, y2, x3, y3, style)
    {
        context.save();
        context.rotate(deg2Rad(angle));
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineTo(x3, y3);
        context.fillStyle=style;
        context.closePath();
        context.fill();
        context.strokeStyle=theme.PointerColour2;
        context.stroke();
        context.restore();
    }

        // Draw a slice on the context
    var drawPieSlice = function(context, cx, cy, radius, startAngle, endAngle, clockwise, style, fill) {    
        context.save();
        context.beginPath();
        context.moveTo(cx,cy);
        context.arc(cx,cy,radius, deg2Rad(startAngle), deg2Rad(endAngle), clockwise);
        context.lineTo(cx,cy);
        if (fill) {
            context.fillStyle = style;
            context.fill();
        } else {
            context.strokeStyle = style;
            context.stroke();
        }
        context.restore();
    }
    
    // Draw an Ellipse
    // fill can be a simple style or a function that returns a gradient
    var drawEllipse = function (context, cx, cy, rx, ry, fill){
		context.save(); 
		context.beginPath();
		context.translate(cx-rx, cy-ry);
		context.scale(rx, ry);
		var ellipseFill;
		if (typeof(fill)==='function') {
			ellipseFill=fill(context);
		} else {
			ellipseFill=fill;
		}
		context.arc(1, 1, 1, 0, 2 * Math.PI, false);
		context.fillStyle = ellipseFill;
		context.fill();
		context.closePath();
		context.restore(); 
	};
    
    // Get a canvas wrapper object based on the name
    var getCanvas = function (name) {
        for (var i = 0; i < canvases.length; i++) {
            if (canvases[i].name == name && canvases[i].canvas) {
                return canvases[i];
            }
        }
        return;
    };

    // Called via Start()
    var spinInitiator = function() {
        createWheel();
        var selector = getCanvas('canvasSelector');
        clearCanvasBlank(selector.canvas, selector.context);
        animateWheel();
    };
    
    // Convert human readable degree angles into strange machine readable radians
	var deg2Rad = function(degrees) {
		return degrees * Math.PI / 180;
	};
    
    // clear canvas with a style
    // if style is null then blanks
	var clearCanvas = function(canvas, context, style) {
        if (style==null) {
            clearCanvasBlank(canvas, context);
            return;
        }
		context.fillStyle = style;
		context.fillRect(0, 0, canvas.width, canvas.height);
	}
	// clear canvas
	var clearCanvasBlank = function(canvas, context) {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

    // Create a new canvas wrapper object
    // or return the existing one
    var newCanvas = function(targetId, canvasName) {
        var canvasObject = getCanvas(canvasName);
        if (!canvasObject) {
            var canvas = document.createElement('canvas');
            canvas.className = canvasName;
            var context = canvas.getContext("2d");
            return { "name": canvasName, "canvas":canvas, "context":context, "display":true};
        } 
        return canvasObject;
    }

    // return random value between 0 and 1.0
    var getRandom = function() {
        return Math.random();
    }

    // return random float value between min and max (including min and up to but not including the whole number max)
    var getRandomRange = function(min,max) {
        return min + ( max * getRandom());
    }
    
    // random number between min and max including min and max
    var getRandomRangeWhole = function(min,max) {
        return Math.round(getRandomRange(min+1,max-1))-1;
    }

    // why the hell can I not just expose a property?
    var setOnCompleted = function(callback) {
        onCompleted = callback;
    }
    
    var setFps = function(newFps) {
        fps = newFps;
    }
    
    var setMinMaxSpins = function(min, max) {
        minSpins = min>0?min:1;
        maxSpins = max>0? (max>=min)?max:min :1;
    }
    
    var setTheme = function(newTheme) {
        for (name in newTheme) {
            theme[name] = newTheme[name];
        }
        createWheel();
        createPointer(0);
        drawStage();
    }
    
    if (list.length<1) list.push('Missing');
    // for pretty patterns we need an even number of items
    if (list.length%2) list.push(theme.SliceText);    
    // Stackoverflow likes to point out this is not truely random array sorting but in all my tests it did a good job.
    list = list.sort(function() {return 0.5 - Math.random()});
    
    // do stuff when created
    init();
    createWheel();
    createPointer(0);
    drawStage();
   
    return {
        // any public methods
        SetOnCompleted:setOnCompleted,
        SetFps:setFps,
        SetMinMaxSpins:setMinMaxSpins,
        SetTheme:setTheme,
        Start:spinInitiator
    };
});

var instance1 = SPINWHEEL.wheelOfDev('container1', ['html5','css','JavaScript','flash','silverlight', 'java']);
instance1.SetOnCompleted(displayWinner1);
var instance2 = SPINWHEEL.wheelOfDev('container2',  ['true','false']);
instance2.SetOnCompleted(displayWinner2);
var instance3 = SPINWHEEL.wheelOfDev('container3', ['a','b','c','d','e','f','g','h','i','j']);
instance3.SetOnCompleted(displayWinner3);
var instance4 = SPINWHEEL.wheelOfDev('container4', ['a','b','c','d','e','f','g','h','i','j','k','l']);
instance4.SetOnCompleted(displayWinner4);

instance1.SetMinMaxSpins(1,1);
instance2.SetMinMaxSpins(1,1);
instance3.SetMinMaxSpins(1,1);
instance4.SetMinMaxSpins(1,1);
instance1.SetTheme({"Colour1":"rgba(255,255,0,0.5)"});
instance2.SetTheme({"FontColour2":"#fff"});
instance3.SetTheme({"WheelColour":"#fff", "somthingelse":0});
instance4.SetTheme({"Font":"Comic Sans MS"});
$('#btn-spin').click(function() {
    $('.value').text('+');
    instance1.Start();
    instance2.Start();
    instance3.Start();
    instance4.Start();
});

function displayWinner1(winner) {
    $('#info1').text(winner);
    //instance2.SetFps(1);
}
function displayWinner2(winner) {
    $('#info2').text(winner);
    //instance3.SetFps(5);
}
function displayWinner3(winner) {
    $('#info3').text(winner);
    //instance4.SetFps(10);
}
function displayWinner4(winner) {
    $('#info4').text(winner);
    //instance1.SetFps(30);
}
