Wheel of Destiny
================

A html5 canvas &quot;Wheel of Fortune&quot;&trade; random selector

![Wheel with pale slices](/images/newoldwebtech.png?raw=true "Wheel example, random web technologies")
![Wheel true and false](/images/truefalse.png?raw=true "Wheel example, true or false")
![Wheel with lots of letters](/images/loadsofletters.png?raw=true "Wheel example, single letters a-l")


[Live demo with four wheels](http://robgithub.github.io/wheelofdestiny/examples/fourwheels.html)

[Customise your wheel - Live demo](http://robgithub.github.io/wheelofdestiny/examples/buildyourwheel.html)


## Usage 

Just include the single JavaScript file **wheelofdestiny.js** and pass the constructor method the id of the html element you want to use as the container of the wheel and an array of items to appear on the slices.

e.g.

``` 
var myWheel = SPINWHEEL.wheelOfDestiny('container1', ['Monday','Tuesday','Wednesday','Thursday','Friday', 'Saturday', 'Sunday']);
```

Then to initiate a spin call **Start**
``` 
myWheel.Start()
```

You can also hook a callback for when the wheel stops spinning and selects a result.

``` 
myWheel.SetOnCompleted(function(winner){ alert('And the winner is ' + winner); } );
```

To hide the separate layers use the following css
``` 
.canvasForeground, .canvasWheel, .canvasSelector { display:none; }
```

### Options

Set the frames per second (FPS), default is 14
``` 
myWheel.SetFps(10);
```

Set the minimum and the maximum number of spins, default is 1, 8
``` 
myWheel.SetMinMaxSpins(1, 2);
```

### Theming

Set a theme by passing a JavaScript object with the correct names, this means you can set as many or as few values as you wish.
``` 
myWheel.SetTheme(
       {"WheelColour":"#000",
		"PegColour1":"#f00", 
        "PegColour2":"#00f",
        "PointerColour1":"#0ff",
        "PointerColour2":"#ff0",
        "CentreColour":"#0f3"})
        );
```

Defaults are
```     
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
```

Note: 
bounce
missing slice


Todo :
offer 90 degree text(per letter)

more comments

minified version

Issue :
low number of slices has pointer angled at speed but not hit
