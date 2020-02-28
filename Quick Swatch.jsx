﻿/*A few shouts out for getting this far.Tomas Sinkunas for answering my prayers on Adobe Forums. Been such a huge help in understanding scripting and scoping. Even though there's still alot to do on this. If he reads this. I promised I'll fix it.Zack Lovatt for the resize and autoLayout code.Jeff of the After Effects crew for SwatchYouWant that started all of this (I just wanted to be able to click on buttons Jeff).Then everyone else who helped me learn script building in 2014 onwards after my manager refused to pay £20 for a script. £20 Dave...*/(function(thisObj) {var scriptName = 'Quick Swatch';var keyName = 'Swatch Data';var win = (thisObj instanceof Panel) ? thisObj : new Window('palette', 'Quick Swatch',undefined, {resizable:true} );//Bits for later usevar buttonSize = [20,20, 5];  //Add a group to be the menuvar topMenu = win.add('group');topMenu.alignment = ['left','top'];//Create Button    var btnRandomColors = topMenu.add('button', undefined, 'Load New Swatch');//Search object     var search = topMenu.add('edittext',[0,0,100,32],"");//RGB or CMYKvar rgBorCmyk = topMenu.add("dropDownList",[0,0,100,32], ["RGB", "CMYK"]);rgBorCmyk.selection = 0;//Button Function    btnRandomColors.onClick = function() {//Get Data;                var swatchData = getSwatchData()//if coloured button exist remove them        while (grpColors.children[0]) {			grpColors.remove(grpColors.children[0]);		}//then add ten new buttons		addColorButtons(grpColors, swatchData);        //refresh the panel		win.layout.layout(true);//Search Function        search.onChanging = function(){             while (grpColors.children[0]) {			grpColors.remove(grpColors.children[0]);		}//then add ten new buttons		addColorButtons(grpColors, swatchData);    //refresh the panel		win.layout.layout(true);         apply()             }                  rgBorCmyk.onChange = function () {                while (grpColors.children[0]) {			grpColors.remove(grpColors.children[0]);		}//then add ten new buttons		addColorButtons(grpColors, swatchData);    //refresh the panel		win.layout.layout(true);         apply()        };         apply();	};//Add a group for my buttons	var grpColors = win.add('group');	grpColors.spacing = 1;if (app.settings.haveSetting(scriptName, keyName)){    var aseFile = new File(getSetting(keyName).toString());    var swatchData = app.parseSwatchFile(aseFile);        while (grpColors.children[0]) {			grpColors.remove(grpColors.children[0]);		}        addColorButtons(grpColors, swatchData);        win.layout.layout(true);        //Search Function        search.onChanging = function(){             while (grpColors.children[0]) {			grpColors.remove(grpColors.children[0]);		}//then add ten new buttons		addColorButtons(grpColors, swatchData);    //refresh the panel		win.layout.layout(true);         apply()             }                  rgBorCmyk.onChange = function () {                while (grpColors.children[0]) {			grpColors.remove(grpColors.children[0]);		}//then add ten new buttons		addColorButtons(grpColors, swatchData);    //refresh the panel		win.layout.layout(true);         apply()        };        apply();        } //Unsure ask Zack Lovatt    win.size = [buttonSize[0]*grpColors.children.length + (buttonSize[2] * (grpColors.children.length-1)) + 2*buttonSize[2], buttonSize[1] + 2*buttonSize[2]];    win.onResize = win.onResizing = function () {        if (win.size.width < buttonSize[0]+2*buttonSize[2]) win.size.width = buttonSize[0]+2*buttonSize[2];        if (win.size.height < buttonSize[1]+2*buttonSize[2]) win.size.height = buttonSize[1]+2*buttonSize[2];        adjustButtons(win, grpColors.children, buttonSize);    }; function apply(){        if (win.size.width < buttonSize[0]+2*buttonSize[2]) win.size.width = buttonSize[0]+2*buttonSize[2];        if (win.size.height < buttonSize[1]+2*buttonSize[2]) win.size.height = buttonSize[1]+2*buttonSize[2];        adjustButtons(win, grpColors.children, buttonSize);       }//build window	if (win instanceof Window) {		win.show();	} else {		win.layout.layout(true);	}// Function to get Datafunction getSwatchData() {	var aseFile = File.openDialog('Select *.ase file');	var data = app.parseSwatchFile(aseFile);        saveSettings(keyName, aseFile.fsName);    saveToDisk();    	return data;    }//Function to create buttons and generate new coloursfunction addColorButtons(container, swatchData) {            var data = swatchData;            var numColors = data.values.length;                    for (var i = 0; i < numColors; i++) {                var colorData = data.values[i];                if((colorData.type == "RGB") && (rgBorCmyk.selection.text == "RGB")){                if(colorData.name.indexOf(search.text) > -1){                                                           var color = [                    colorData.r,                    colorData.g,                    colorData.b                    ];                                                      var button = container.add('group');                    button.color = color;                    button.graphics.backgroundColor = button.graphics.newBrush(button.graphics.BrushType.SOLID_COLOR, color);                    button.preferredSize = [20, 20];                                        mooseClick();	}}                if((colorData.type == "CMYK") && (rgBorCmyk.selection.text == "CMYK")){                if(colorData.name.indexOf(search.text) > -1){                                                          var invBlack = 1 - colorData.k;                   color = [(1 - colorData.c)*invBlack, (1 - colorData.m)*invBlack, (1 - colorData.y)*invBlack];                                                   var button = container.add('group');                    button.color = color;                    button.graphics.backgroundColor = button.graphics.newBrush(button.graphics.BrushType.SOLID_COLOR, color);                    button.preferredSize = [20, 20];                                        mooseClick();	}}}//Eventlistner functionfunction mooseClick(){//Actual function    button.addEventListener('mousedown', function() {//Add Effect        app.beginUndoGroup("AddEffect");          var curItem = app.project.activeItem;          var selectedLayers = curItem.selectedLayers;//if more than one or more layers selected        for (var j = 0; j < selectedLayers.length; j++) {              //if Layer is a text layer            if(selectedLayers[j].property("Source Text") != null){                              textProp = selectedLayers[j].property("Source Text");            var textDocument = textProp.value;            textDocument.fillColor = this.color;            textDocument.applyFill = true;            textProp.setValue(textDocument);            }//if Layer is a shape layer                    else if(selectedLayers[j].property("Contents") != null){            selectedLayers[j].property("Contents").property(1).property("Contents").property(3).property("Color").setValue(this.color);            } else {            //if layer is neither text or shape, just add a fill. If there is a fill remove it first and add a new fill            try {            curRem = selectedLayers[j].effect.property("Fill").remove();            curLayer = selectedLayers[j].Effects.addProperty("ADBE Fill")("Color").setValue(this.color);            }            catch (err) {            curLayer = selectedLayers[j].Effects.addProperty("ADBE Fill")("Color").setValue(this.color);            }               }        }        app.endUndoGroup();           });        }}    function getSetting(keyName) {        return app.settings.getSetting(scriptName, keyName);    }    function saveSettings(keyName, value) {        app.settings.saveSetting(scriptName, keyName, value);    }        function saveToDisk() {        app.preferences.saveToDisk();    }function adjustButtons(win, buttonArray, buttonSize) {    var startPoint = [buttonSize[2], buttonSize[2]];    var offsetAmt = [buttonSize[0] + buttonSize[2], buttonSize[1] + buttonSize[2]];    grpColors.bounds = [0,40 + buttonSize[2], win.windowBounds.width+startPoint[0], win.windowBounds.height+startPoint[1]];    for (var i = 0; i < buttonArray.length; i++){        buttonArray[i].location = [startPoint[0], startPoint[1]];        buttonArray[i].size = [buttonSize[0], buttonSize[1]];        startPoint[0] += offsetAmt[0];        if ((startPoint[0] + buttonSize[0]) > win.size[0]) {            startPoint[0] = buttonSize[2];            startPoint[1] += offsetAmt[1];        }    }}})(this);