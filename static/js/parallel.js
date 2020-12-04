var margin = {top: 20, right: 30, bottom: 30, left: 10},
    width  = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var devicePixelRatio = window.devicePixelRatio || 1;

// var color = d3.scaleOrdinal()
//   .domain(["Radial Velocity", "Imaging", "Eclipse Timing Variations", "Astrometry", "Microlensing", "Orbital Brightness Modulation", "Pulsar Timing", "Pulsation Timing Variations", "Transit", "Transit Timing Variations"])
//   .range(["#DB7F85", "#50AB84", "#4C6C86", "#C47DCB", "#B59248", "#DD6CA7", "#E15E5A", "#5DA5B3", "#725D82", "#54AF52", "#954D56", "#8C92E8", "#D8597D", "#AB9C27", "#D67D4B", "#D58323", "#BA89AD", "#357468", "#8F86C2", "#7D9E33", "#517C3F", "#9D5130", "#5E9ACF", "#776327", "#944F7E"]);

// shim layer with setTimeout fallback
// window.requestAnimFrame = (function(){
//   return window.requestAnimationFrame       ||
//          window.webkitRequestAnimationFrame ||
//          window.mozRequestAnimationFrame    ||
//          window.oRequestAnimationFrame      ||
//          window.msRequestAnimationFrame     ||
//          function( callback ){
//            window.setTimeout(callback, 1000 / 60);
//          };
// })();

var container_pc= d3.select("body").append("div")
    .attr("id", "parcoords")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px");
var svg_PC = container_pc.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// var canvas = container_pc.append("canvas")
//     .attr("width", width * devicePixelRatio)
//     .attr("height", height * devicePixelRatio)
//     .style("width", width + "px")
//     .style("height", height + "px")
//     .style("margin-top", margin.top + "px")
//     .style("margin-left", margin.left + "px");
//
// var ctx = canvas.node().getContext("2d");
// ctx.globalCompositeOperation = 'darken';
// ctx.globalAlpha = 0.15;
// ctx.lineWidth = 1.5;
// ctx.scale(devicePixelRatio, devicePixelRatio);


var xVars = Array.from(Array(16), (x, i) => i); //hidden_size
var x = d3.scalePoint().range([0, width]).domain(xVars);
var dragging = {},
    y = {};

var background,
    foreground;

// function updatePCs_old(lat_data, selected_ids){
//     var colorgen =d3.scaleBand()
//     .range(["#a6cee3","#1f78b4","#b2df8a","#33a02c",
//             "#fb9a99","#e31a1c","#fdbf6f","#ff7f00",
//             "#cab2d6","#6a3d9a","#ffff99","#b15928"]);
//
//     var color = function(d) { return colors(d.group); };
//
//     var parcoords = d3.parcoords ()("#example-progressive")
//     .data(lat_data)
//     .hideAxis(["name"])
//     .color(color)
//     .alpha(0.25)
//     .composite("darken")
//     .margin({ top: 24, left: 150, bottom: 12, right: 0 })
//     .mode("queue")
//     .render()
//     .brushMode("1D-axes");  // enable brushing
//
//     parcoords.svg.selectAll("text")
//     .style("font", "10px sans-serif");
// }



function updatePCs(lat_data, selected_ids, sortBy, performers){
    console.log('in PC',lat_data, selected_ids);
    d3.selectAll("path.line").remove();
    d3.selectAll(".axis").remove();

    var length = selected_ids.length;

    for (i in xVars){
        y[i] = d3.scaleLinear()
            .domain(d3.extent(lat_data, function(d) { return +d["lat"][i]; }) )
            .range([height, 0])
    }

    // for (i in xVars){
    //     y[i] = d3.scaleLinear()
    //         .domain([-1,1])
    //         .range([height, 0])
    // }

    // background = svg_PC.append("g")
    //     .attr("class", "background")
    //     .selectAll("path")
    //         .data(lat_data)
    //     .enter().append("path")
    //         .attr("d", valueline);


    foreground = svg_PC.append("g")
        .attr("class", "foreground")
        .selectAll("path")
            .data(lat_data)
        .enter().append("path")
            .attr("class", "line")
            .attr("d", valueline)
            .attr('stroke', function(d) {
                // console.log(colorScale_tsne(d["performer"]), d["performer"])
                // return colorScale_tsne(d["performer"]);
                return d3.interpolateTurbo(performers.indexOf(d["performer"]) / performers.length)
            });


    // Add a group element for each dimension.
    var axes = svg_PC.selectAll(".axis")
            .data(xVars)
        .enter().append("g")
            .attr("class", "axis")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // .call(d3.drag()
        //     .subject(y)
        //     .on("start", function () {
        //         dragging[d] = x(d);
        //         background.attr("visibility", "hidden");
        //     })
        //     .on("drag", function(d) {
        //         dragging[d] = Math.min(width, Math.max(0, d3.event.x));
        //         foreground.attr("d", valueline);
        //         xVars.sort(function(a, b) { return position(a) - position(b); });
        //         x.domain(xVars);
        //         axes.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        //     })
        //     .on("end", function(d) {
        //         console.log("indragging",dragging, d)
        //         delete dragging[d];
        //         transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
        //         transition(foreground).attr("d", valueline);
        //         background
        //             .attr("d", valueline)
        //             .transition()
        //                 .delay(500)
        //                 .duration(0)
        //                 .attr("visibility", null);
        //     }));

    // Add an axis and title.
    axes.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[sortBy[d]]).tickFormat(""));})
        .append("text")
            .style("text-anchor", "middle")
            .attr("y", -9)
            .text(function(d) {
                // console.log("in pc", sortBy[d]);
                return sortBy[d]; })
            .style("fill", "black");

    // Add and store a brush for each axis.
    axes.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(y[d].brush = d3.brushY()
                .extent([[-8,0], [10, height]])
                // .extent([[-8, 0], [8, height]])
                .on("start", brushstart)
                .on("brush", brush)
                .on("end", brushend));
        })
        .selectAll("rect")
            .attr("x", -5)
            .attr("width", 10);
}


function updatePCs111(lat_data, selected_ids){
    var length = (selected_ids.length >= 100) ? 100 : selected_ids.length;

    for (i in xVars){
        y[i] = d3.scaleLinear()
            .domain(d3.extent(lat_data, function(d) { return +d["lat"][i]; }) )
            .range([height, 0])
    }

    // Render full canvas
    paths(lat_data, ctx, brush_count);

    var axes = svg_PC.selectAll(".axis")
            .data(xVars)
        .enter().append("g")
            .attr("class", "axis")
            .attr("transform", function(d) { return "translate(" + x(d) + ")"; })

    axes.append("g")
        .attr("class", "yaxis")
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d]).tickFormat(""));})
        .append("text")
            .attr("class", "title")
            .attr("text-anchor", "start")
            .text(function(d) { return d; });
        // .append("text")
        //     .style("text-anchor", "middle")
        //     .attr("y", -9)
        //     .text(function(d) { return d; });

    axes.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(y[d].brush = d3.brushY()
                .extent([[-10,0], [10, height]])
                // .extent([[0, 0], [width, height]])
                // .on("start", brushstart)
                .on("brush", brush)
                // .on("end", brush)
            )
            console.log("y[d].brush", y[d].brush, y[d].brush==null,y[d].brush.extent())
        })
        .selectAll("rect")
            .attr("x", -8)
            .attr("width", 16);

    function brush() {
        brush_count++;
        var actives = xVars.filter(function(p) { return !y[p].brush.empty(); }),
            extents = actives.map(function(p) { return y[p].brush.extent(); });
        console.log('actives and extents,', actives, extents);

        // Get lines within extents
        var selected = [];
        lat_data.map(function(d) {
            console.log("in brush d:",d)
            return actives.every(function(p, i) {
                console.log("in brush p:",p)
                return extents[i][0] <= d["lat"][p] && d["lat"][p] <= extents[i][1]; }) ? selected.push(d) : null;
        });
        console.log("selected", selected)

        // Render selected lines
        canvas.clearRect(0,0,w+1,h+1);
        paths(selected, ctx, brush_count);
    }

    function paths(data, ctx, count) {
        var n = data.length,
            i = 0,
            reset = false;
        console.log('n and i', n, i);
        function render() {
            var max = d3.min([i+60, n]);
            lat_data.slice(i, max).forEach(function(d) {
                path(d, ctx, "black");
            });
            i = max;
         };

        (function animloop(){
            if (i >= n || count < brush_count) return;
            requestAnimFrame(animloop);
            render();
        })();
    };


    // for(var k=0; k<length; k++){
    //     for(var i=1;i<64;i++){
    //         ctx.beginPath();
    //         ctx.moveTo(x(i-1),  y[i-1](lat_data[k]["lat"][i-1]) );
    //         ctx.lineTo(x(i), y[i](lat_data[k]["lat"][i])  );
    //         ctx.stroke();
    //         ctx.closePath();
    //         console.log('----', x(i-1), y[i-1](lat_data[k]["lat"][i-1]))
    //     }
    // }

}


function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
}

function transition(g) {
    return g.transition().duration(500);
}


function brushstart(selectionName) {
    if(d3.event.sourceEvent !== null) {
        // console.log("d3.event.sourceEvent!=null----selectionName", selectionName, d3.event.sourceEvent)
        d3.event.sourceEvent.stopPropagation();
    }
}

function valueline(d) {
    return d3.line()(xVars.map( function(p) {
        // console.log(x(p), y[p](d["lat"][p]), 'x and y', d)
        return [x(p), y[p](d["lat"][p])]; }));
}

// function path(d, ctx, color) {
//   ctx.beginPath();
//   xVars.map(function(p,i) {
//         if (i == 0) {
//             ctx.moveTo(x(p),y[p](d["lat"][p]));
//         } else {
//         ctx.lineTo(x(p),y[p](d["lat"][p]));
//         }
//   });
//   ctx.stroke();
// };


function brush() {
    if (!d3.event.sourceEvent) return;
    var selection = d3.event.selection;
    if (!selection) return; // Ignore empty selections.


    var actives = [];
    svg_PC.selectAll(".axis .brush")
        .filter(function (d) {
            return d3.brushSelection(this);
        })
        .each(function (d){
            actives.push({
                xVar: d,
                extent: d3.brushSelection(this)
            })
        });
    foreground.style("display", function(d){
        return actives.every(function(active, i){
            return active.extent[0] <= y[active.xVar](d["lat"][active.xVar]) && y[active.xVar](d["lat"][active.xVar]) <= active.extent[1];}) ? null : "none";
    });

}


function brushend(d) {
    console.log("brush end now", d)
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.

    // not working
    d3.select(this).select('.brush').call(y[d].brush.move, null) ;

    // var d0 = d3.event.selection.map(y[d].invert);
    // d3.select(this).call(d3.event.target.move, d0.map(y[d]));

    // extents = []
    // for(var i=0;i<xVars.length;++i){
    //     if(d3.event.target==y[xVars[i]].brush) {
    //         extents[i]=d3.event.selection.map(y[xVars[i]].invert, y[xVars[i]]);
    //         extents[i][0] = Math.round( extents[i][0] * 10 ) / 10;
    //         extents[i][1] = Math.round( extents[i][1] * 10 ) / 10;
    //         d3.select(this).transition().call(d3.event.target.move, extents[i].map(y[xVars[i]]));
    //
    //         // var yScale = y[xVars[i]];
    //         // var selected =  yScale.domain().filter(function(d){
    //         //     // var s = d3.event.target.extent();
    //         //     var s = d3.event.selection;
    //         //     console.log('s  end ,,,', s, yScale(d))
    //         //     return (s[0] <= yScale(d)) && (yScale(d) <= s[1])
    //         // });
    //         // var temp = selected.sort()
    //         // extents[i] = [temp[temp.length-1], temp[0]];
    //         //
    //         // if(selected.length >1)
    //         //     d3.select(this).transition().call(d3.event.target.move, extents[i].map(y[xVars[i]]));
    //
    //     }
    // }
}