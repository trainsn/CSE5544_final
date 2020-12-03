/**
* A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.
* @module QuadTree
**/

(function (window) {

	function Envelope(minX, minY, maxX, maxY){
		this.minX = minX;
		this.minY = minY;
		this.maxX = maxX;
		this.maxY = maxY;
	}

	Envelope.prototype.cotain = function(point){
		return point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY;
	} 

	Envelope.prototype.intersect = function(envelope){
		tMinX = envelope.minX;
		tMaxX = envelope.maxX;
		tMinY = envelope.minY;
		tMaxY = envelope.maxY;
		flagx = false;
		flagy = false;
		if ((tMinX >= this.minX && tMinX <= this.maxX) 
		|| (tMaxX >= this.minX && tMaxX <= this.maxX)
		||(tMinX <= this.minX && tMaxX >= this.maxX))	// envelope 1 contains envelope 0
			flagx = true;
		if ((tMinY >= this.minY && tMinY <= this.maxY) 
		|| (tMaxY >= this.minY && tMaxY <= this.maxY)
		|| (tMinY <= this.minY && tMaxY >= this.maxY))	// envelope 1 contains envelope 0
			flagy = true;
		if (flagx && flagy)
			return true;
		return false;
	}

	function QuadNode(box){
		this.bbox = box;
		this.nodes = new Array();
		this.nodes[0] = null;
		this.nodes[1] = null;
		this.nodes[2] = null;
		this.nodes[3] = null;
	}

	QuadNode.prototype._classConstructor = QuadNode;
	QuadNode.prototype.features = []; 

	QuadNode.prototype.split = function(capacity){
		num = this.features.length;
		if (num <= capacity)
			return;

		for (int i = 0; i < 4; i++){
			this.nodes[i] = null;
		}

		tMinX = this.bbox.minX;
		tMaxX = this.bbox.maxX;
		tMinY = this.bbox.minY;
		tMaxY = this.bbox.maxY;

		tMidX = (tMinX + tMaxX) / 2;
		tMidY = (tMinY + tMaxY) / 2;

		sw = new Envelope(tMinX, tMidX, tMinY, tMidY);
		nw = new Envelope(tMinX, tMidX, tMidY, tMaxY);
		se = new Envelope(tMidX, tMaxX, tMinY, tMidY);
		ne = new Envelope (tMidX, tMaxX, tMidY, tMaxY);

		this.nodes[0] = new this._classConstructor(nw);
		this.nodes[1] = new this._classConstructor(ne);
		this.nodes[2] = new this._classConstructor(se);
		this.nodes[3] = new this._classConstructor(sw);

		for (var i = 0; i < 4; i++){
			for (var j = 0; j < this.features.length; j++){
				if (this.nodes[i].bbox.contain(this.features[i])){
					this.nodes[i].features.push(this.features[i]);
				}
			}
		}

		for (var i = 0; i < 4; i++){
			this.nodes[i].split(capacity);
		}

		this.features.length = 0;
	}

	QuadNode.prototype.countNode = function(nodeCounter){
		if (this.isLeafNode()){
			nodeCounter.leafNum++;
		} else {
			nodeCounter.interiorNum++;
			for (var i = 0; i < 4; i++){
				this.nodes[i].countNode(nodeCounter);
			}
		}
	}

	QuadNode.prototype.countHeight = function(height){
		height++;
		if (!this.isLeafNode()){
			cur = height;
			for (var i = 0; i < 4; i++){
				height = Math.max(height, nodes[i].countHeight(cur))
			}
		}
		return height;
	}

	QuadNode.prototype.add = function(feat){
		this.features.push(feat);
	}

	QuadNode.prototype.isLeafNode = function(){
		return this.nodes[0] == null;
	}

	QuadNode.prototype.rangeQuery = function(rect){
		out = []
		if (!this.bbox.intersect(rect))
			return out;

		if (this.isLeafNode()){
			for (var i = 0; i < this.features.length; ++i) {
    			if (rect.contain(this.features[i]))
    				out.push(this.features[i]);
			}
			return out;
		}
		for (var i = 0; i < 4; i++){
			if (rect.intersect(this.nodes[i].bbox)){
				out.push.apply(out, this.nodes[i].rangeQuery(rect));
			}
		}
		return out;
	} 

	function QuadTree(capacity){
		this.capacity = capacity;
	}

	QuadTree.prototype.bbox = null;
	QuadTree.prototype.root = null;

	QuadTree.prototype.constructQuadTree =  function(features){
		if (features.length == 0)
			return false;

		tMinX = features[0].x;
		tMaxX = features[0].x;
		tMinY = features[0].y;
		tMaxY = features[0].y;
		for (var i = 1; i < features.length; i++){
			if (features[i].x < tMinX)
				tMinX = features[i].x;
			if (features[i].x > tMaxX)
				tMaxX = features[i].x;
			if (features[i].y < tMinY)
				tMinY = features[i].y;
			if (features[i].y > tMaxY)
				tMaxY = features[i].y;
		}
		this.bbox = new Envelope(tMinX, tMaxX, tMinY, tMaxY);
		this.root = new QuadTree(bbox);
		for (var i = 0; i < features.length; i++){
			if (this.bbox.contain(features[i])){
				root.add(features[i]);
			}
		}

		if (root.features.length > capacity)
			root.split(capacity);

		return tree;
	}

	QuadTree.prototype.countQuadNode = function(){
		nodeCounter = {
			interiorNum: 0,
			leafNum: 0;
		}
		if (this.root != null){
			this.root.countQuadNode(nodeCounter);
		}
	}

	QuadTree.prototype.countHeight = function(){
		height = 0;
		if (this.root != null){
			height = this.root.countHeight();
		}
		return height;
	}

	QuadTree.prototype.rangeQuery = function(rect){
		this.root.rangeQuery(rect);
	}

	window.QuadTree = QuadTree;

}(window));