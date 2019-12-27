export default class Game {
	score = 0;
	lines = 0;
	level = 0;
	//field contains 20 rows and 10 columns
	playField = [
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0],
	[0,0,0,0,0,0,0,0,0,0]
	];
	activePieceX = 0;
	activePieceY = 0;
	activePiece = {
		x: 0,
		y: 0,
		blocks: [
			[0,1,0],
			[1,1,1],
			[0,0,0]
		],
	};

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
}