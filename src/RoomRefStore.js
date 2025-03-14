class RoomRefStore {
  static instance = null;

  constructor() {
    if (!RoomRefStore.instance) {
      this.floorRef = null;
      this.backWall = null;
      this.leftWall = null;
      this.rightWall = null;

      this.wallRefs = [];

      // Move this to some other place
      this.roomCenter = null;

      RoomRefStore.instance = this;
    }
    return RoomRefStore.instance;
  }

  setFloor(ref) {
    this.floorRef = ref;
  }

  getFloor() {
    return this.floorRef;
  }

  setBackWall(ref) {
    this.backWall = ref;
  }

  getBackWall() {
    return this.backWall;
  }

  setLeftWall(ref) {
    this.leftWall = ref;
  }

  setRightWall(ref) {
    this.rightWall = ref;
  }

  getWalls() {
    return [this.leftWall, this.backWall, this.rightWall];
  }

  setRoomCenter(pos) {
    this.roomCenter = pos;
  }

  getRoomCenter() {
    return this.roomCenter;
  }

}

// Export as a singleton instance
export default new RoomRefStore();
