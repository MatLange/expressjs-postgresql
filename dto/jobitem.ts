import { AutoProperties } from './Autoproperties'; 

export class JobItem extends AutoProperties {
    websiteid: string | null = null;
    title: string | null = null;
    baseUrl: string | null = null;
    url: string | null = null;
    location: string | null = null;
    date: string | null = null;
    duration: string | null = null;
    //[key: string]: string | null | ((value: string) => void); // Update index signature
  
    constructor (baseUrl: string, websiteid: string) {
      super({websiteid:websiteid,title:"",baseUrl:baseUrl, url:"", location:"", date:null, duration:null});
      return this;
    }
  };