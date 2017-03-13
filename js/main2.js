//initialize function called when the script loads to instantiate Leaflet map
function createMap(){

    //setting variables to implement panning constraint
    var southWest = L.latLng(-90, -180),
    northEast = L.latLng(90, 180),
    bounds = L.latLngBounds(southWest, northEast);

	//create map
	//var mymap = L.map('mapid').setView([20, 0], 2);
    var mymap = L.map('mapid', {
        center: [20,0],
        zoom: 2,
        maxBounds: bounds,
        maxBoundsViscosity: 0.7,
        maxZoom: 4,
    });

	//add OSM base tilelayer
	L.tileLayer('https://api.mapbox.com/styles/v1/aai3/ciypzrn44000y2rptm8kxjuyo/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA', {
    	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    	maxZoom: 18,
        minZoom: 1,
    	id: 'mapbox://styles/aai3/ciypzrn44000y2rptm8kxjuyo',
    	accessToken: 'pk.eyJ1IjoiYWFpMyIsImEiOiJjaXNodXV0MDMwMDdoMnpsc3h5eHpsNW1oIn0.Cgw3sUtk9HXvNEYbnu2NeA'
	}).addTo(mymap); //Adds the layer to the map.

	//call getData function
	//getData(mymap);
    getFemaleData(mymap);
    // essentially also calls getMaleData(mymap); because nested
};



//Dynamically calculating each circle marker radius for proportional symbol display...area relative to attribute value...
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 2.5; //but what does this imply as far as user perception/understanding, if the scalFactor is larger?
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//function to convert markers to circle markers for Female attributes
function pointToLayerFemale(feature, latlng, attributesFemale){

    //create Female marker options
    var optionsFemale = {
        fillColor: "#990000",
        color: "#990000",
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.75
    };
    //create circle marker layer by returning the circle marker to the L.geoJson pointToLayer option
    return L.circleMarker(latlng, optionsFemale)
};

//function to convert markers to circle markers for Male attributes
function pointToLayerMale(feature, latlng, attributesMale){
    //create marker options
    var optionsMale = {
        fillColor: "#231F20",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0
    };
    return L.circleMarker(latlng, optionsMale)
};

//function to convert markers to circle markers
function pointToLayer(feature, latlng){
    //Determine which attribute to visualize with proportional symbols
    var attribute = "Pop_2015";

    //create marker options
    var options = {
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);

    //build popup content string
    var popupContent = "<p><b>City:</b> " + feature.properties.City + "</p><p><b>" + attribute + ":</b> " + feature.properties[attribute] + "</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: pointToLayer
    }).addTo(map);
};




//Build an attributes array from the data.
function processDataFemale(responseFemale){
    //empty array to hold attributes
    var attributesFemale = [];
    //properties of the first feature in the dataset
    var propertiesFemale = responseFemale.features[0].propertiesFemale;
    //push each attribute name into attributes array
    for (var attribute in propertiesFemale){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attributesFemale.push(attribute);
        };
    };
    //Assign the current attribute based on the index of the attributes array
    return attributesFemale;
};

//Build an attributes array from the data.
function processDataMale(responseMale){
    //empty array to hold attributes
    var attributesMale = [];
    //properties of the first feature in the dataset
    var propertiesMale = responseMale.features[0].propertiesMale;
    //push each attribute name into attributes array
    for (var attribute in propertiesMale){
        //only take attributes with population values
        if (attribute.indexOf("20") > -1){
            attributesMale.push(attribute);
        };
    };
    //Assign the current attribute based on the index of the attributes array
    return attributesMale;
};

//Add circle markers for female point features to the map
function createPropSymbolsFemale(responseFemale, mymap, attributesFemale){
    //create 2 Leaflet GeoJSON layers by gender and add them to the map
    var femaleLayer = L.geoJson(responseFemale, {
        pointToLayerFemale: function(feature, latlng){
            return pointToLayerFemale(feature, latlng, attributesFemale);
        }
    }).addTo(mymap);
};
    
//Add circle markers for male point features to the map
function createPropSymbolsMale(responseMale, mymap, attributesMale){
    var maleLayer = L.geoJson(responseMale, {
        pointToLayerMale: function(feature, latlng){
            return pointToLayerMale(feature, latlng, attributesMale);
        }
    }).addTo(mymap);
};

//Resize proportional symbols according to new attribute values
function updatePropSymbols(mymap, attribute){
    map.eachLayer(function(layer){
        if (layer.feature && layer.feature.properties[attribute]){
            //access feature properties
            var props = layer.feature.properties;

            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            //if no data exists (value of -9999), use $ isNAN to reassign value radius to 0
            if (isNaN(radius)){
                radius = 0;
            };

            layer.setRadius(radius);

            //add country to popup content string
            var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

            //add formatted attribute to popup content string
            var gender = attribute.split("_")[1];
            var year = attribute.split("_")[0];
            popupContent += "<p><b>Deaths under 5 years of age for " + gender + "s "+ "in " + year + ":</b> " + props[attribute] + "</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};

//Create female sequence controls
function createSequenceControlsFemale(mymap, attributesFemale){
    
    //add skip buttons
    $('#panelFemale').append('<button class="skip" id="reverseFemale">Reverse</button>');
    $('#panelFemale').append('<button class="skip" id="forwardFemale">Skip</button>');
    //replace button content with images
    $('#reverseFemale').html('<img src="img/reverseFemale.png">');
    $('#forwardFemale').html('<img src="img/forwardFemale.png">');

    //create range input element (slider)
    $('#panelFemale').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 4, //5 slider positions (0 index -> 5 = 4)
        min: 1, //index o' first attribute 
        value: 0, //start at first att in sequence
        step: 1 //slider's value inc/decremented by 1
    });

    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 4 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 4 : index;
        };

        //Step 8: update slider based on above new index
        $('.range-slider').val(index);
        //Step 9: Reassign the current attribute based on the new attributes array index
        updatePropSymbols(mymap, attributesFemale[index])
    });

    //Create input listener for slider
    $('.range-slider').on('input', function(){
        //Get the new index value
        var index = $(this).val();
        updatePropSymbols(mymap, attributesFemale[index])
    });
};

//Create male sequence controls
function createSequenceControlsMale(mymap, attributesMale){
    
    //add skip buttons
    $('#panelMale').append('<button class="skip" id="reverseMale">Reverse</button>');
    $('#panelMale').append('<button class="skip" id="forwardMale">Skip</button>');
    //replace button content with images
    $('#reverseMale').html('<img src="img/reverseMale.png">');
    $('#forwardMale').html('<img src="img/forwardMale.png">');

    //create range input element (slider)
    $('#panelMale').append('<input class="range-slider" type="range">');
    //set slider attributes
    $('.range-slider').attr({
        max: 4, //5 slider positions (0 index -> 5 = 4)
        min: 1, //index o' first attribute 
        value: 0, //start at first att in sequence
        step: 1 //slider's value inc/decremented by 1
    });

    //Step 5: click listener for buttons
    $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();
        

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 4 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 4 : index;
        };

        //Step 8: update slider based on above new index
        $('.range-slider').val(index);
        //Step 9: Reassign the current attribute based on the new attributes array index
        updatePropSymbols(mymap, attributesMale[index])
    });

    //Create input listener for slider
    $('.range-slider').on('input', function(){
        //Get the new index value
        var index = $(this).val();
        updatePropSymbols(mymap, attributesMale[index])
    });
};

//Import GeoJSON data and call functions to execute with data AND nested data
function getFemaleData(mymap){
    //load the data
    $.ajax("data/Female_Child_Mortality.geojson", {
        dataType: "json",
        success: function(responseFemale){
            $.ajax("data/Male_Child_Mortality.geojson", {
                dataType: "json",
                success: function(responseMale){
                    //create an attributes array
                    var attributesFemale = processDataFemale(responseFemale);
                    var attributesMale = processDataMale(responseMale);
                    //call function to create proportional symbols
                    createPropSymbolsFemale(responseFemale, mymap, attributesFemale);
                    createPropSymbolsMale(responseMale, mymap, attributesMale);
                    //call function to create an HTML range slider
                    createSequenceControlsFemale(mymap, attributesFemale);
                    createSequenceControlsMale(mymap, attributesMale);
                }
            });
        }
    });
};

//call the initialize function when the document has loaded
$(document).ready(createMap);