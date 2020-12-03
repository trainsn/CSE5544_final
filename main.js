function init(){
	features = [{x:0, y:5}, {x:2, y:0}, {x:3, y:8}, {x:6, y:2}, {x:8, y:6}];
	qtree = new QuadTree(1);
	qtree.constructQuadTree(features);
}

window.onload = init;