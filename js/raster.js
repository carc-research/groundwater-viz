 let map = L.map('map',{layers: baseLayers,scrollWheelZoom:false,maxZoom : 10}).setView([31.4, -99.5], 6);

        /* Dark basemap */

    var baseLayers = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd'
    }).addTo(map);

    var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
    });
        
    var soil = L.esri.dynamicMapLayer({
        url: 'https://services.arcgisonline.com/arcgis/rest/services/Specialty/Soil_Survey_Map/MapServer',
        opacity: 0.7,
        
    })

    var baseMaps = {
        "Base Map": baseLayers,
        "Esri": Esri_WorldStreetMap
    };

    var overlayMaps = {
        "Soil Distribuition": soil
    };

    L.control.layers(baseMaps,overlayMaps).addTo(map);



  /* Well Stations Clustering  */
   var markers =L.markerClusterGroup();

//    $.getJSON("well.geojson", function(json) {
   $.getJSON("GW-TWDB-USGS2.geojson", function(json) {
    // console.log(json.features); // this will show the info it in firebug console
        var geoJsonLayer = L.geoJson(json, {   
			onEachFeature: function (feature, layer) {
                console.log(feature.length)
                 var popup = 
                             '<br/><b>County</b> ' + feature.properties.County_Nam +
                             '<br/><b>Elevation(ft)</b> ' + feature.properties.Elev_ft +
                             '<br/><b>Well Depth(ft)</b> ' + feature.properties.Well_Depth +
                             '<br/><b>Well Number</b> ' + feature.properties.Well_no +
                             '<br/><b>Well Source</b> ' + feature.properties.Remarks 

				layer.bindPopup(popup);
        }
		});

        // console.log(json)
             markers.addLayer(geoJsonLayer);
             map.addLayer(markers);
             map.fitBounds(markers.getBounds());
    });
    





    

  


      /* Load Raster Datasets */


   function loadData (){
    $('#datetimepicker').datepicker({
        format: 'dd-MM-yyyy',
        language: 'en',
      })
      .on("changeDate",function data(e){
       $('#datetimepicker').attr('value',e.format());
         var formatedValue = e.format();
         console.log(formatedValue)

        var dataFile = 'tif/' + formatedValue + '.tif';


        /* GeoTIFF with n bands */
        d3.request(dataFile).responseType('arraybuffer').get(
            function (error, tiffData) {
                let scalarFields = L.ScalarField.multipleFromGeoTIFF(tiffData.response);
                let legend = {};
                let bounds = {};

                
                scalarFields.forEach(function (sf, index) {
                    let layerSf = L.canvasLayer.scalarField(sf, {
                        color: chroma.scale('Reds').domain(sf.range),
                        opacity: 0.65
                    }).addTo(map);

                    layerSf.on('click', function (e) {
                        if (e.value !== null) {
                            let v = e.value.toFixed(0);
                            let html = ('<span class="popupText">GWL: ' + v + ' ft </span>');
                            L.popup()
                                .setLatLng(e.latlng)
                                .setContent(html)
                                .openOn(map);
                        }
                    });


                //     function drawMap (scalarFields){ 
                //         map.eachLayer(function (layerSf) {
                //      map.remove();
                //     });
                    
                // };

               

                    legend["2017 data " + index] = layerSf;

                    bounds = layerSf.getBounds();

                // drawMap()
                });


             

                
                // Layers control
                L.control.layers(legend, {}, {
                    position: 'bottomleft',
                    collapsed: false
                }).addTo(map);

                L.control.scale({position:'bottomright'}).addTo(map);
	            L.Control.geocoder({position:'topright', showResultIcons:true}).addTo(map)

                map.fitBounds(bounds);
             

            });
        
      });

    }
    
loadData();
// Update();


// function Update() {
 
//     // d3.selectAll(map).remove();

//     loadData();

//     // map.remove();
    
// }


function Update(tile){ 
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });
    map.addLayer(tile);
}


$(document).ready(function(){
  $('.dropdown-submenu a.test').on("click", function(e){
    $(this).next('ul').toggle();
    e.stopPropagation();
    e.preventDefault();
  });
});