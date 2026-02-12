// models/Player.js
export class Player {
    constructor({ id = null, name, createdAt = new Date(), removedAt = null }) {
        this.id = id;
        this.name = name;
        this.createdAt = createdAt;
        this.removedAt = removedAt;
    }
}
