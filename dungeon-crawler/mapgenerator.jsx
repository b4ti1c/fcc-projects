const MapSize = 75;

const rand = function(min, max) {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (num > max) num = max;

    return num;
}

class Leaf {
    constructor(x, y, width, height) {
        this.minLeafSize = 15;

        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    split() {
        if (this.leftChild != null || this.rightChild != null) return false;

        let splitHorizontal = Math.random() > 0.5;

        if (this.width > this.height * 1.25) splitHorizontal = false;
        if (this.height > this.width * 1.25) splitHorizontal = true;

        let max = (splitHorizontal ? this.height : this.width) - this.minLeafSize;
        if (max <= this.minLeafSize) return false;

        let split = rand(max, this.minLeafSize);

        if (splitHorizontal) {
            this.leftChild = new Leaf(this.x, this.y, this.width, split);
            this.rightChild = new Leaf(this.x, this.y + split, this.width, this.height - split);
        } else {
            this.leftChild = new Leaf(this.x, this.y, split, this.height);
            this.rightChild = new Leaf(this.x + split, this.y, this.width - split, this.height);
        }

        return true;
    }

    createRooms() {
        if (this.leftChild != null || this.rightChild != null){
            if (this.leftChild != null) this.leftChild.createRooms();
            if (this.rightChild != null) this.rightChild.createRooms();

            if (this.leftChild != null && this.rightChild != null)
                this.createHall(this.leftChild.getRoom(), this.rightChild.getRoom());
        } else {
            let roomSize = {
                width: rand(4, this.width - 2),
                height: rand(4, this.height - 2)
            };

            let roomPos = {
                x: rand(1, this.width - roomSize.width - 1),
                y: rand(1, this.height - roomSize.height - 1)
            };

            this.room = {
                x: this.x + roomPos.x,
                y: this.y + roomPos.y,
                width: roomSize.width,
                height: roomSize.height
            };
        }
    }

    getRoom() {
        if (this.room) return this.room;

        let leftChildRoom, rightChildRoom;

        if (this.leftChild != null) leftChildRoom = this.leftChild.getRoom();
        if (this.rightChild != null) rightChildRoom = this.rightChild.getRoom();

        if (leftChildRoom == null && rightChildRoom == null) return null;
        if (rightChildRoom == null) return leftChildRoom;
        if (leftChildRoom == null) return rightChildRoom;

        if (Math.random() > 0.5) return leftChildRoom;
        else return rightChildRoom;
    }

    createHall(leftRoom, rightRoom) {
        this.halls = [];

        let point1 = {
            x: rand(leftRoom.x + 1, leftRoom.x + leftRoom.width - 1),
            y: rand(leftRoom.y + 1, leftRoom.y + leftRoom.height - 1)
        };

        let point2 = {
            x: rand(rightRoom.x + 1, rightRoom.x + rightRoom.width - 1),
            y: rand(rightRoom.y + 1, rightRoom.y + rightRoom.height - 1)
        };

        let width = point2.x - point1.x;
        let height = point2.y - point1.y;

        if (width < 0) {
            if (height < 0) {
                if (Math.random() < 0.5) {
                    this.halls.push({x: point2.x, y: point1.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point2.x, y: point2.y, width: 2, height: Math.abs(height)});
                } else {
                    this.halls.push({x: point2.x, y: point2.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point1.x, y: point2.y, width: 2, height: Math.abs(height)});
                }
            } else if (height > 0) {
                // if (Math.random() < 0.5) {
                    this.halls.push({x: point2.x, y: point1.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point2.x, y: point1.y, width: 2, height: Math.abs(height)});
                // } else {
                //     this.halls.push({x: point2.x, y: point2.y, width: Math.abs(width), height: 2});
                //     this.halls.push({x: point1.x, y: point1.y, width: 2, height: Math.abs(height)});
                // }
            } else this.halls.push({x: point2.x, y: point2.y, width: Math.abs(width), height: 2});
        } else if (width > 0) {
            if (height < 0) {
                // if (Math.random() < 0.5) {
                    this.halls.push({x: point1.x, y: point2.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point1.x, y: point2.y, width: 2, height: Math.abs(height)});
                // } else {
                //     this.halls.push({x: point1.x, y: point1.y, width: Math.abs(width), height: 2});
                //     this.halls.push({x: point2.x, y: point2.y, width: 2, height: Math.abs(height)});
                // }
            } else if (height > 0) {
                if (Math.random() < 0.5) {
                    this.halls.push({x: point1.x, y: point1.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point2.x, y: point1.y, width: 2, height: Math.abs(height)});
                } else {
                    this.halls.push({x: point1.x, y: point2.y, width: Math.abs(width), height: 2});
                    this.halls.push({x: point1.x, y: point1.y, width: 2, height: Math.abs(height)});
                }
            } else this.halls.push({x: point1.x, y: point1.y, width: Math.abs(width), height: 2});
        } else { //width == 0
            if (height < 0) this.halls.push({x: point2.x, y: point2.y, width: 2, height: Math.abs(height)});
            else if (height > 0) this.halls.push({x: point1.x, y: point1.y, width: 2, height: Math.abs(height)});
        }
    }
}


const maxLeafSize = 20;

let leafs = [];
let root = new Leaf(0, 0, MapSize, MapSize);

leafs.push(root);

let didSplit = true;

while (didSplit) {
    didSplit = false;

    leafs.forEach(leaf => {
        if (leaf.leftChild == null && leaf.rightChild == null)
            if(leaf.width > maxLeafSize || leaf.height > maxLeafSize || Math.random() > 0.75)
                if(leaf.split()) {
                    leafs.push(leaf.leftChild);
                    leafs.push(leaf.rightChild);
                    didSplit = true;
                }
    });
}

root.createRooms();

let rooms = [];
let halls = [];

leafs.forEach(leaf => {
    leaf.room && rooms.push(leaf.room)
    leaf.halls && leaf.halls.forEach(hall => halls.push(hall));
});

rooms = rooms.map(room => {
    room.cX = room.x + room.width / 2;
    room.cY = room.y + room.height / 2;

    return room;
});

const startRoom = rooms.reduce((pre, cur) => {
    const area = cur.width * cur.height;
    if (area < pre) return cur;
    return pre;
}, 9999999);

rooms.sort((A, B) => {
    const posA = Math.pow(A.cX - startRoom.cX, 2) + Math.pow(A.cY - startRoom.cY, 2);
    const posB = Math.pow(B.cX - startRoom.cX, 2) + Math.pow(B.cY - startRoom.cY, 2);

    if(posA <= posB) return -1;
    return 1;
});

window.rooms = rooms;
window.halls = halls;
