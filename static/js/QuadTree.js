/**
* A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.
* @module QuadTree
**/

(function (window) {

	function Envelope(minX, maxX, minY, maxY){
		this.minX = minX;
		this.maxX = maxX;
		this.minY = minY;
		this.maxY = maxY;
	}

	Envelope.prototype.contain = function(point){
		inside = point.x >= this.minX && point.x <= this.maxX && point.y >= this.minY && point.y <= this.maxY;
		return inside;
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

	Envelope.prototype.draw = function(svg){
		svg.append("line")  
            .attr("x1", this.minX)
            .attr("y1", this.minY)
            .attr("x2", this.maxX)
            .attr("y2", this.minY)
            .attr("stroke", "black")
            .attr("stroke-width", "2px");
        svg.append("line")  
            .attr("x1", this.maxX)
            .attr("y1", this.minY)
            .attr("x2", this.maxX)
            .attr("y2", this.maxY)
            .attr("stroke", "black")
            .attr("stroke-width", "2px");
        svg.append("line")  
            .attr("x1", this.maxX)
            .attr("y1", this.maxY)
            .attr("x2", this.minX)
            .attr("y2", this.maxY)
            .attr("stroke", "black")
            .attr("stroke-width", "2px");
        svg.append("line")  
            .attr("x1", this.minX)
            .attr("y1", this.maxY)
            .attr("x2", this.minX)
            .attr("y2", this.minY)
            .attr("stroke", "black")
            .attr("stroke-width", "2px");
	}

	function QuadNode(box){
		this.bbox = box;
		this.nodes = new Array();
		this.nodes[0] = null;
		this.nodes[1] = null;
		this.nodes[2] = null;
		this.nodes[3] = null;
		this.features = [];
	}

	QuadNode.prototype._classConstructor = QuadNode;

	QuadNode.prototype.split = function(capacity){
		num = this.features.length;
		if (num <= capacity)
			return;

		for (var i = 0; i < 4; i++){
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
		ne = new Envelope(tMidX, tMaxX, tMidY, tMaxY);

		this.nodes[0] = new this._classConstructor(nw);
		this.nodes[1] = new this._classConstructor(ne);
		this.nodes[2] = new this._classConstructor(se);
		this.nodes[3] = new this._classConstructor(sw);

		for (var i = 0; i < 4; i++){
			for (var j = 0; j < this.features.length; j++){
				if (this.nodes[i].bbox.contain(this.features[j])){
					this.nodes[i].features.push(this.features[j]);
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

	QuadNode.prototype.countHeight = function(height, maxHeight){
		if (height + 1 > maxHeight.h)
			maxHeight.h = height + 1;
		if (!this.isLeafNode()){
			for (var i = 0; i < 4; i++){
				this.nodes[i].countHeight(height + 1, maxHeight);
			}
		}
	}

	QuadNode.prototype.add = function(feat){
		this.features.push(feat);
	}

	QuadNode.prototype.isLeafNode = function(){
		return this.nodes[0] == null;
	}

	QuadNode.prototype.rangeQuery = function(rect, out, k){
		if (!this.bbox.intersect(rect))
			return;

		if (this.isLeafNode()){
			var counter = 0;
			for (var i = 0; i < this.features.length * k / 20; ++i) {
    			if (rect.contain(this.features[i])){
    				out.push(this.features[i]);
    			}
			}
			return;
		}
		for (var i = 0; i < 4; i++){
			if (rect.intersect(this.nodes[i].bbox)){
				this.nodes[i].rangeQuery(rect, out, k);
			}
		}
	} 

	QuadNode.prototype.draw = function(svg){
		if (this.isLeafNode()){
			this.bbox.draw(svg);
		} 
		else {
			for (var i = 0; i < 4; i++)
				this.nodes[i].draw(svg);
		}
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
		this.root = new QuadNode(this.bbox);
		for (var i = 0; i < features.length; i++){
			if (this.bbox.contain(features[i])){
				this.root.add(features[i]);
			}
		}

		if (this.root.features.length > this.capacity)
			this.root.split(this.capacity);

		return true;
	}

	QuadTree.prototype.countQuadNode = function(nodeCounter){
		if (this.root != null){
			this.root.countNode(nodeCounter);
		}
	}

	QuadTree.prototype.countHeight = function(){
		if (this.root != null){
			maxHeight = {h: 0};
			height = this.root.countHeight(0, maxHeight);
		}
		return maxHeight.h;
	}

	QuadTree.prototype.rangeQuery = function(rect, k){
		out = [];
		this.root.rangeQuery(rect, out, k);
		return out;
	}

	QuadTree.prototype.draw = function(svg){
		if (this.root != null)
			this.root.draw(svg);
	}

	window.Envelope = Envelope
	window.QuadTree = QuadTree;

}(window));