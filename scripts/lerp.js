class Lerp{
    constructor(){
        this.from = from;
        this.to = to;
        this.delay = delay;

        this.value = from;
        this.time = 0;
    }
    update(timeDelta){
        const t = this.time/this.delay;

        // interpolation
        this.value = (1-t) * this.from + t * this.to;

        this.time += timeDelta;

        if(this.time >= this.delay){
            delete this;
        }
    }

}