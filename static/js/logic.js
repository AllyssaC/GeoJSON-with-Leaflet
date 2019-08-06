
// API query URL
//Query to search for this weeks significant earthquakes didn't render many results so I opted for all quakes (1st link for significant)
//var QuakesLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson";
var QuakesLink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var TectonicPlatesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

//Perform a GET request
d3.json(QuakesLink, function (data) {
  createFeatures(data.features)
});
//function to determine circle size based on magnitude of quake
function getRadius(magnitude) {
  return magnitude *10000;
}
colors = ['rgb(242,240,247)','rgb(203,201,226)','rgb(158,154,200)','rgb(117,107,177)','rgb(84,39,143)']

//function to get color of circle based on magnitude of quake

function getColor(magnitude) {
  switch (true) {
    case magnitude > 6:
      return 'rgb(129,15,124)';
    case magnitude > 5:
      return 'rgb(84,39,143)';
    case magnitude > 4:
      return 'rgb(117,107,177)';
    case magnitude > 3:
      return 'rgb(158,154,200)';
    case magnitude > 2:
      return 'rgb(203,201,226)';
    case magnitude > 1:
      return 'rgb(242,240,247)';
  }


  // return magnitude > 1 ? 'rgb(242,240,247)'  :
  //        magnitude > 2 ? 'rgb(203,201,226)' :
  //        magnitude > 3 ? 'rgb(158,154,200)' : 
  //        magnitude > 4 ? 'rgb(117,107,177)' :
  //        magnitude > 5 ? 'rgb(84,39,143)':
  //                       'rgb(129,15,124)';
 
}

function createFeatures(earthquakeData) {
  // Create a GeoJSON layer containing the features array on the object
  // Run onEachFeature function once for each interation of the array
  var earthquakes = L.geoJson (earthquakeData, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>Location: " + feature.properties.place + "<br>Magnitude: " + feature.properties.mag +
      "</h3><hr><h4> Date & Time: " + new Date(feature.properties.time) + "</h4>");
    },
    pointToLayer: function (feature,latLng){
      return new L.circle(latLng,{
         radius: getRadius(feature.properties.mag),
          // fillcolor: getColor(feature.properties.mag),
          fillOpacity: .5,
          stroke: true,
          color: getColor(feature.properties.mag),
          weight: .5

        })
    },
  });
    //send earthquakes layer to createMap function
    createMap(earthquakes)
  }
  function createMap(earthquakes) {
    // Define streetmap and satellite layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.streets",
      accessToken: API_KEY
    });
    
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "mapbox.satellite",
      accessToken: API_KEY
    });
    //Add techtonic plate layer
    var tectonicPlates = new L.LayerGroup();

    //Define a basemap object to hold base layers
    var baseMaps   = {
      "Street Map": streetmap,
      "Satellite Map": satellite
    };

    //create overlay object to hold overlay layers
    var overlayMap = {
      Earthquakes: earthquakes,
      Techtonic_Plates: tectonicPlates 
    };

    // Define a map object, establish layers to display on load
    var myMap = L.map("map", {
      center: [ 37.7, -122.2],
      zoom: 5,
      layers: [streetmap, satellite, tectonicPlates, earthquakes]
    });

    //add tectonicPlates data
    d3.json(TectonicPlatesLink, function (plateData) {
      L. geoJson(plateData, {
          color: "blue",
          weight: 2.5
      }).addTo(tectonicPlates)  
      
    });
    //Add layer control to map
    L.control.layers(baseMaps, overlayMap, {
      collapsed: false  
    }).addTo(myMap);

    //Legend
    var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (myMap) { 
      var div = L.DomUtil.create('div', 'info legend'),
      labels = ['<strong>Magnitude</strong>'],
      grades = [5,4,3,2,1];
      
      for (var i = 0; i < grades.length; i++) {
            div.innerHTML += 
           
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i +1] ? '&ndash;' + grades[i + 1] + '<br>': '>');
          }
     
        
      return div;
    };
  
 
    legend.addTo(myMap);
}
