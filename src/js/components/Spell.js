export default class Spell {
    constructor(json) {
        this.name = json.name; 
        this.HPValue = json.HPValue; 
        this.scatter = json.scatter;
        this.imageUrl = json.image.url;
        this.imageWidth = json.image.width;
        this.imageHeight = json.image.height;
        this.iconUrl = json.iconUrl; 
        this.cooldown = json.cooldown; 
        this.requiredLevel = json.requiredLevel;
        this.direction = json.direction;
        this.currentCooldown = 0;
    }

    use() {
        this.currentCooldown = this.cooldown;
    }

    triggerCD() {
        if (this.currentCooldown > 0) this.currentCooldown--;
    }
}