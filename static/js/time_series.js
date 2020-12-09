// when + what --> where
// where + what --> when

var margin_ts = {top: 20, right: 30, bottom: 30, left: 10},
width_ts  = 400 - margin_ts.left - margin_ts.right,
height_ts = 400 - margin_ts.top - margin_ts.bottom;

var num_bins = 40;
var attribute = 'distance';
console.log("loading ts.js")

var allattributes = ['distance', 'fare_amount', 'surcharge', 'tip_amount', 'passengers']


d3.select("#selectAttributeBtn")
    .selectAll('AttributeOptions')
    .data(allattributes)
    .enter().append('option')
    .text(function (d) { if(d=='distance') return 'distance (miles)'; else return d; }) 
    .attr("value", function (d) { return d; }) 

d3.select("#selectAttributeBtn")
    .on("change", function(d) {
        console.log('change',d)
        attribute = d3.select(this).property("value")
        console.log('attribute', attribute)
        update_hist(selected_data_where_when_list, attribute)
    })


d3.select("#query_btn")
    .on("click", function() {
        console.log('query_btn clicked!')
        update_time_series(selected_data_where_when_list)
        update_hist(selected_data_where_when_list, attribute)
    })
            

// function get_brushed_data(){
//     var selected_ids = d3.selectAll(".selected").nodes().map(function(d) {return d.id; });
//     console.log('selected_ids',selected_ids);

//     var brushed_data = data_sliced.filter(function (d) {
//         return d['index'] in  selected_ids;
//     });

//     return [brushed_data, selected_ids];
// }


function update_time_series(data_){
    console.log('update_time_series')
    d3.select("#ts_chart").selectAll("*").remove();
    
    // brushed_data = get_brushed_data();
    // console.log(brsushed_data)
    // current data: selected_data_where_when_list

    // histogram: 
    // x: time, y: num of instances
    var x = d3.scaleTime()
        .domain([new Date(start_date),  new Date(end_date)])
        // new Date(new Date(start_date).toUTCString());
        // new Date(end_date)
    var histogram = d3.histogram()
        .value(function(d, i) { 
            d.pickup_time = new Date(new Date(d.pickup_time).toUTCString());
            console.log(d.pickup_time)
            return d.pickup_time; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(num_bins); // then the numbers of bins
    
    var histData = histogram(data_);
    var hist_freq = [];
    histData.forEach(d => {
        hist_freq.push({
            pickup_time: new Date(new Date(d.x0).toUTCString()),
            freq: d.length
        })
    });

    console.log('hist_freq', hist_freq)

    var chart = d3_timeseries()
        .addSerie(hist_freq, {x:'pickup_time',y:'freq'}, {interpolate:'linear', color:"#b2df8a",label:"value"})// {interpolate:'monotone',color:"#333"})
    chart('#ts_chart')
    // {interpolate:'monotone',dashed:true,color:"#a6cee3",label:"prediction"})
}
