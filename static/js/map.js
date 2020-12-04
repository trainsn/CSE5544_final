var margin_map = {top: 20, right: 30, bottom: 30, left: 10},
    width_map  = 600 - margin_map.left - margin_map.right,
    height_map = 600 - margin_map.top - margin_map.bottom;

function drawMap(select_data){
    d3.select("#map").selectAll("*").remove();
    d3.select("#map").append("svg")
        .attr("width", width_map + margin_map.left + margin_map.right)
        .attr("height", height_map + margin_map.top + margin_map.bottom)
        .append("text")
        .text('loading...')
        .attr("transform", "translate(60, 100)");
    getData_drawMap(select_data)
}

var select_data = 'Taxi'
drawMap(select_data)


// var allGroup = d3.map(data, function(d){return(d.name)}).keys()
var allDataset = ['Taxi', 'Bike']
d3.select("#selectDatasetBtn")
    .selectAll('DatasetOptions')
    .data(allDataset)
    .enter().append('option')
    .text(function (d) { return d; }) 
    .attr("value", function (d) { return d; }) 
    
d3.select("#selectDatasetBtn")
    .on("change", function(d) {
        select_data = d3.select(this).property("value")
        console.log('select_data', select_data)
        drawMap(select_data)
    })
        
//  function init() {
//     var opts = {
//         lines: 9, // The number of lines to draw
//         length: 9, // The length of each line
//         width: 5, // The line thickness
//         radius: 14, // The radius of the inner circle
//         color: '#EE3124', // #rgb or #rrggbb or array of colors
//         speed: 1.9, // Rounds per second
//         trail: 40, // Afterglow percentage
//         className: 'spinner', // The CSS class to assign to the spinner
//       };
//     var target = document.getElementById('map');
//     var spinner = new Spinner(opts).spin(target);
//     setTimeout(function() {
//         select_data = 'Taxi'
//         getData_drawMap(select_data)
//     }, 2000);
// } 
// init();

function d3GeoMap(geo_data, bike_data){
    // var container_map = d3.select("body").append("div")
    //     .attr("id", "map")
    d3.select("#map").selectAll("*").remove();
    var container_map = d3.select("#map").append("div")
        .style("width", width_map + margin_map.left + margin_map.right + "px")
        .style("height", height_map + margin_map.top + margin_map.bottom + "px");

    function zoomed() { 
        d3.selectAll(".map_path").attr('transform', d3.event.transform);
        d3.selectAll("circle").attr('transform', d3.event.transform);
    }

    var zoom = d3.zoom()
        .scaleExtent([0.2, 10])
        .on("zoom", zoomed);
    
    var svg_map = container_map.append("svg")
        .attr("id", "svg_map")
        .attr("width", width_map + margin_map.left + margin_map.right)
        .attr("height", height_map + margin_map.top + margin_map.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_map.left + "," + margin_map.top + ")");

    svg_map.call(zoom);
    
    // var projection = d3.geoMercator().scale(100).center([400,40]);
    // var geoGenerator = d3.geoPath().projection(projection);
    var projection = d3.geoMercator() 
        // .scale(500)
        // .parallels([33, 33])
        // .center([0, -39])
        .rotate([96, -40])
        .fitSize([width_map, height_map], geo_data);

    console.log('geo_data', geo_data)
        
    var path = d3.geoPath()
        .projection(projection);

    svg_map.selectAll(".map_path")
        .data(geo_data.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "map_path")
        .attr("fill", "Gray") 
        .style("stroke", "#ffff") 
        .style("stroke-width", .25)
        .style("stroke-dasharray", 1)
        .on("mouseenter", function(d) {
            d3.select(this)
                .style("stroke-width", 1.5)
                .style("stroke-dasharray", 0)
                .attr("fill", "DarkGoldenRod") 
            d3.select("#neighborhoodPopover")
                .transition()
                .style("opacity", 1)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px")
                .text(function(){
                    if (select_data == 'Bike') return d.properties.name;
                    else return d.properties.neighborhood;
                })
        })
        .on("mouseleave", function(d) { 
            d3.select(this)
                .style("stroke-width", .25)
                .style("stroke-dasharray", 1)
                .attr("fill", "Gray") 
            d3.select("#neighborhoodPopover")
                .transition()
                .style("opacity", 0);
        });
    
    var data_sliced = [];
    var len = Object.keys(bike_data).length > 2000? 2000:Object.keys(bike_data).length
    for (var i=0; i<len; i++)
        data_sliced[i] = bike_data[i];
    console.log(select_data, 'data', data_sliced , Object.keys(data_sliced).length)

    svg_map.selectAll(".pickup")
        .data(data_sliced)
        .enter().append("circle")
        .attr("class", "pickup")
        .attr("r", 2)
        .attr("cx", function(d) {
            if (select_data == 'Bike'){
                return projection([d['Start Station Longitude'], d['Start Station Latitude']])[0]; }
            else{
                return projection([d['pickup_long'], d['pickup_lat']])[0];}})
        .attr("cy", function(d) {
            if (select_data == 'Bike'){
                return projection([d['Start Station Longitude'], d['Start Station Latitude']])[1]; }
            else{
                return projection([d['pickup_long'], d['pickup_lat']])[1];}})
        .style("fill", "blue")
        .on("mouseenter", function(d) {
            // console.log('pickup', d);
            d3.select(this)
                .style("stroke", "black")
        })


    svg_map.selectAll(".dropoff")
        .data(data_sliced)
        .enter().append("circle")
        .attr("class", "dropoff")
        .attr("r", 2)
        .attr("cx", function(d) {
            if (select_data == 'Bike'){
                return projection([d['End Station Longitude'], d['End Station Latitude']])[0]; }
            else{
                return projection([d['dropoff_long'], d['dropoff_lat']])[0];}})
        .attr("cy", function(d) {
            if (select_data == 'Bike'){
                return projection([d['End Station Longitude'], d['End Station Latitude']])[1]; }
            else{
                return projection([d['dropoff_long'], d['dropoff_lat']])[1];}})
        .style("fill", "red")
        .on("mouseenter", function(d) {
            // console.log('dropoff',d);
            d3.select(this)
                .style("stroke", "black")
        })
}
