
var margin_sele = {top: 20, right: 30, bottom: 30, left: 10},
    width_sele  = 300 - margin_sele.left - margin_sele.right,
    height_sele = 300 - margin_sele.top - margin_sele.bottom;

var start_date = new Date(2013, 0, 01); 
var end_date = new Date(2013, 0, 05);  


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
        start_date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        end_date = new Date(end.getFullYear(), end.getMonth(), end.getDate());
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