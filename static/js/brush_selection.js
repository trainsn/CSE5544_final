
// container = d3.select(opt.selector).append("svg")
// 	.classed("svgGraph", true)
// 	.attr("width", opt.width)
// 	.attr("height", opt.height);

// brushGroup = container.append("g").attr("class", "brush");


// container
// 	.on('keydown.brush', keydownedEvent)
// 	.on('keyup.brush', keyuppedEvent)
 

// function keydownedEvent() {
//     const event = d3.event
//     if (event.metaKey || event.ctrlKey) { //ctrl key     
//        bindBrush();
//     } else {
//        unbindBrush();
//        node.classed("selected", function (p) { return p.selected = false; });
//     }
//     ctrlKey = event.ctrlKey || event.metaKey;
// }


// function keyuppedEvent() {
// 	ctrlKey = d3.event.ctrlKey || d3.event.metaKey;
//  }
//  // 绑定框选事件方法（svgScale：当前图形的缩放值）
//  function bindBrush() {
// 	 // 因为我的框选容器的父级设置了缩放值transform,所以当前画布可能处于缩放状态下，需要计算当前框选容器的起点位置，而不能直接设置x,y为0
// 	 let x = (0 - svgScale.x) / svgScale.k;
// 	 let y = (0 - svgScale.y) / svgScale.k;
// 	 brushGroup.call(d3.brush()
// 		.extent([[x, y], [(opt.width + 100) * (1 / svgScale.k), (opt.height + 100) * (1 / svgScale.k)]])
// 		.on("start", brushstarted)
// 		.on("brush", brushed)
// 		.on("end", brushended))
// 		.on("click.overlay", function (d) {
// 			if (node) {
// 				node.classed('selected', false)
// 			}
// 		 });
//  }

//  function unbindBrush() {
//     let x = (0 - svgScale.x) / svgScale.k;
//     let y = (0 - svgScale.y) / svgScale.k;
//     brushGroup.call(d3.brush()
//         .extent([[x, y], [(opt.width + 100) * (1 / svgScale.k), (opt.height + 100) * (1 / svgScale.k)]])
//         .on(".brush", null));
//     brushGroup.selectAll('*').remove();
//     brushGroup.attr('fill', false)
//         .attr('pointer-events', false)
//         .attr('style', false)
// }

// function brushstarted() {
//    if (d3.event.sourceEvent.type !== "end") {
//        node.classed("selected", function (d) {
//            return d.selected = d.previouslySelected = ctrlKey && d.selected;
//        });
//    }
// }
// function brushed() {
//     if (d3.event.sourceEvent.type !== "end") {
//         var selection = d3.event.selection;
//         let x0, y0, x1, y1;
//         if (selection) {
//             x0 = selection[0][0]
//             x1 = selection[1][0]
//             y0 = selection[0][1]
//             y1 = selection[1][1]
//         }
//         node.classed("selected", function (d) {
//             return d.selected = d.previouslySelected ^
//                    (selection != null&& x0 <= d.x && d.x < x1&& y0 <= d.y && d.y < y1);
//         });
//     }
// }
// function brushended() {
//     if (d3.event.selection != null) {
//         d3.select(this).call(d3.event.target.move, null);
//     }
// }
