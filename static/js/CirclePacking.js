
// var svg_CirclePack = container_cp.append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var data_cp;

var callback_cp = function (data_){

    var margin = {top: 22, right: 11, bottom: 20, left: 28},
    width = 500 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


    var container_cp = d3.select("body").append("div")
    .attr("id", "circlepack")
    .style("width", width + margin.left + margin.right + "px")
    .style("height", height + margin.top + margin.bottom + "px");


    console.log('circle packing', data_);
    CirclePack()
        .data(data_)
        .size('size')
        .width(width)
        .height(height)
        .color('color')
    (document.getElementById('circlepack'));
};

$.ajax({
    dataType: "json",
    url: '/get_data2',
    type: 'GET',
    data: data_cp,
    error : function() {
        alert('fail');
    },
    success : callback_cp
});


//
// const data22 = {
//       'name': 'main',
//       color: 'magenta',
//       children: [{
//         name: 'a',
//         color: 'yellow',
//         size: 12
//         }, {
//         name: 'b',
//         color: 'red',
//         children: [{
//           name: 'ba',
//           color: 'orange',
//           size: 2
//         }, {
//           name: 'bb',
//           color: 'blue',
//           children: [{
//             name: 'bba',
//             color: 'green',
//             size: 5
//           }, {
//             name: 'bbb',
//             color: 'pink',
//             size: 1
//           }]
//         }]
//       }]
//     };


