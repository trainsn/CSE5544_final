// when + what --> where
// where + what --> when

var margin_ts = {top: 20, right: 30, bottom: 30, left: 10},
width_ts  = 400 - margin_ts.left - margin_ts.right,
height_ts = 400 - margin_ts.top - margin_ts.bottom;

var num_bins = 20;

console.log("loading ts.js")

// $(document).ready(function(){
//     // $("#ts_tab").click(function(e){
//     //     e.preventDefault();
//     //     $(this).tab('show');
//     //     $("#hist_tab").tab('block');
//     // });
//     $("#ts_tab").tab('show');
//     $("#hist_tab").tab('block');
// });

// var brushed_data = [];
var attribute = 'distance';

d3.select("#query_btn")
    .on("click", function() {
        console.log('query_btn clicked!')
        update_time_series(selected_data_where_when_list)
        update_hist(selected_data_where_when_list, attribute)
        // temporal_data.forEach(d => {
        //     temporal_data_attr.push(d[attribute])
        // });
        // console.log(temporal_data_attr)
        // temporal_data, aggreate by date
        
        // min max time range, then set bin
        // when + what --> where
        // where + what --> when
        
        
        // draw_timeseries(temporal_data, attribute)

            // $.ajax({
            //     url:'/post_update_times_series',
            //     data: JSON.stringify(str),
            //     type: 'POST',
            //     dataType:'json'
            // }).done(function (response) {
            //     if (!response.r){
            //         var obj = JSON.parse(response.selected_data);
            //     }else{
            //         console.log(response);
            //     }
            // });

            // $.post( "/post_update_times_series", {
            //     data: JSON.stringify(str)
            //   }, function(err, req, resp){
            //         var d = resp["responseJSON"]
            //         console.log('d',d)
            //   });
        // }      
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
    // selected_data_where_when_list

    // histogram: x: time bins, y: num of instances
    // var parseDate1 = d3.timeParse("%Y-%m-%d %H-%M-%S");
    // var formatDate1 = d3.timeFormat("YYYY-MM-DD HH:MM:SS");
    // var parseDate2 = d3.timeParse("%Y-%m-%d %H:%M:%S");
    // var formatDate2 = d3.timeFormat("%Y-%m-%d");

    var x = d3.scaleTime()
        .domain([new Date(start_date), new Date(end_date)])

    var histogram = d3.histogram()
        .value(function(d, i) { 
            d.pickup_time = new Date(d.pickup_time)
            return d.pickup_time; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(num_bins); // then the numbers of bins
    
    var histData = histogram(data_);
    console.log('hist data', histData)

    var hist_freq = [];
    histData.forEach(d => {
        console.log('d',d)
        hist_freq.push({
            pickup_time: new Date(d.x0),
            freq: d.length
        })
    });

console.log('hist_freq',hist_freq)

    var chart = d3_timeseries()
        .addSerie(hist_freq, {x:'pickup_time',y:'freq',diff:'freq'}, {interpolate:'monotone', color:"#b2df8a",label:"value"})// {interpolate:'monotone',color:"#333"})
    chart('#ts_chart')
    // {interpolate:'monotone',dashed:true,color:"#a6cee3",label:"prediction"})
}



// d3.select("#chart").select("svg")
//     .attr("width", width_ts + margin_ts.left + margin_ts.right)
//     .attr("height", height_ts + margin_ts.top + margin_ts.bottom)



                // [{date:new Date('2013-01-01'),n:120,n3:200,ci_up:127,ci_down:115},...]
// var chart = d3_timeseries()
//     .addSerie(data.slice(0,60),{x:'date',y:'n'},{interpolate:'linear',color:"#a6cee3",label:"value"})
//     .addSerie(data.slice(50),
//             {x:'date',y:'n3',ci_up:'ci_up',ci_down:'ci_down'},
//             {interpolate:'monotone',dashed:true,color:"#a6cee3",label:"prediction"})
//     .width(820)

// chart('#chart')
// chart.width = 400
// chart.height = 200
// chart('#chart')