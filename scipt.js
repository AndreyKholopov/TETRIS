class Game {
	score = 0;
	lines = 0;
	level = 0;
	//field contains 20 rows and 10 columns
	playField = this.createPlayField();
	activePieceX = 0;
	activePieceY = 0;
	activePiece = this.createPiece();
	nextPiece = this.createPiece();

	//returning the state of the playing field
	getState() {
		const playField = this.createPlayField();
		const {y: pieceY, x: pieceX, blocks} = this.activePiece;

		for (let y = 0; y < this.playField.length; y++) {
			playField[y] = [];

			for (let x = 0; x < this.playField[y].length; x++) {
				playField[y][x] = this.playField[y][x];
			}
		}

		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (blocks[y][x]) {
					playField[pieceY + y][pieceX + x] = blocks[y][x];
				}
			}
		}

		return {
			playField
		};
	}

	//creation of a playing field
	createPlayField() {
		const playField = [];

		for (let y = 0; y < 20; y++) {
			playField[y] = [];

			for (let x = 0; x < 10; x++) {
				playField[y][x] = 0;
			}
		}
		return playField;
	}

	//block creation
	createPiece() {
		const index = Math.floor(Math.random() * 7);
		const type = 'IJLOSTZ'[index];
		const piece = {};

		switch (type) {
			case 'I':
				piece.blocks = [
					[0,0,0,0],
					[1,1,1,1],
					[0,0,0,0],
					[0,0,0,0]
				];
				break;
			case 'J':
				piece.blocks = [
					[0,0,0],
					[2,2,2],
					[0,0,2]
				];
				break;
			case 'L':
				piece.blocks = [
					[0,0,0],
					[3,3,3],
					[3,0,0]
				];
				break;
			case 'O':
				piece.blocks = [
					[0,0,0,0],
					[0,4,4,0],
					[0,4,4,0],
					[0,0,0,0]
				];
				break;
			case 'S':
				piece.blocks = [
					[0,0,0],
					[0,5,5],
					[5,5,0]
				];
				break;
			case 'T':
				piece.blocks = [
					[0,0,0],
					[6,6,6],
					[0,6,0]
				];
				break;
			case 'Z':
				piece.blocks = [
					[0,0,0],
					[7,7,0],
					[0,7,7]
				];
				break;
			default:
				throw new Error('unknown type of figure');
		}

		piece.x = Math.floor((10 - piece.blocks[0].length) / 2);
		piece.y = -1;

		return piece;
	}

	//functions movement of the active figure
	movePieceLeft() {
		this.activePiece.x -= 1;

		if (this.hasCollision()) {
			this.activePiece.x +=1;
		}
	}
	movePieceRight() {
		this.activePiece.x += 1;

		if (this.hasCollision()) {
			this.activePiece.x -=1;
		}
	}
	movePieceDown() {
		this.activePiece.y += 1;

		if (this.hasCollision()) {
			this.activePiece.y -=1;
			this.lockPiece();
			this.updatePieces();
		}
	}

	//figure rotation
	rotatePiece() {
		this.rotateBlocks();

		if (this.hasCollision()) {
			this.rotateBlocks(false);
		}
	}

	rotateBlocks(clockwise = true) {
		const blocks = this.activePiece.blocks;
		const length = blocks.length;
		const x = Math.floor(length / 2);
		const y = length - 1;

		for (let i = 0; i < x; i++) {
			for (let j = i; j < y - i; j++) {
				const temp = blocks[i][j];

				if (clockwise) {
					blocks[i][j] = blocks[y - j][i];
					blocks[y - j][i] = blocks[y - i][y - j];
					blocks[y - i][y - j] = blocks[j][y - i];
					blocks[j][y - i] = temp;
				} 	else {
					blocks[i][j] = blocks[j][y -i];
					blocks[j][y - i] = blocks[y - i][y - j];
					blocks[y - i][y - j] = blocks[y - j][i];
					blocks[y - j][i] = temp;
				}					
			}
		}
	}

	//Checking a figure out of the field and collisions with other figures
	hasCollision() {
		const {y: pieceY, x: pieceX, blocks} = this.activePiece;

		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (blocks[y][x] && 
					((this.playField[pieceY + y] === undefined || this.playField[pieceY + y][pieceX + x] === undefined) ||
						this.playField[pieceY + y][pieceX + x])) {
					return true;
			}
		}
	}
	return false;
}

	//transfer of values from activePiece to playField
	lockPiece() {
		const {y: pieceY, x: pieceX, blocks} = this.activePiece;

		for (let y = 0; y < blocks.length; y++) {
			for (let x = 0; x < blocks[y].length; x++) {
				if (blocks[y][x]) {
					this.playField[pieceY + y][pieceX + x] = blocks[y][x];
				}
			}
		}
	}

	//next block creation
	updatePieces () {
		this.activePiece = this.nextPiece;
		this.nextPiece = this.createPiece();
	}
}

class View {
	//block colors
	static colors = {
		'1': '#ff0000',
		'2': '#00ff00',
		'3': '#ffff00',
		'4': '#0000ff',
		'5': '#ff9900',
		'6': '#9900ff',
		'7': '#00ffff'
	};

	//definition of arguments when creating a class view
	constructor (element, width, height, rows, columns) {
		this.element = element;
		this.width = width;
		this.height = height;

		this.canvas = document.createElement('canvas');
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.context = this.canvas.getContext('2d');

		this.blockWidth = this.width / columns;
		this.blockHeight = this.height / rows;

		this.element.appendChild(this.canvas);
	}

	render ({ playField }) {
		this.clearScreen();
		this.renderPlayField(playField);	
	}

	//cleaning the playing field
	clearScreen () {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	//render of the playing field
	renderPlayField (playField) {
		for (let y = 0; y < playField.length; y++) {
			const line = playField[y];

			for (let x = 0; x < line.length; x++) {
				const block = line[x];

				if (block) {
					this.renderBlock(x * this.blockWidth, y * this.blockHeight, this.blockWidth, this.blockHeight, View.colors[block]);
				}
			}
		}
	}

	//render active block
	renderBlock (x, y, width, height, color) {
		this.context.fillStyle = color;
		this.context.strokeStyle = '#000';
		this.context.lineWidth = 2;

		this.context.fillRect(x, y, width, height);
		this.context.strokeRect(x, y, width, height);
	}
}

const root = document.querySelector('#root');

const game = new Game();
const view = new View(root, 320, 640, 20, 10);

window.game = game;
window.view = view;

document.addEventListener('keydown', event => {
	switch (event.keyCode) {
		case 37: //Left arrow
			game.movePieceLeft();
			view.render(game.getState());
			break;
		case 38: //Up arrow
			game.rotatePiece();
			view.render(game.getState());
			break;
		case 39: //Right arrow 
			game.movePieceRight();
			view.render(game.getState());
			break;
		case 40: //Down arrow
			game.movePieceDown();
			view.render(game.getState());
			break;
	}
});
