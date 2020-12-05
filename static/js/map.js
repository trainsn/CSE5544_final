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

var allDataset = ['Taxi', 'Bike']
var select_dataset = 'Taxi';
var data, projection, svg_map;
drawMap(select_dataset)


d3.select("#selectDatasetBtn")
    .selectAll('DatasetOptions')
    .data(allDataset)
    .enter().append('option')
    .text(function (d) { return d; }) 
    .attr("value", function (d) { return d; }) 
    
d3.select("#selectDatasetBtn")
    .on("change", function(d) {
        select_dataset = d3.select(this).property("value")
        console.log('select_dataset', select_dataset)
        drawMap(select_dataset)})
 

function d3GeoMap(geo_data, bike_data){
    data = bike_data;
    d3.select("#map").selectAll("*").remove();

    var container_map = d3.select("#map").append("div")
    .style("width", width_map + margin_map.left + margin_map.right + "px")
    .style("height", height_map + margin_map.top + margin_map.bottom + "px");

    svg_map = container_map.append("svg")
        .attr("id", "svg_map")
        .attr("width", width_map + margin_map.left + margin_map.right)
        .attr("height", height_map + margin_map.top + margin_map.bottom)
        .append("g")
        .attr("transform", "translate(" + margin_map.left + "," + margin_map.top + ")");

    function zoomed() { 
        d3.selectAll(".map_path").attr('transform', d3.event.transform);
        d3.selectAll("circle").attr('transform', d3.event.transform);
    }

    var zoom = d3.zoom()
        .scaleExtent([0.2, 10])
        .on("zoom", zoomed);
    
    svg_map.call(zoom);
    svg_map.call(brush.extent([[0,0], [100, 100]]));  
    
    // var projection = d3.geoMercator().scale(100).center([400,40]);
    // var geoGenerator = d3.geoPath().projection(projection);
    projection = d3.geoMercator() 
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
                    if (select_dataset == 'Bike') return d.properties.name;
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
    console.log(select_dataset, 'data', data_sliced , Object.keys(data_sliced).length)
    
    draw_circles(svg_map, data_sliced, projection)
}

function draw_circles(svg_map, data_sliced, projection){
    svg_map.selectAll(".pickup")
        .data(data_sliced)
        .enter().append("circle")
        .attr("class", "pickup")
        .attr("r", 2)
        .attr("cx", function(d) {
            if (select_dataset == 'Bike'){
                return projection([d['Start Station Longitude'], d['Start Station Latitude']])[0]; }
            else{
                return projection([d['pickup_long'], d['pickup_lat']])[0];}})
        .attr("cy", function(d) {
            if (select_dataset == 'Bike'){
                return projection([d['Start Station Longitude'], d['Start Station Latitude']])[1]; }
            else{
                return projection([d['pickup_long'], d['pickup_lat']])[1];}})
        .style("fill", "blue")
        .on("mouseenter", function(d) {
            d3.select(this)
                .style("stroke", "black")
        })

    svg_map.selectAll(".dropoff")
        .data(data_sliced)
        .enter().append("circle")
        .attr("class", "dropoff")
        .attr("r", 2)
        .attr("cx", function(d) {
            if (select_dataset == 'Bike'){
                return projection([d['End Station Longitude'], d['End Station Latitude']])[0]; }
            else{
                return projection([d['dropoff_long'], d['dropoff_lat']])[0];}})
        .attr("cy", function(d) {
            if (select_dataset == 'Bike'){
                return projection([d['End Station Longitude'], d['End Station Latitude']])[1]; }
            else{
                return projection([d['dropoff_long'], d['dropoff_lat']])[1];}})
        .style("fill", "red")
        .on("mouseenter", function(d) {
            d3.select(this)
                .style("stroke", "black")
        })
}

function updateMapByDate(start_date, end_date){
    d3.selectAll(".dropoff").remove();
    d3.selectAll(".pickup").remove();
    document.getElementById('selection_tips').innerHTML = 'select date, loading...';
    var str;
    if (select_dataset == 'Bike'){
        console.log('select Bike')
        str = {
            data: data,
            start: start_date,
            end: end_date,
            select_dataset: 'Bike',
        };}
    else{
        console.log('select Taxi')
        str = {
            data: data,
            start: start_date,
            end: end_date,
            select_dataset: 'Taxi',
        };}

    $.ajax({
        url: '/post_updateMapByDate',
        data: JSON.stringify(str),
        type: 'POST',
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function(response) {
            var obj = JSON.parse(response.selected_data);
            keys = Object.keys(obj)   
            selected_data_list = []
            for (var i=0; i<keys.length; i++)
                selected_data_list.push(obj[keys[i]])
            // d3.selectAll(".dropoff").remove();
            document.getElementById('selection_tips').innerHTML='';
            draw_circles(svg_map, selected_data_list, projection);
            // dispatch.call("selecting", this, obj);

        },
        error: function(error) {
            console.log(error);
        }
    });
}

// dispatch = d3.dispatch("selecting");
// dispatch.on("selecting", function (selected_data){
//     d3.selectAll(".dropoff").remove();
//     d3.selectAll(".pickup").remove();
//     console.log('selected_data', Object.keys(selected_data))
//     keys = Object.keys(selected_data)
//     selected_data_list = []
//     // draw_circles(svg_map, selected_data, projection)
//     for (var i=0; i<keys.length; i++)
//         selected_data_list.push(selected_data[keys[i]])
//     draw_circles(svg_map, selected_data_list, projection)
// });

var brush = d3.brush() 
	.on("start", brushstart) 
	.on("brush", brush)
	.on("end", brushend); 

function brushstart(p) {
	console.log(brush.data, p, brush.data !== p)
	svg_map.call(d3.brush().move)
}

function brush(p) {
	svg_map.selectAll("circle").attr('class', 'unselected');
	var selection = d3.event.selection;
	if (selection){
		svg_map.selectAll("circle").classed("selected", function(d){
            console.log('d', d)
			return rectContains(selection, x[p.x](d[p.x]), y[p.y](d[p.y]));
		});
		svg_map.selectAll("circle.selected").attr('class', function(d) { return d.species; });
	}
}

function rectContains(brush_coords, cx, cy) {
	var x0 = brush_coords[0][0],
	x1 = brush_coords[1][0],
	y0 = brush_coords[0][1],
	y1 = brush_coords[1][1];
	return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    
}

function brushend() {
	var selection = d3.event.selection;
	if (!selection){
		svg_map.selectAll("circle").attr('class', function(d) { return d.species; });
		svg_map.call(d3.brush().move);
	}
}
