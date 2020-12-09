// histogram:
// when + where --> what, attribute range, bins

// source: https://www.d3-graph-gallery.com/graph/histogram_basic.html

var margin_hist = {top: 10, right: 30, bottom: 30, left: 40},
    width_hist = 360 - margin_hist.left - margin_hist.right,
    height_hist = 300 - margin_hist.top - margin_hist.bottom;


function update_hist(data_, attri){
    d3.select("#hist_chart").selectAll("*").remove();
    
    var svg_hist = d3.select("#hist_chart")
    .append("svg")
      .attr("width", width_hist + margin_hist.left + margin_hist.right)
      .attr("height", height_hist + margin_hist.top + margin_hist.bottom)
    .append("g")
      .attr("transform",
            "translate(" + margin_hist.left + "," + margin_hist.top + ")");
    
    var temp_d = []
    data_.forEach(d => {
        temp_d.push(d[attri])
    });
    var max_d = d3.max(temp_d)
    var min_d = d3.min(temp_d)
    var x = d3.scaleLinear()
        .domain([min_d, max_d]) 
        .range([0, width_hist]);
    
    svg_hist.append("g")
        .attr("transform", "translate(0," + height_hist + ")")
        .call(d3.axisBottom(x));
    
    var histogram = d3.histogram()
        .value(function(d) { return d; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(num_bins); // then the numbers of bins
    
    
    console.log('temp_d', temp_d, max_d, min_d)
  
    var bins = histogram(temp_d);
    console.log('bins', bins)

    var y = d3.scaleLinear()
        .range([height_hist, 0]);
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    
    svg_hist.append("g")
        .call(d3.axisLeft(y));
    
    
    svg_hist.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height_hist - y(d.length); })
        .style("fill", "#69b3a2")

}

// d3.select("#chart").selectAll("*").remove();
// var data = createRandomData(80,[0,1000],0.01)
// console.log('daata hist', data)
// var chart = d3_timeseries()
//     .addSerie(data.slice(0,60),{x:'date',y:'n'},{interpolate:'linear',color:"#a6cee3",label:"value"})
//     .addSerie(data.slice(50),
//             {x:'date',y:'n3',ci_up:'ci_up',ci_down:'ci_down'},
//             {interpolate:'monotone',dashed:true,color:"#a6cee3",label:"prediction"})
//     .width_hist(820)

// chart('#hist_chart')
