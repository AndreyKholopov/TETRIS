class Game {
	static points = {
		'1': 40,
		'2': 100,
		'3': 300,
		'4': 1200,
		'5': 4000
	};

	constructor() {
		this.reset();
	}

	get level() {
		return Math.floor(this.lines * 0.1);
	}

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
			score: this.score,
			level: this.level,
			lines: this.lines,
			nextPiece: this.nextPiece,
			playField,
			isGameOver: this.topOut
		};
	}

	reset() {
		this.score = 0;
		this.lines = 0;
		this.topOut = false;
		this.playField = this.createPlayField();
		this.activePiece = this.createPiece();
		this.nextPiece = this.createPiece();
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
		if (this.topOut) return;

		this.activePiece.y += 1;

		if (this.hasCollision()) {
			this.activePiece.y -=1;
			this.lockPiece();
			const clearedLines = this.clearLines();
			this.updateScore(clearedLines);
			this.updatePieces();
		}

		if (this.hasCollision()) {
			this.topOut = true;
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

	//block line removal
	clearLines() {
		const rows = 20;
		const columns = 10;
		let lines = [];

		for (let y = rows - 1; y >= 0; y--){
			let numberOfBlocks = 0;

			for (let x = 0; x < columns; x++) {
				if (this.playField[y][x]) {
					numberOfBlocks += 1;
				}
			}

			if (numberOfBlocks === 0) {
				break;
			} else if (numberOfBlocks < columns) {
				continue;
			} else if (numberOfBlocks === columns) {
				lines.unshift(y);
			}
		}

		for (let index of lines) {
			this.playField.splice(index, 1);
			this.playField.unshift(new Array(columns).fill(0));
		}

		return lines.length;
	}

	//game score update
	updateScore(clearedLines) {
		if (clearedLines > 0) {
			this.score += Game.points[clearedLines] * (this.level + 1);
			this.lines += clearedLines;
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

		this.playFieldBorderWidth = 4;
		this.playFieldX = this.playFieldBorderWidth;
		this.playFieldY = this.playFieldBorderWidth;
		this.playFieldWidth = this.width * 2 / 3;
		this.playFieldHeight = this.height;
		this.playFieldInnerWidth = this.playFieldWidth - this.playFieldBorderWidth * 2;
		this.playFieldInnerHeight = this.playFieldHeight - this.playFieldBorderWidth * 2;

		this.blockWidth = this.playFieldInnerWidth / columns;
		this.blockHeight = this.playFieldInnerHeight / rows;

		this.panelX = this.playFieldWidth + 10;
		this.panelY = 0;
		this.panelWidth = this.width / 3;
		this.panelHeight = this.height;

		this.element.appendChild(this.canvas);
	}

	//render Game
	renderMainScreen (state) {
		this.clearScreen();
		this.renderPlayField(state);	
		this.renderPanel(state);
	}

	//start screen render
	renderStartScreen() {
		this.context.fillStyle = '#fff';
		this.context.font = '18px "Press Start 2P"';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText('Press ENTER to Start', this.width / 2, this.height / 2);
	}

	//pause screen render
	renderPauseScreen() {
		this.context.fillStyle = 'rgba(0, 0, 0, 0.75)';
		this.context.fillRect(0, 0, this.width, this.height);

		this.context.fillStyle = '#fff';
		this.context.font = '18px "Press Start 2P"';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText('Press ENTER to Resume', this.width / 2, this.height / 2);
	}

	//game over screen render
	renderEndScreen({ score }) {
		this.clearScreen();

		this.context.fillStyle = '#fff';
		this.context.font = '18px "Press Start 2P"';
		this.context.textAlign = 'center';
		this.context.textBaseline = 'middle';
		this.context.fillText('GAME OVER', this.width / 2, this.height / 2 - 48);
		this.context.fillText(`Score: ${score}`, this.width / 2, this.height / 2);
		this.context.fillText('Press ENTER to Restart', this.width / 2, this.height / 2 + 48);
	}

	//cleaning the playing field
	clearScreen () {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	//render of the playing field
	renderPlayField ({ playField }) {
		for (let y = 0; y < playField.length; y++) {
			const line = playField[y];

			for (let x = 0; x < line.length; x++) {
				const block = line[x];

				if (block) {
					this.renderBlock(
						this.playFieldX + (x * this.blockWidth), 
						this.playFieldY + (y * this.blockHeight), 
						this.blockWidth,
						this.blockHeight, 
						View.colors[block]
					);
				}
			}
		}

		this.context.strokeStyle = '#fff';
		this.context.lineWidth = this.playFieldBorderWidth;
		this.context.strokeRect(0, 0, this.playFieldWidth, this.playFieldHeight);
	}

	//Sidebar display
	renderPanel({ level, score, lines, nextPiece}) {
		this.context.textAlign = 'start';
		this.context.textBaseline = 'top';
		this.context.fillStyle = '#fff';
		this.context.font = '14px "Press Start 2P"';

		this.context.fillText(`Score: ${score}`, this.panelX, this.panelY + 0);
		this.context.fillText(`Lines: ${lines}`, this.panelX, this.panelY + 24);
		this.context.fillText(`Level: ${level}`, this.panelX, this.panelY + 48);
		this.context.fillText('Next: ', this.panelX, this.panelY + 96);

		for (let y = 0; y < nextPiece.blocks.length; y++) {
			for (let x = 0; x < nextPiece.blocks[y].length; x++) {
				const block = nextPiece.blocks[y][x];

				if (block) {
					this.renderBlock(
						this.panelX + (x * this.blockWidth * 0.7),
						this.panelY + 100 + (y * this.blockHeight * 0.7),
						this.blockWidth * 0.7,
						this.blockHeight * 0.7,
						View.colors[block]
					);
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

class Controler {
	constructor(game, view) {
		this.game = game;
		this.view = view;
		this.intervalId = null;
		this.isPlaying = false;

		document.addEventListener('keydown', this.handlKeyDown.bind(this));
		document.addEventListener('keyup', this.handlKeyUp.bind(this));

		this.view.renderStartScreen();
	}

	update() {
		this.game.movePieceDown();
		this.updateView();
	}

	play() {
		this.isPlaying = true;
		this.startTimer();
		this.updateView();
	}

	pause() {
		this.isPlaying = false;
		this.stopTimer();
		this.updateView();
	}

	reset() {
		this.game.reset();
		this.play();
	}

	updateView() {
		const state = this.game.getState();

		if (state.isGameOver) {
			this.view.renderEndScreen(state);
		} else if (!this.isPlaying) {
			this.view.renderPauseScreen();
		} else {
			this.view.renderMainScreen(state);
		}
	}

	startTimer() {
		const speed = 1000 - this.game.getState().level * 100;

		if (!this.intervalId) {
			this.intervalId = setInterval(() => {
				this.update();
			}, speed > 0 ? speed : 100);
		}	
	}

	stopTimer() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	handlKeyDown(event) {
		const state = this.game.getState();

		switch (event.keyCode) {
			case 13: //ENTER
				if (state.isGameOver) {
					this.reset();
				} else if (this.isPlaying) {
					this.pause();
				} else {
					this.play();
				}
				break;
			case 37: //Left arrow
				if (this.isPlaying) {
					this.game.movePieceLeft();
					this.updateView();
					break;
				}
			case 38: //Up arrow
				if (this.isPlaying) {
					this.game.rotatePiece();
					this.updateView();
					break;
				}		
			case 39: //Right arrow 
				if (this.isPlaying) {
					this.game.movePieceRight();
					this.updateView();
					break;
				}
			case 40: //Down arrow
				if (this.isPlaying) {
					this.stopTimer();
					this.game.movePieceDown();
					this.updateView();
					break;
				}	
		}
	}

	handlKeyUp(event) {
		switch (event.keyCode) {
			case 40: //Down arrow
				this.startTimer();
				break;
		}
	}
}

const root = document.querySelector('#root');

const game = new Game();
const view = new View(root, 480, 640, 20, 10);
const controler = new Controler(game, view);

window.game = game;
window.view = view;
window.controler = controler;
