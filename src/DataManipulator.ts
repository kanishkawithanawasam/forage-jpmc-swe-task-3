import { ServerRespond } from './DataStreamer';

export interface Row {
  price_abc: number,
  price_def: number,
  timestamp: Date,
  ratio: number,
  upper_bound:number,
  lower_bound:number,
  trigger_alert: number|undefined
}


export class DataManipulator {

  static montlyRatios: number[][]=[];
  static dailyRatios:number[]=[]
  static curMonth: number=0;
  static lastMonth: number=0;


  static generateRow(serverResponds: ServerRespond[]): Row {
    const priceABC = (serverResponds[0].top_ask.price+serverResponds[0].top_bid.price)/2;
    const priceDEF = (serverResponds[1].top_ask.price+serverResponds[1].top_bid.price)/2;
    const ratio =priceABC/priceDEF;
    this.dailyRatios.push(ratio)

    this.curMonth = new Date(serverResponds[0].timestamp).getMonth();

    if(this.lastMonth==0){
      this.lastMonth=this.curMonth;
    }

    if(this.curMonth!=this.lastMonth){
        this.lastMonth=this.curMonth;
        this.montlyRatios.push(this.dailyRatios);
        this.dailyRatios=[]
    }

    let averageRatio=0;
    let count =0;
    this.montlyRatios.forEach(array => {
      array.forEach(ratio => {
        averageRatio+=ratio;
        count+=1
      });
    });

    averageRatio = averageRatio/count;
    if(this.montlyRatios.length==0){
      averageRatio=1;
    }
    if(this.montlyRatios.length==12){
      this.montlyRatios.shift();
    }

    const upperBound = (averageRatio)+((averageRatio)*0.03);
    const lowerBound = (averageRatio)-((averageRatio)*0.03);

    console.log(upperBound,lowerBound,this.montlyRatios)

    return {
      price_abc:priceABC,
      price_def:priceDEF,
      ratio,
      timestamp: serverResponds[0].timestamp>serverResponds[1].timestamp ?
      serverResponds[0].timestamp:serverResponds[1].timestamp,
      upper_bound:upperBound,
      lower_bound:lowerBound,
      trigger_alert: (ratio > upperBound || ratio < lowerBound) ? ratio : undefined,
    }
  }

}
