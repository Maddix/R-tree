$(function() { main(); });

function main() {
	var engine = Engine();

	// Create the layerContainer (AKA - Graphic controller)
	var layerContainer = engine.Graphic.layerContainer({
		area: [820, 820],
		container: document.getElementById("canvasDiv")
	});

	layerContainer.add(engine.Graphic.layer(), "draw");

	// eventGroup
	var eventGroup = engine.Event.eventGroup();
	var mouseGroup = engine.Event.eventGroup();

	// Create input and an eventContext to handle it.
	var input = engine.Input.getInput();
	input.addListeners();

	// Data object
	var DATA = {
		layerContainer,
		screenArea: layerContainer.area,
		eventGroup,
		mouseGroup,
		input,
		mainLoop: null,
		engine
	};

	content(DATA);

	// Make the loop
	DATA.mainLoop = DATA.engine.Util.loop({func:function(frame) {
		let inputData = DATA.input.getInput();
		eventGroup.update(inputData);
		layerContainer.update();
	}, fps:60, useRAF:true});

	// Kick off the loop
	DATA.mainLoop.start();
}

function content(data) {
	let layer = data.layerContainer.get("draw"),
		engine = data.engine,
		input = data.input,
		eventGroup = data.eventGroup,
		gui = engine.GUI;

	let clickEvent = engine.Event.continuousEvent({
		trigger: 1
	});
	eventGroup.add(clickEvent);

	function getRectangle(point, size) {
		return new Rectangle(
			point || new Point(
				engine.Math.intRandom(30, 600),
				engine.Math.intRandom(30, 600)),
			size || new Point(
				engine.Math.intRandom(5, 50),
				engine.Math.intRandom(5, 50)
			),
		);
	}

	class GraphicalRectangle {
		constructor(point, size, color) {
			let colors = ["red", "green", "brown", "blue", "yellow", "orange", "black", "white", "pink", "purple"];
			this.rectangle = getRectangle(point, size);
			this.graphic = engine.Graphic.borderedRectangle({
				pos: this.rectangle.point.list(),
				area: this.rectangle.size.list(),
				borderColor: color || colors[engine.Math.intRandom(0, colors.length-1)],
				alpha: 0
			});
			layer.add(this.graphic);
		}
		updateRectangle(rectangle) {
			this.rectangle = rectangle;
			this.update();
			return this
		}
		update(point=this.rectangle.point, size=this.rectangle.size) {
			this.rectangle.point = point;
			this.rectangle.size = size;
			this.graphic.pos = this.rectangle.point.list();
			this.graphic.area = this.rectangle.size.list();
		}
	}


	let rects = engine.Creation.genArray(4, idx => new GraphicalRectangle(undefined, undefined, undefined))

	//A = new GraphicalRectangle(undefined, new Point(45, 45));
	//B = new GraphicalRectangle(undefined, new Point(25, 25));
	//C = new GraphicalRectangle(undefined, new Point(25, 25));
	//D = new GraphicalRectangle(undefined, new Point(85, 25));
	//E = new GraphicalRectangle(new Point(60, 30), new Point(25, 25), "blue");
	//G = new GraphicalRectangle(undefined, undefined, "pink")
		//.updateRectangle(A.rectangle.bound(B.rectangle, C.rectangle, D.rectangle, E.rectangle));

	node = new Node();
	node.root = true;
	//node.insert(A.rectangle);
	//node.insert(B.rectangle);
	//node.insert(C.rectangle);
	//node.insert(D.rectangle);
	rects.forEach(item => node.insert(item.rectangle));

	console.log(node);

	let bounds = node.flat();

	bounds.slice(0, bounds.length-1).forEach(rectangle => {
		new GraphicalRectangle(rectangle.point, rectangle.size);
	});

	//let F = new GraphicalRectangle()
		//.updateRectangle(node.boundingBox);


	clickEvent.add(function(e) {
		let mouse = input.getMouse();
		//B.update(new Point(...mouse));
		//G.updateRectangle(A.rectangle.bound(B.rectangle, C.rectangle, D.rectangle, E.rectangle));

		//console.log("A collide with B?:", Boolean(A.rectangle.collide(B.rectangle)));
	});
}

