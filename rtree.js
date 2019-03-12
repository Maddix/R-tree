class Point {
	constructor(x=0, y=0) {
		this.x = x;
		this.y = y;
	}
	sum() {
		return this.x + this.y;	
	}
	add(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}
	minus(point) {
		return new Point(this.x - point.x, this.y - point.y);
	}
	mixSmallest(...points) {
		return new Point(
			Math.min(...points.map(p => p.x).concat(this.x)),
			Math.min(...points.map(p => p.y).concat(this.y))
		);
	}
	mixSmallestPoints(...points) {
		return new Point(
			Math.min(...points.map(p => p.x)),
			Math.min(...points.map(p => p.y))
		);
	}
	mixLargest(...points) {
		return new Point(
			Math.max(...points.map(p => p.x).concat(this.x)),
			Math.max(...points.map(p => p.y).concat(this.y))
		);
	}
	mixLargestPoints(...points) {
		return new Point(
			Math.max(...points.map(p => p.x)),
			Math.max(...points.map(p => p.y))
		);
	}
	list() {
		return [this.x, this.y];
	}
}

class Rectangle {
	constructor(point=new Point(), size=new Point(1, 1)) {
		this.point = point;
		this.size = size;
	}
	getArea() {
		return this.size.x * this.size.y;
	}
	sizeToPoint() {
		return this.point.add(this.size);
	}
	boundRectangles(...rectangles) {
		let point = Point.prototype.mixSmallestPoints(...rectangles.map(r => r.point)),
			size = Point.prototype.mixLargestPoints(...rectangles.map(r => r.sizeToPoint())).minus(point);
		return new Rectangle(point, size);
	}
	bound(...rectangles) {
		let point = this.point.mixSmallest(...rectangles.map(r => r.point).concat(this.point)),
			size = this.sizeToPoint().mixLargest(...rectangles.map(r => r.sizeToPoint()).concat(this.size)).minus(point);
		return new Rectangle(point, size);
	}
	collide(rectangle) {
		let ap = this.point,
			as = this.sizeToPoint(),
			bp = rectangle.point,
			bs = rectangle.sizeToPoint();
		
			// X
		let ax = ap.x > bp.x,
			bx = ap.x > bs.x,
			cx = as.x > bp.x,
			dx = as.x > bs.x,
			// Y
			ay = ap.y > bp.y,
			by = ap.y > bs.y,
			cy = as.y > bp.y,
			dy = as.y > bs.y;

		let cpx = ax ^ cx,
			csx = bx ^ dx,
			cpy = ay ^ cy,
			csy = by ^ dy;

		return (cpx || csx) && (cpy || csy);
	}
}


class OldNode {
	constructor(nodes=[]) {
		this.max = 3;
		this.nodes = nodes;
		this.boundingBox = new Rectangle();
	}
	isNode() {
		return this.nodes[0] instanceof Node;
	}
	bound(...rectangles) {
		return this.boundingBox.boundRectangles(...rectangles);
	}
	atLimit() {
		return this.nodes.length >= this.max;
	}
	sortByInlargment(item) {
		return this.nodes.sort((a, b) => a.bounds(item).getArea() > b.bounds(item).getArea() ? 1 : -1);
	}
	splitNodes(item) {
		let nodes = this.sortByInlargment(item),
			idx = Math.ceil((nodes.length + 1)/2);
		this.nodes = nodes.slice(0, idx);
		let node = new Node(nodes.slice(idx).concat(item));
		return node;
	}
	insert(item) {
		this.nodes.push(item);
		this.boundingBox = this.bound(...this.nodes);
	}
}

class Node {
	constructor(nodes=[]) {
		this.max = 3;
		this.nodes = nodes;
		this.boundingBox = nodes.length ? this.getBoundingBox() : new Rectangle();
		
		this.branch = false;
		this.root = false;
	}
	flat() {
		return this.nodes.filter(node => node instanceof Node).map(node => node.flat()).concat(this.boundingBox).flat();
	}
	pastLimit() {
		return this.nodes.length > this.max;
	}
	getRectangle(item) {
		return item instanceof Node ? item.boundingBox : item;
	}
	getBoundingBox(item) {
		let rectangles = this.nodes.map(node => this.getRectangle(node));
		return Rectangle.prototype.boundRectangles(...(item ? rectangles.concat(this.getRectangle(item)) : rectangles));
	}
	createBranch(nodes) {
		let branch = new Node(nodes);
		branch.branch = this.branch;
		return branch;
	}
	split() {
		// DESTRUCTIVE to this.nodes
		/*
		function addPoint(rectangle) { return rectangle.point.x + rectangle.point.y; }
		return this.createBranch(this.nodes
			.map(function(node) { return {node, node, rect: this.getRectangle(node)}; }.bind(this))

			.sort((a, b) => a.point  ? 1 : -1)

			.map(obj => obj.node)
			.splice(Math.ceil(this.nodes.length)/2));
		*/

		let picked = this.nodes.sort((a, b) => {
				a = this.getRectangle(a); b = this.getRectangle(b);
				return a.point.sum() < b.point.sum() ? 1 : -1;
			}).pop(),
			c = this.getRectangle(picked),
			rest = this.nodes.sort((a, b) => {
				a = this.getRectangle(a); b = this.getRectangle(b);
				return Math.abs(a.point.minus(c.point).sum()) < Math.abs(b.point.minus(c.point).sum()) ? -1 : 1;
			}).pop();

		return this.createBranch([].concat(picked, rest))
	}
	insertIntoNodes(item) {
		let bbs = {};
		this.nodes.forEach(node => bbs[node] = node.getBoundingBox(item));

		let node = this.nodes.sort((a, b) => bbs[a].getArea() > bbs[b].getArea() ? 1 : -1)[0];
		return node.insert(item);
	}
	insert(item) {
		let insertResult = this.branch ? this.insertIntoNodes(item) : item;
		if (insertResult) {
			this.nodes.push(insertResult);
		}

		let result = undefined;
		if (this.pastLimit()) {
			let nodeB = this.split();	
			if (this.root) {
				this.nodes = [this.createBranch(this.nodes), nodeB];
				this.branch = true;
			} else {
				result = nodeB;
			}
		}

		this.boundingBox = this.getBoundingBox();
		return result
	}
}
