
function print(value, callback){
    callback(null, null);
}

function getData_drawMap(is_bike){
    if (is_bike == 'Bike'){
        queue()
            .defer(d3.json, geo_njcDataUrl)
            .defer(d3.json, njcBikeDataUrl)
            .defer(print, "Bike")
            .await(ready);
    }
    else{
        queue()
            .defer(d3.json, geo_nycDataUrl)
            .defer(d3.json, nycTaxiDataUrl)
            .defer(print, "Taxi")
            .await(ready);
    }

}

function ready(error, geo_data, bike_data) {
    d3GeoMap(geo_data, bike_data);
    // d3BarChart(datasetBarChart);
}
