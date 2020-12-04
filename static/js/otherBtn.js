    var zoomin_btn = d3.select("body")
        .append("button")
        .attr("id", "zoomin_btn")
        .style("position", "absolute")
        .style("top", "60px")
        .style("left", "365px")
        .text("Zoom In");

    var zoomout_btn = d3.select("body")
        .append("button")
        .attr("id", "zoomout_btn")
        .style("position", "absolute")
        .style("top", "60px")
        .style("left", "436px")
        .text("Zoom Out");

    var selectData_btn = d3.select("body")
        .append("button")
        .attr("id", "selectData_btn")
        .style("position", "absolute")
        .style("top", "60px")
        .style("left", "515px")
        .text("Select Data");

     var reset_btn = d3.select("body")
        .append("button")
        .attr("id", "reset_btn")
        .style("position", "absolute")
        .style("top", "410px")
        .style("left", "490px")
        .text("Reset");

     zoomin_btn.on('click', function () {
        console.log('Zoom Out')
        if(!extent){
            if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
            x.domain([-65, 70]);
            y.domain([-65, 70]);
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
        console.log('Zoom Out')
        x.domain([-65, 70]);
        y.domain([-65, 70]);
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
        // svg_tsne.transaction()
        //     .duration(1000)
        //     .call(zoom.transform, d3.zoomIdentity);
        x.domain([-65, 70]);
        y.domain([-65, 70]);
        svg_tsne.select(".x_axis").transition().duration(1000).call(d3.axisBottom(x))
        svg_tsne.select(".y_axis").transition().duration(1000).call(d3.axisLeft(y))
        svg_tsne.selectAll("circle")
            .transition().duration(1000)
            .attr("cx", function(d) {  console.log('cx,cy', x(d['pos'][0]), y(d['pos'][1]))
                return x(d['pos'][0]); })
            .attr("cy", function(d) {  return y(d['pos'][1]); });
    });

    var selected_ids_text = d3.select("body")
        .append("div")
        .attr("id", "selected_ids_text")
        .style("display", "none")

    selectData_btn.on('click', function () {
        selected_ids = d3.selectAll(".selected").nodes().map(function(d) { return d.id; });
        console.log('selected_ids',selected_ids);
        // d3.select("#selected_ids_text")
        //     .text(selected_ids + "");

        [heatmap_data, lat_data, new_selected_ids] = getSelectedData(selected_ids, data);
        console.log(heatmap_data, lat_data, "select data in tsne-------");

        updateHeatmap(lat_data, heatmap_data, new_selected_ids);
        updatePCs(lat_data, new_selected_ids);
    });
