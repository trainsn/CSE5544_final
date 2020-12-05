// var selectionRect = {
// 	element			: null,
// 	previousElement : null,
// 	currentY		: 0,
// 	currentX		: 0,
// 	originX			: 0,
//     originY			: 0,
// 	setElement: function(ele) {
// 		this.previousElement = this.element;
// 		this.element = ele;
// 	},
// 	getNewAttributes: function() {
// 		var x = this.currentX<this.originX?this.currentX:this.originX;
// 		var y = this.currentY<this.originY?this.currentY:this.originY;
// 		var width = Math.abs(this.currentX - this.originX);
// 		var height = Math.abs(this.currentY - this.originY);
// 		return {
// 	        x       : x,
// 	        y       : y,
// 	        width  	: width,
// 	        height  : height
// 		};
// 	},
// 	getCurrentAttributes: function() {
// 		// use plus sign to convert string into number
// 		var x = +this.element.attr("x");
// 		var y = +this.element.attr("y");
// 		var width = +this.element.attr("width");
// 		var height = +this.element.attr("height");
// 		return {
// 			x1  : x,
// 	        y1	: y,
// 	        x2  : x + width,
// 	        y2  : y + height
// 		};
// 	},
// 	getCurrentAttributesAsText: function() {
// 		var attrs = this.getCurrentAttributes();
// 		return "x1: " + attrs.x1 + " x2: " + attrs.x2 + " y1: " + attrs.y1 + " y2: " + attrs.y2;
// 	},
// 	init: function(newX, newY) {
// 		var rectElement = svg.append("rect")
// 		    .attr({
// 		        rx      : 4,
// 		        ry      : 4,
// 		        x       : 0,
// 		        y       : 0,
// 		        width   : 0,
// 		        height  : 0
// 		    })
// 		    .classed("selection", true);
// 	    this.setElement(rectElement);
// 		this.originX = newX;
// 		this.originY = newY;
// 		this.update(newX, newY);
// 	},
// 	update: function(newX, newY) {
// 		this.currentX = newX;
// 		this.currentY = newY;
// 		this.element.attr(this.getNewAttributes());
// 	},
// 	focus: function() {
//         this.element
//             .style("stroke", "#DE695B")
//             .style("stroke-width", "2.5");
//     },
//     remove: function() {
//     	this.element.remove();
//     	this.element = null;
//     },
//     removePrevious: function() {
//     	if(this.previousElement) {
//     		this.previousElement.remove();
//     	}
//     }
// };

// var container_drag = d3.select("#map")
//     .append("div")
//     .style("width", width_map + margin_map.left + margin_map.right + "px")
//     .style("height", height_map + margin_map.top + margin_map.bottom + "px");

// var svg_drag = container_drag.append("svg")
//     .attr("id", "svg_drag")
//     .attr("width", width_map + margin_map.left + margin_map.right)
//     .attr("height", height_map + margin_map.top + margin_map.bottom)
//     .append("g")
//     .attr("transform", "translate(" + margin_map.left + "," + margin_map.top + ")");

// // var clickTime = d3.select("#clicktime");
// // var attributesText = d3.select("#attributestext");

// function dragStart() {
// 	console.log("dragStart");
//     var p = d3.mouse(this);
//     selectionRect.init(p[0], p[1]);
// 	selectionRect.removePrevious();
// }

// function dragMove() {
// 	console.log("dragMove");
// 	var p = d3.mouse(this);
//     selectionRect.update(p[0], p[1]);
//     // attributesText
//     // 	.text(selectionRect.getCurrentAttributesAsText());
// }

// function dragEnd() {
// 	console.log("dragEnd");
// 	var finalAttributes = selectionRect.getCurrentAttributes();
// 	console.dir(finalAttributes);
// 	if(finalAttributes.x2 - finalAttributes.x1 > 1 && finalAttributes.y2 - finalAttributes.y1 > 1){
// 		console.log("range selected");
// 		d3.event.sourceEvent.preventDefault();
// 		selectionRect.focus();
// 	} else {
// 		console.log("single point");
//         selectionRect.remove();
//         // clicked();
//     }
// }

// var dragBehavior = d3.drag()
//     .on("drag", dragMove)
//     .on("start", dragStart)
//     .on("end", dragEnd);

// svg_drag.call(dragBehavior);

// // function clicked() {
// // 	var d = new Date();
// //     clickTime
// //     	.text("Clicked at " + d.toTimeString().substr(0,8) + ":" + d.getMilliseconds());
// // }
// var brush = d3.brush() 
// 	.on("start", brushstart) 
// 	.on("brush", brush)
// 	.on("end", brushend); 

// function brushstart(p) {
// 	console.log(brush.data, p, brush.data !== p)
// 	cell.call(d3.brush().move)
// }

// function brush(p) {
// 	cell.selectAll("circle").attr('class', 'unselected');
// 	var selection = d3.event.selection;
// 	if (selection){
// 		cell.selectAll("circle").classed("selected", function(d){
// 			return rectContains(selection, x[p.x](d[p.x]), y[p.y](d[p.y]));
// 		});
// 		cell.selectAll("circle.selected").attr('class', function(d) { return d.species; });
// 	}
// }

// function rectContains(brush_coords, cx, cy) {
// 	var x0 = brush_coords[0][0],
// 	x1 = brush_coords[1][0],
// 	y0 = brush_coords[0][1],
// 	y1 = brush_coords[1][1];
// 	return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    
// }

// function brushend() {
// 	var selection = d3.event.selection;
// 	if (!selection){
// 		// cell.selectAll("circle").attr('class', function(d) { return d.species; });
// 		cell.call(d3.brush().move);
// 	}
// }