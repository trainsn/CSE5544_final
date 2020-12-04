
var margin = {top: 22, right: 11, bottom: 20, left: 28},
    w = 500 - margin.left - margin.right,
    h = 400 - margin.top - margin.bottom;

var svg_tsne = d3.select("#music")
    .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var label_text = d3.select("body").append("div")
    .attr("class", "label_text")
    .style("position", "absolute")
    .style("opacity", 0);

var myaudio = document.getElementById('myaudio');
var end_time = 0;
var start_time = 0;

var data,
    selected_ids,
    shiftKey;


function getData(data, pos){
    var output = [];
    var flags = [];
    for (var i = 0, len = data.length; i < len; i++){
        var str;
        if(pos == 2){
            str = data[i]["file_name"].toString().split("_")[pos].slice(2);
        }
        else{
            str = data[i]["file_name"].toString().split("_")[pos];
        }
        if(flags[str]) continue;
        flags[str] = true;
        output.push(str)
    }
    output.sort();
    output.unshift("None");
    return output
}

function getID(data, name, pos){
    var output = [];
    for (var i = 0, len = data.length; i < len; i++){
        var str = data[i]["file_name"].toString().split("_")[pos];
        if (pos == 2 && name == str.slice(2)){ //song
            console.log("data name", name, str.slice(2), pos)
            output.push(i)
        }
        else{
            if (pos == 1 && name == str){
                output.push(i)
            }
        }
    }
    return output
}


var callback = function (data_){
    data  = data_["data"]//.slice(0,8000);
    var x = d3.scaleLinear()
        .domain([-80, 80])
        .range([0, w]);
    var y = d3.scaleLinear()
        .domain([-100, 100])
        .range([h, 0]);

    var xAxis = d3.axisBottom(x).ticks(12),
        yAxis = d3.axisLeft(y).ticks(12 * h / w);

    var brush = d3.brush()
        .extent([[0, 0], [w, h]])
        .on("brush", updateBrush)
        .on("end", endBrush);

    var gX = svg_tsne.append("g")
        .attr("class", "x_axis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis);

    var gY = svg_tsne.append("g")
        .attr("class", "y_axis")
        .call(yAxis);

    // Add a clipPath: everything out of this area won't be drawn.
    var clip = svg_tsne.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", w )
        .attr("height", h )
        .attr("x", 0)
        .attr("y", 0);

    svg_tsne.append('g')
        .attr('class', 'brush')
        .call(brush);


    var extent; //save current selections (from brushing)

    var performers = getData(data, 1),
        songs = getData(data, 2);
    // console.log(performers, songs);

    colorScale_tsne = d3.scaleOrdinal(d3.schemeCategory10); //category20

    var idleTimeout;
    function idled() { idleTimeout = null; }

    var zoomin_btn = d3.select("body")
        .append("button")
        .attr("id", "zoomin_btn")
        .style("position", "absolute")
        .style("top", "60px")
        .style("left", "380px")
        .text("Zoom In");

    var zoomout_btn = d3.select("body")
        .append("button")
        .attr("id", "zoomout_btn")
        .style("position", "absolute")
        .style("top", "60px")
        .style("left", "451px")
        .text("Zoom Out");

    var selectData_btn = d3.select("body")
        .append("button")
        .attr("id", "selectData_btn")
        .style("position", "absolute")
        .style("top", "60px")
        .style("left", "530px")
        .text("Select Data");

    var reset_btn = d3.select("body")
        .append("button")
        .attr("id", "reset_btn")
        .style("position", "absolute")
        .style("top", "410px")
        .style("left", "490px")
        .text("Reset");


    zoomin_btn.on('click', function () {
        console.log('Zoom in');
        if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([-80, 80]);
            y.domain([-100, 100]);
        }else{
            x.domain([ x.invert(extent[0][0]), x.invert(extent[1][0])]);
            y.domain([ y.invert(extent[1][1]), y.invert(extent[0][1])]);
            scatter.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
        }
        svg_tsne.select(".x_axis").transition().duration(1000).call(d3.axisBottom(x))
        svg_tsne.select(".y_axis").transition().duration(1000).call(d3.axisLeft(y))
        svg_tsne.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function(d) {  return x(d['pos'][0]); })
            .attr("cy", function(d) {  return y(d['pos'][1]); });
    });

    zoomout_btn.on('click', function () {
        console.log('Zoom Out');
        x.domain([-80, 80]);
        y.domain([-100, 100]);
        svg_tsne.select(".x_axis").transition().duration(1000).call(d3.axisBottom(x))
        svg_tsne.select(".y_axis").transition().duration(1000).call(d3.axisLeft(y))
        svg_tsne.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function(d) {  return x(d['pos'][0]); })
            .attr("cy", function(d) {  return y(d['pos'][1]); });
    });

    // TO DO....
    reset_btn.on('click', function () {
        console.log('Reset')
        scatter.classed("selected", false);
        x.domain([-80, 80]);
        y.domain([-100, 100]);
        svg_tsne.select(".x_axis").transition().duration(1000).call(d3.axisBottom(x))
        svg_tsne.select(".y_axis").transition().duration(1000).call(d3.axisLeft(y))
        svg_tsne.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function(d) {  return x(d['pos'][0]); })
            .attr("cy", function(d) {  return y(d['pos'][1]); });
    });

     var scatter = svg_tsne.append('g')
        .attr("clip-path", "url(#clip)")
        .attr("id", "scatterplot")
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .selectAll("circle")
            .data(data)
        .enter().append("circle")
            .attr("id", function(d,i){
                return "id"+i;
            })
            .attr('class', 'unselected')
            .attr("cx", function (d) {
                return x(d['pos'][0])
            })
            .attr("cy", function (d) {
                return y(d['pos'][1])
            })
            .attr("r", 2.5)
            .style("fill", (d)=> {
                // console.log(colorScale_tsne(d["file_name"].split("_")[2]), d["file_name"].split("_")[2])
                // return colorScale_tsne(d["file_name"].split("_")[1])
                return d3.interpolateTurbo(performers.indexOf(d["file_name"].split("_")[1]) / performers.length)
                })
            .style("opacity", 0.5)

            .on("mouseover", function(d) {
                label_text.transition()
                    .duration(200)
                    .style("opacity", .9);
                label_text.html(d["file_name"])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top",  (d3.event.pageY - 20) +"px");
            })
            .on("mouseout", function (d) {
                label_text.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function(d) {
                console.log("You just Click d:", d, myaudio);
                if (d["file_name"]){
                    string = d["file_name"].toString().split("_");
                    path = "./static/WAV/" + string[0]+"/"+string[1]+"/"+string[2]+".wav";
                    // start_time = parseInt(d["start"]/40) + ''; //parseInt
                    // end_time = parseInt(d["start"]/40) + 4 + '';
                    start_time = parseInt(string[3])*10 + 0.1 + ''; //parseInt
                    end_time = parseInt(string[3])*10 + 10 + '';
                }
                else {
                    path = "./static/WAV/" + d["instrument"]+"/"+d["performer"]+"/"+d["songName"]+".wav";
                    start_time = parseInt(d["start"])*10 + 0.1 + ''; //parseInt
                    end_time = parseInt(d["start"])*10 + 10 + '';
                }
                console.log('music file:', path, start_time, end_time);

                myaudio.src = path;
                myaudio.load();
                myaudio.muted = true;

                myaudio.addEventListener("canplaythrough", playfun, false);

                function pausing_function(){
                    console.log(" time during listening:", this.currentTime, end_time);
                    if(this.currentTime >= end_time){
                        this.pause();
                        this.currentTime  = 0 + '';
                        this.removeEventListener("timeupdate", arguments.callee, false);
                        console.log(" stopped", this.currentTime)
                    }
                }
                function playfun() {
                    if (this.currentTime < start_time){
                        this.play();
                        this.currentTime = start_time;
                        console.log("onload", this.currentTime )
                    }
                    else {
                        console.log("playing!!!!")
                        this.muted=false;
                        this.removeEventListener("canplaythrough",playfun, false);
                        this.addEventListener("timeupdate", pausing_function, false);
                    }
                }
            });

    // var selected_ids_text = d3.select("body")
    //     .append("div")
    //     .attr("id", "selected_ids_text")
    //     .style("display", "none");

    dispatch = d3.dispatch("clustering");


    selectData_btn.on('click', function () {
        selected_ids = d3.selectAll("circle.selected").nodes().map(function(d) { return d.id; });

        [heatmap_data, lat_data, new_selected_ids, sortBy, vari] = getSelectedData(selected_ids, data);

        d3.selectAll("circle.unselected")
            .style("fill", (d)=> {return "#4C6C77";})
            .style("opacity", 0.3);


        var varInfor = document.getElementById("dimvarInfo");
        varInfor.innerHTML = "";
        for (var i=0;i<sortBy.length;i++){
            var str = 'dim' + sortBy[i] + ':' + d3.format('.5f')(vari[sortBy[i]]) +'\n\n';
            varInfor.innerHTML += str;
        }

        dispatch.on("clustering", function (labels, cosineDis) { // get labels from clustering
            var infor = document.getElementById("tableInfo");
            infor.innerHTML = "";
            for (var i=0;i<lat_data.length;i++){
                var str = 'instrument:' + lat_data[i].instrument + ', performer:' + lat_data[i].performer + ', songName:' + lat_data[i].songName + ', index:' + lat_data[i].start + ', Cluster result:' + labels[i] +'\n\n';
                infor.innerHTML += str;
            }
            d3.selectAll("circle.selected")
                .data(lat_data)
                .style("fill", (d)=> {
                    return colorScale_tsne(labels[lat_data.indexOf(d)]);
                })
                .style("opacity", 1);

            d3.selectAll("path.line")
                .data(lat_data)
                .attr('stroke', function(d, i) {
                    // console.log(colorScale_tsne(d["performer"]), d["performer"])
                    return colorScale_tsne(labels[lat_data.indexOf(d)]);
                    // return d3.interpolateTurbo(performers.indexOf(d["performer"]) / performers.length)
                });

            // draw cosine similiarity matrix
            var cos_matrix = [];
            console.log('cosineDis', cosineDis, cosineDis[0], cosineDis[0][1])
            for (var j = 0; j < cosineDis.length; j++) {
                for (var jj = 0; jj < cosineDis.length; jj++){
                    cos_matrix.push({
                        pos1: jj,
                        pos2: j,
                        value: cosineDis[j][jj],
                    });
                }
            }

            updateCosHeatmap(cosineDis, cos_matrix, selected_ids);

        });

        updateHeatmap(lat_data, heatmap_data, new_selected_ids, sortBy);
        updatePCs(lat_data, new_selected_ids, sortBy, performers);
    });


    function updateBrush() {
        console.log("brushing d3.event");
        svg_tsne.selectAll("circle").attr('class', 'unselected');
        var selection = d3.event.selection;
        var transform = d3.zoomTransform(this);

        scatter.attr("transform", "translate(" + transform.x + "," + transform.y + ") scale(" + transform.k + ")");
        scatter.classed("selected", function(d){
            // console.log(selection, d, transform)
            return rectContains_2(selection, transform.x, transform.y, transform.k, x(d['pos'][0]), y(d['pos'][1]));
        });
        svg_tsne.selectAll("circle.selected").attr('class', 'selected');
    }

    function endBrush() {
        extent = d3.event.selection;
    }

    function rectContains(brush_coords, cx, cy) {
        var x0 = brush_coords[0][0],
        x1 = brush_coords[1][0],
        y0 = brush_coords[0][1],
        y1 = brush_coords[1][1];
        console.log(x0,x1,y0,y1, x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1)
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
    }

    function rectContains_2(brush_coords, translate_a, translate_b, scale, cx, cy) {
        var x0 = (brush_coords[0][0]-translate_a)/scale,
        x1 = (brush_coords[1][0]-translate_a)/scale,
        y0 = (brush_coords[0][1]-translate_b)/scale,
        y1 = (brush_coords[1][1]-translate_b)/scale;
        // console.log(x0,x1,y0,y1, x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1)
        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
    }

    // function drawScatter(selected){
    //     svg_tsne.select("#scatterplot")
    //     // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    //     .selectAll("circle")
    //         .data(data)
    //     .enter().append("circle")
    //         .attr("id", function(d,i){
    //             return "id"+i;
    //         })
    //         .attr('class', 'unselected')
    //         .attr("cx", function (d) {
    //             return x(d['pos'][0])
    //         })
    //         .attr("cy", function (d) {
    //             return y(d['pos'][1])
    //         })
    //         .attr("r", 2.5)
    //         .style("fill", (d)=> {
    //             // console.log(colorScale_tsne(d["file_name"].split("_")[2]), d["file_name"].split("_")[2])
    //             return colorScale_tsne(d["file_name"].split("_")[1])
    //             })
    //         .style("opacity", 0.5)
    //
    //         .on("mouseover", function(d) {
    //             label_text.transition()
    //                 .duration(200)
    //                 .style("opacity", .9);
    //             label_text.html(d["file_name"])
    //                 .style("left", (d3.event.pageX) + "px")
    //                 .style("top",  (d3.event.pageY - 20) +"px");
    //         })
    //         .on("mouseout", function (d) {
    //             label_text.transition()
    //                 .duration(500)
    //                 .style("opacity", 0);
    //         })
    //         .on("click", function(d) {
    //             console.log("You just Click d:", d, myaudio);
    //             if (d["file_name"]){
    //                 string = d["file_name"].toString().split("_");
    //                 path = "WAV/" + string[0]+"/"+string[1]+"/"+string[2]+".wav";
    //
    //                 // start_time = parseInt(d["start"]/40) + ''; //parseInt
    //                 // end_time = parseInt(d["start"]/40) + 4 + '';
    //                 start_time = parseInt(string[3]/40) + ''; //parseInt
    //                 end_time = parseInt(string[3]/40) + 4 + '';
    //                 console.log(start_time, string[3])
    //             }
    //             else {
    //                 path = "WAV/" + d["instrument"]+"/"+d["performer"]+"/"+d["songName"]+".wav";
    //
    //                 start_time = parseInt(d["start"]*10) + ''; //parseInt
    //                 end_time = parseInt(d["start"]*11) + '';
    //             }
    //             // string = d["file_name"].toString().split("_")
    //             // path = "WAV/" + string[0]+"/"+string[1]+"/"+string[2]+".wav"
    //             console.log(path, start_time, end_time)
    //             //
    //             // start_time = parseInt(d["start"]/40) + ''; //parseInt
    //             // end_time = parseInt(d["start"]/40) + 4 + '';
    //             myaudio.src = path;
    //             myaudio.load();
    //             myaudio.muted = true;
    //
    //             myaudio.addEventListener("canplaythrough", playfun, false);
    //
    //             function pausing_function(){
    //                 console.log(" time during listening:", this.currentTime, end_time, d["file_name"])
    //                 if(this.currentTime >= end_time){
    //                     this.pause();
    //                     this.currentTime  = 0 + '';
    //                     this.removeEventListener("timeupdate", arguments.callee, false);
    //                     console.log(" stopped", this.currentTime)
    //                 }
    //             }
    //             function playfun() {
    //                 if (this.currentTime < start_time){
    //                     this.play();
    //                     this.currentTime = start_time;
    //                     console.log("onload", this.currentTime )
    //                 }
    //                 else {
    //                     console.log("playing!!!!")
    //                     this.muted=false;
    //                     this.removeEventListener("canplaythrough",playfun, false);
    //                     this.addEventListener("timeupdate", pausing_function, false);
    //                 }
    //             }
    //         });
    // }

    var zoom = d3.zoom()
        .scaleExtent([1, 10])
        // .translateExtent([[-100, -100], [width + 90, height + 100]])
        .on("zoom", zoomed);

    function zoomed() {
        scatter.attr("transform", d3.event.transform);
        gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
    }

    svg_tsne.call(zoom);

    var selector1 = d3.select("body")
        .append("select")
        .attr("id", "performerSelector")
        .style("position", "absolute")
        .style("top", "60px")
        .style("left", "60px")
        .selectAll("option")
            .data(performers)
        .enter().append("option")
            .text(function(d) {return d})
            .attr("value", function (d) {
                return d;
            });
    var selector2 = d3.select("body")
        .append("select")
        .attr("id", "songSelector")
        .style("position", "absolute")
        .style("top", "60px")
        .style("left", "185px")
        .selectAll("option")
            .data(songs)
        .enter().append("option")
            .text(function(d) {return d})
            .attr("value", function (d) {
                return d;
            });

    var old_ids =[];
    d3.select('#performerSelector').on("change", function () {
        for(var i=0; i< old_ids.length; i++){
            d3.select("#id"+old_ids[i])
                .attr("class", "unselected")
        }
        var myselect = document.getElementById("performerSelector");
        var performer= myselect.options[myselect.selectedIndex].value;
        console.log("info: ", myselect, performer)
        var ids = getID(data, performer, 1);
        old_ids = ids;
        for(i=0; i< ids.length; i++){
            d3.select("#id"+ids[i])
                .attr("class", "selected")
        }
    });

    var old_ids2 =[];
    d3.select('#songSelector').on("change", function () {
        for(var i=0; i< old_ids2.length; i++){
            d3.select("#id"+old_ids2[i])
                .attr("class", "unselected")
        }
        var myselect = document.getElementById("songSelector");
        var song= myselect.options[myselect.selectedIndex].value;
        var ids = getID(data, song, 2);
        old_ids2 = ids;
        for(i=0; i< ids.length; i++){
            d3.select("#id"+ids[i])
                .attr("class", "selected")
        }
    });
};

// $.ajax({
//             url: '/postmethod',
//             data: JSON.stringify(str),
//             type: 'POST',
//             contentType: "application/json; charset=utf-8",
//             dataType: "json",
//             success: function(response) {
//                 console.log("response", response);
//                 dispatch.call("clustering", this, response.labels);
//             },
//             error: function(error) {
//                 console.log(error);
//             }
//         });


// // if user clicked show2d button, or run, we will calculate pos in 2d
// var show_2d = function(){
//
// };

$.ajax({
    dataType: "json",
    url: '/get_data',
    type: 'GET',
    data: data,
    error : function() {
        alert('fail');
    },
    success : callback
});

