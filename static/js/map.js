var margin_map = {top: 60, right: 30, bottom: 30, left: 10},
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
var geo, data, data_sliced;
var selected_data_list;
var selected_data_where_when_list;
var projection, svg_map, svgTransform;
var circles;
var qtree;

var zoom; 

var shiftKey;

var is_LOD_on = true;

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
 
d3.selectAll("input[name='LodOn']").on("change", function(){
    is_LOD_on = (this.value == 'true');
    console.log(is_LOD_on)
    if (is_LOD_on){
        LOD(svg_map, qtree, projection);
    }
    else{
        draw_circles(svg_map, data_sliced, projection);
    }

});

d3.select("#reset_btn")
    .on("click", function() {
        // d3GeoMap(geo, data);
        svg_map.selectAll("circle").style("stroke-width", 0);
        document.getElementById('selection_tips').innerHTML='';
        // svg_map.selectAll("circle").remove();
        
        // if (is_LOD_on){
        //     LOD(svg_map, qtree, projection);
        // }
        // else{
        //     draw_circles(svg_map, data_sliced, projection);
        // }
        // circles = svg_map.selectAll("circle")
        // circles.nodes().forEach(function(d) {
        // d.selected = false;
        // d.previouslySelected = false;
        // });
    })




var colors_dict = {"pickup":"blue", "dropoff":"red", 
    "selected pickup":"green", "selected dropoff":"yellow" }
var legend = d3.select("#legend").append("svg")
    .attr("width", 140)
    .attr("height", 100)
    .selectAll("g.legend")
    .data(Object.keys(colors_dict))
    .enter().append("svg:g")
    .attr("class", "map_legend")
    .attr("transform", function(d, i) { return "translate(10," + (i * 20 + 10) + ")"; });


legend.append("svg:circle")
    .attr("fill", function(d){return colors_dict[d]})
    .attr("r", 3);
legend.append("svg:text")
    .attr("x", 12)
    .attr("dy", ".31em")
    .text(function(d) { return d; });


function d3GeoMap(geo_data, bike_data){
    geo = geo_data;
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

    projection = d3.geoMercator() 
        // .scale(500)
        // .parallels([33, 33])
        // .center([0, -39])
        .rotate([96, -40])
        .fitSize([width_map, height_map], geo_data);
    var path = d3.geoPath().projection(projection);

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

    
    data_sliced = [];
    var len = Object.keys(bike_data).length;// > 5000? 5000:Object.keys(bike_data).length
    for (var i=0; i<len; i++){
        // data_sliced[i] = bike_data[i];
        data_sliced.push(bike_data[i]);
    }
    
    var pickupLoc = [];
    for (var i = 0; i < data_sliced.length; i++){
        if (data_sliced[i]['pickup_long'] != 0 && data_sliced[i]['pickup_lat'] != 0){
            projLoc = projection([data_sliced[i]['pickup_long'], data_sliced[i]['pickup_lat']]); 
            pickupLoc.push({
                x: projLoc[0],
                y: projLoc[1],
                idx: i
            })
        }  
    }
    qtree = new QuadTree(200);
    qtree.constructQuadTree(pickupLoc);
    qtree.draw(svg_map);
    console.log("QuadTree height: ", qtree.countHeight());
    nodeCounter = {
        interiorNum: 0,
        leafNum: 0
    }
    qtree.countQuadNode(nodeCounter);
    console.log("QuadTree nodes: ", nodeCounter);
    if (is_LOD_on){
        LOD(svg_map, qtree, projection);
    }
    else{
        draw_circles(svg_map, data_sliced, projection);
    }
    
    // draw_circles(svg_map, data_sliced, projection);
    
    function zoomed() { 
        svgTransform = d3.event.transform
        svg_map.selectAll(".map_path").attr('transform', d3.event.transform);
        svg_map.selectAll("circle")
            .attr('transform', d3.event.transform)
            .attr("r", 2/d3.event.transform.k)
        svg_map.selectAll("line")
            .attr('transform', d3.event.transform)
            .attr("stroke-width", 2/d3.event.transform.k);
        if (is_LOD_on){
            LOD(svg_map, qtree, projection);
        }
    }

    zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .on("zoom", zoomed);
    
    svg_map.call(zoom);
    brush_on_map();

    circles = svg_map.selectAll("circle")
    circles.nodes().forEach(function(d) {
        d.selected = false;
        d.previouslySelected = false;
    }); 
}

function draw_selected_circles(svg_map, data_, projection){
    svg_map.selectAll(".dropoff").remove();
    svg_map.selectAll(".pickup").remove();
    svg_map.selectAll(".dropoffSel").remove();
    svg_map.selectAll(".pickupSel").remove();

    svg_map.selectAll(".pickupSel")
        .data(data_)
        .enter().append("circle")
        .attr("class", "pickupSel")
        .attr("r", 2)
        .attr("cx", function(d) {
            if (svgTransform)
                return projection([d['pickup_long'], d['pickup_lat']])[0] * svgTransform.k + svgTransform.x;
            else 
                return projection([d['pickup_long'], d['pickup_lat']])[0];})
        .attr("cy", function(d) {
            if (svgTransform)
                return projection([d['pickup_long'], d['pickup_lat']])[1] * svgTransform.k + svgTransform.y;
            else
                return projection([d['pickup_long'], d['pickup_lat']])[1];})
        .style("fill", "green")
        .style("stroke-width", 0.25)
        .style("stroke", "black")
       
    svg_map.selectAll(".dropoffSel")
        .data(data_)
        .enter().append("circle")
        .attr("class", "dropoffSel")
        .attr("r", 2)
        .attr("cx", function(d) {
            if (svgTransform)
                return projection([d['dropoff_long'], d['dropoff_lat']])[0] * svgTransform.k + svgTransform.x;
            else 
                return projection([d['dropoff_long'], d['dropoff_lat']])[0];})
        .attr("cy", function(d) {
            if (svgTransform)
                return projection([d['dropoff_long'], d['dropoff_lat']])[1] * svgTransform.k + svgTransform.y;
            else
                return projection([d['dropoff_long'], d['dropoff_lat']])[1];})
        .style("fill", "yellow")
        .style("stroke-width", 0.25)
        .style("stroke", "black")  
}


function draw_circles(svg_map, data_sliced, projection){
    svg_map.selectAll(".dropoff").remove();
    svg_map.selectAll(".pickup").remove();
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
        .style("stroke-width", 0.25)
        .style("stroke", "black")
       
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
        .style("stroke-width", 0.25)
        .style("stroke", "black")
}

function LOD(svg_map, qtree, projection){
    if (svgTransform)
        sample_rate = Math.min(200, svgTransform.k);
    else 
        sample_rate = 1;
    var selectedFeatures = qtree.rangeQuery(qtree.bbox, sample_rate);

    selected_data_list = []
    for (var i = 0; i < selectedFeatures.length; i++){
        selected_data_list.push(data_sliced[selectedFeatures[i].idx]);
    }

    svg_map.selectAll(".dropoff").remove();
    svg_map.selectAll(".pickup").remove();
    svg_map.selectAll(".pickup")
        .data(selected_data_list)
        .enter().append("circle")
        .attr("class", "pickup")
        .attr("r", 2)
        .attr("cx", function(d) {
            if (svgTransform)
                return projection([d['pickup_long'], d['pickup_lat']])[0] * svgTransform.k + svgTransform.x;
            else 
                return projection([d['pickup_long'], d['pickup_lat']])[0];})
        .attr("cy", function(d) {
            if (svgTransform)
                return projection([d['pickup_long'], d['pickup_lat']])[1] * svgTransform.k + svgTransform.y;
            else
                return projection([d['pickup_long'], d['pickup_lat']])[1];})
        .style("fill", "blue")
        .style("stroke-width", 0.25)
        .style("stroke", "black")
       
    svg_map.selectAll(".dropoff")
        .data(selected_data_list)
        .enter().append("circle")
        .attr("class", "dropoff")
        .attr("r", 2)
        .attr("cx", function(d) {
            if (svgTransform)
                return projection([d['dropoff_long'], d['dropoff_lat']])[0] * svgTransform.k + svgTransform.x;
            else 
                return projection([d['dropoff_long'], d['dropoff_lat']])[0];})
        .attr("cy", function(d) {
            if (svgTransform)
                return projection([d['dropoff_long'], d['dropoff_lat']])[1] * svgTransform.k + svgTransform.y;
            else
                return projection([d['dropoff_long'], d['dropoff_lat']])[1];})
        .style("fill", "red")
        .style("stroke-width", 0.25)
        .style("stroke", "black")
        // .on("mouseenter", function(d) {
        //     d3.select(this)
        //         .style("stroke-width", .25)
        //         .style("stroke", "black")
        // })
}


function updateMapByDate(start_date, end_date){
    document.getElementById('selection_tips').innerHTML = 'select date, updating...';
    // [brushed_data, selected_ids] = get_brushed_data();
    // selected_data_list_dict = Object.assign({}, selected_data_list);
    // console.log('selected_data_list_dict', selected_data_list_dict)
    
    if (selected_data_list.length == 0){
        console.log('selected_data_list length is 0');
        document.getElementById('selection_tips').innerHTML = 'selected_data_list length is 0...';
    }
    else{
        var str = {
            data: Object.assign({}, selected_data_list),
            start: start_date,
            end: end_date,
            select_dataset: select_dataset,
        };
        
        svg_map.selectAll(".dropoff").remove();
        svg_map.selectAll(".pickup").remove();
        $.ajax({
            url: '/post_updateMapByDate',
            data: JSON.stringify(str),
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function(response) {
                var obj = JSON.parse(response.selected_data);
                keys = Object.keys(obj)   
                selected_data_where_when_list = []
                for (var i=0; i<keys.length; i++)
                    selected_data_where_when_list.push(obj[keys[i]])
                document.getElementById('selection_tips').innerHTML='';
                // draw_circles(svg_map, selected_data_list, projection, true);
                draw_selected_circles(svg_map, selected_data_where_when_list, projection)
                // dispatch.call("selecting", this, obj);
            },
            error: function(error) {
                console.log(error);
            }
        });
    }

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


var brushGroup;

function brush_on_map(){
    brushGroup = svg_map.append("g")
        .attr("class", "brush")
        
    d3.select("body").on('keydown', keydownedEvent)
    d3.select("body").on('keyup', keyuppedEvent)
}

function keydownedEvent() {
    const event = d3.event
    if (event.metaKey || event.shiftKey) {   
        console.log('shiftKey down');
        bindBrush(); // disable transform and scale
    } else {
        console.log('unbindBrush');
        unbindBrush();
        d3.selectAll('.pickup').classed("pickupSel", function (p) { return p.selected = false; });
        d3.selectAll('.dropoff').classed("dropoffSel", function (p) { return p.selected = false; });
    }
    shiftKey = event.shiftKey || event.metaKey;
}

function keyuppedEvent() {
	shiftKey = d3.event.shiftKey || d3.event.metaKey;
 }

 function bindBrush() {
    var x=0, y=0, scale=1;
    if(svgTransform){
        x = (0 - svgTransform.x) / svgTransform.k;
        y = (0 - svgTransform.y) / svgTransform.k;
        scale = svgTransform.k
    }
    console.log('bindBrush',x,y,scale)
	brushGroup.call(d3.brush()
        // .extent([[x, y], [(width_map + 100) * (scale), (height_map + 100) * (scale)]])
        .extent([[0,0], [width_map, height_map]])
		.on("start", brushstarted)
		.on("brush", brushed)
		.on("end", brushended))
		.on("click.overlay", function (d) {
			if (circles) {
                circles.classed('pickupSel', false);
                circles.classed('dropoffSel', false);
			}
		});
 }

 function unbindBrush() {
    console.log('unbindBrush')
    var x=0, y=0, scale=1;
    if(svgTransform){
        x = (0 - svgTransform.x) / svgTransform.k;
        y = (0 - svgTransform.y) / svgTransform.k;
        scale = svgTransform.k
    }
    brushGroup.call(d3.brush()
        // .extent([[x, y], [(width_map + 100) * (scale), (height_map + 100) * (scale)]])
        .extent([[0,0], [width_map, height_map]])
        .on(".brush", null));
    brushGroup.selectAll('*').remove();
    brushGroup.attr('fill', false)
        .attr('pointer-events', false)
        .attr('style', false)
}

function brushstarted() {
   if (d3.event.sourceEvent.type !== "end") {
        d3.selectAll('.pickup').classed("pickupSel", function (d) {
           return d.selected = d.previouslySelected = shiftKey && d.selected;
       });
       d3.selectAll('.dropoff').classed("dropoffSel", function (d) {
        return d.selected = d.previouslySelected = shiftKey && d.selected;
    });
   }
}

function brushed() {
    if (d3.event.sourceEvent.type !== "end") {
        var selection = d3.event.selection;
        let x0, y0, x1, y1;
        if (selection) {
            x0 = selection[0][0];
            x1 = selection[1][0];
            y0 = selection[0][1];
            y1 = selection[1][1];
            if(svgTransform){
                x0 = (x0 - svgTransform.x) / svgTransform.k;
                x1 = (x1 - svgTransform.x) / svgTransform.k;
                y0 = (y0 - svgTransform.y) / svgTransform.k;
                y1 = (y1 - svgTransform.y) / svgTransform.k;
            }
        }
        var selectedRect = new Envelope(x0, x1, y0, y1);
        var selectedFeatures = qtree.rangeQuery(selectedRect, 200);

        selected_data_list = []
        for (var i = 0; i < selectedFeatures.length; i++){
            selected_data_list.push(data_sliced[selectedFeatures[i].idx]);
        }
        
        svg_map.selectAll(".pickupSel").remove();
        svg_map.selectAll(".pickupSel")
            .data(selected_data_list)
            .enter().append("circle")
            .attr("class", "pickupSel")
            .attr("r", 2)
            .attr("cx", function(d) {
                if (svgTransform)
                    return projection([d['pickup_long'], d['pickup_lat']])[0] * svgTransform.k + svgTransform.x;
                else 
                    return projection([d['pickup_long'], d['pickup_lat']])[0];})
            .attr("cy", function(d) {
                if (svgTransform)
                    return projection([d['pickup_long'], d['pickup_lat']])[1] * svgTransform.k + svgTransform.y;
                else
                    return projection([d['pickup_long'], d['pickup_lat']])[1];})
            .style("fill", "green")
            .style("stroke-width", 0.25)
            .style("stroke", "black");

        
        svg_map.selectAll(".dropoffSel").remove();
        svg_map.selectAll(".dropoffSel")
            .data(selected_data_list)
            .enter().append("circle")
            .attr("class", "dropoffSel")
            .attr("r", 2)
            .attr("cx", function(d) {
                if (svgTransform)
                    return projection([d['dropoff_long'], d['dropoff_lat']])[0] * svgTransform.k + svgTransform.x;
                else 
                    return projection([d['dropoff_long'], d['dropoff_lat']])[0];})
            .attr("cy", function(d) {
                if (svgTransform)
                    return projection([d['dropoff_long'], d['dropoff_lat']])[1] * svgTransform.k + svgTransform.y;
                else
                    return projection([d['dropoff_long'], d['dropoff_lat']])[1];})
            .style("fill", "yellow")
            .style("stroke-width", 0.25)
            .style("stroke", "black")
        // let dx, dy; 
        // svg_map.selectAll('circle.pickup').classed("selected", function (d) {
        //     if(svgTransform){
        //         dx = projection([d['pickup_long'], d['pickup_lat']])[0] * svgTransform.k + svgTransform.x;
        //         dy = projection([d['pickup_long'], d['pickup_lat']])[1] * svgTransform.k + svgTransform.y;
        //     }
        //     else{
        //         dx = projection([d['pickup_long'], d['pickup_lat']])[0];
        //         dy = projection([d['pickup_long'], d['pickup_lat']])[1];
        //     }
        //     return d.selected = d.previouslySelected ^
        //            (selection != null && x0 <= dx && dx < x1&& y0 <= dy && dy < y1);
        // });
        // svg_map.selectAll('circle.dropoff').classed("selected", function (d) {
        //     if(svgTransform){
        //         dx = projection([d['dropoff_long'], d['dropoff_lat']])[0] * svgTransform.k + svgTransform.x;
        //         dy = projection([d['dropoff_long'], d['dropoff_lat']])[1] * svgTransform.k + svgTransform.y;
        //     }
        //     else{
        //         dx = projection([d['dropoff_long'], d['dropoff_lat']])[0];
        //         dy = projection([d['dropoff_long'], d['dropoff_lat']])[1];
        //     }
        //     return d.selected = d.previouslySelected ^
        //            (selection != null && x0 <= dx && dx < x1&& y0 <= dy && dy < y1);
        // });

        // svg_map.selectAll('circle.selected')
        //     .style("fill", "green")
        //     .style("stroke-width", .25)
        //     .style("stroke", "black")
    }
}

function brushended() {
    if (d3.event.selection != null) {
        d3.select(this).call(d3.event.target.move, null);
    }
}
