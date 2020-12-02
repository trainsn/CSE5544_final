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

	Envelope.prototype.cotain = function(x, y){
		return x >= minX && x <= maxX && y >= minY && y <= maxY;
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

		this.nodes[0] = new QuadNode(nw);
		this.nodes[1] = new QuadNode(ne);
		this.nodes[2] = new QuadNode(se);
		this.nodes[3] = new QuadNode(sw);

		for (var i = 0; i < 4; i++){
			for (var j = 0; j < this.features.length; j++){
				if (this.nodes[i].bbox.contain(this.features[i])){
					this.nodes[i].features.push(this.features[i]);
				}
			}
		}

		for (int i = 0; i < 4; i++){
			this.nodes[i].split(capacity);
		}

		this.features.length = 0;
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




}(window));