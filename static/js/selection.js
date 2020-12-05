// // Selection, time range query

// // var a = d3.timeMonth.range(start, end, 2); //skip the months.
// // console.log(a); 
// var dps = [];

// var chart = new CanvasJS.Chart("chartContainer",
// 	{
//   title: {
//   	text: "Chart with Date Selector"
//   },
//   data: [
// 		{
//     	type: "line",
//     	dataPoints: randomData(new Date(2017, 0, 1), 400)
//     }
//   ]
// });
// chart.render();

// var axisXMin = chart.axisX[0].get("minimum");
// var axisXMax = chart.axisX[0].get("maximum");

// function randomData(startX, numberOfY){
// var xValue, yValue = 0;
// for (var i = 0; i < 400; i += 1) {
// 				xValue = new Date(startX.getTime() + (i * 24 * 60 * 60 * 1000));
// 				yValue += (Math.random() * 10 - 5) << 0;

// 				dps.push({
// 					x: xValue,
// 					y: yValue
// 				});
// 			}
//       return dps;
// }

// $( function() {
//   $("#fromDate").val(CanvasJS.formatDate(axisXMin, "DD MMM YYYY"));
//   $("#toDate").val(CanvasJS.formatDate(axisXMax, "DD MMM YYYY"));
//   $("#fromDate").datepicker({dateFormat: "d M yy"});
//   $("#toDate").datepicker({dateFormat: "d M yy"});
// });

// $("#date-selector").change( function() {
// 	var minValue = $( "#fromDate" ).val();
//     var maxValue = $ ( "#toDate" ).val();
  
//   if(new Date(minValue).getTime() < new Date(maxValue).getTime()){  
//   	chart.axisX[0].set("minimum", new Date(minValue));
//   	chart.axisX[0].set("maximum", new Date(maxValue));
//   }  
// });

// $(".period").click( function() {
// 	var period = this.id;  
//   var minValue;
//   minValue = new Date(axisXMax);
  
//   switch(period){
//   	case "1m":
//       minValue.setMonth(minValue.getMonth() - 1);
//       break;
//     case "3m":
//       minValue.setMonth(minValue.getMonth() - 3);
//       break;
//     case "6m":
//       minValue.setMonth(minValue.getMonth() - 6);
//       break;
//     case "1y":
//       minValue.setYear(minValue.getFullYear() - 1);
//       break;
//     default:
//     	minValue = axisXMin;
// 	}
  
//  	chart.axisX[0].set("minimum", new Date(minValue));  
//   chart.axisX[0].set("maximum", new Date(axisXMax));
// });

var margin_sele = {top: 20, right: 30, bottom: 30, left: 10},
    width_sele  = 300 - margin_sele.left - margin_sele.right,
    height_sele = 300 - margin_sele.top - margin_sele.bottom;

var start_date = new Date(2013, 01, 01); 
var end_date = new Date(2013, 01, 05);  

// var allGroup = d3.map(data, function(d){return(d.name)}).keys()

function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

var picker = new Litepicker({
    element: document.getElementById('datepicker'),
    singleMode: false,
    onSelect: function(start, end){
        console.log('select Date, from', dateToYMD(start), ' to ',dateToYMD(end));
        updateMapByDate(start, end);
    },
    useResetBtn: true,
    startDate: start_date,
    endDate: end_date,
    dropdowns: {
        minYear: 2010,
        maxYear: 2018,
        months: false,
        years: false,
    }
});