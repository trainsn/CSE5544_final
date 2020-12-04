var margin = {top: 20, right: 30, bottom: 30, left: 20},
    width  = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var container_hm = d3.select("body").append("div")
    .attr("id", "cosheatmap")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px");
var svg_cosheatmap = container_hm.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


function updateCosHeatmap(cosineDis, heatmap_data, selected_ids){
    d3.selectAll("rect.coshm_rect").remove();
    d3.selectAll(".coshm_yaxis").remove();
    d3.selectAll(".coshm_xaxis").remove();


    console.log('hea', heatmap_data)
    var length = selected_ids.length;
    var data = [];
    for (var i=0;i<length;i++){
        for (var j=0;j<length;j++){
            data.push(cosineDis[i][j]);
        }
    }

    console.log(d3.min(data), d3.max(data));

    var cosheatmapColor = d3.scaleLinear()
            .domain([d3.min(data), d3.max(data)])
            .range(["blue", "yellow"]);

    // var inds = Array.from(Array(hidden_size).keys()), //d3.range(0, 365)
    var nums = Array.from(Array(length).keys());

    var x = d3.scaleBand()
        .range([0, width])
        .domain(nums)
        .padding(0.01);

    var y = d3.scaleBand()
        .range([height, 0])
        .domain(nums) //.filter(function(d,i){ return !(i%100)}
        .padding(0.01);

    svg_cosheatmap.append("g")
        .attr("class", "coshm_yaxis")
        .call(d3.axisLeft(y));

    svg_cosheatmap.append("g")
        .attr("class", "coshm_xaxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg_cosheatmap.append("g")
        .selectAll("rect")
            .data(heatmap_data)
        .enter().append("rect")
            .attr("class", "coshm_rect")
            .attr("x", function(d, i) {
                return x(d.pos1)
            })
            .attr("y", function(d) {
                console.log('x', d.pos1, d.pos2, x(d.pos1), y(d.pos2), d.value)
                return y(d.pos2)
            })
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", function(d) {
                // console.log('d for cos dis', d)
                return cosheatmapColor(d.value)} )
}

