import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {

  constructor(private router: Router) { }

  dataFile:File;
  jsonData: any;
  transformedData : string;

  setFile(file: File){
    this.dataFile = file;
  }

  parseFile(file:File){
    this.setFile(file);

    let myPromise = new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        this.jsonData = fileReader.result;
        resolve("jsonData initialisation done");
      }
      fileReader.readAsText(this.dataFile);
    });

    myPromise.then((successMessage) => {
      console.log(successMessage);
      this.transform();
    });

  }

  transform(){
    let jsonObj = JSON.parse(this.jsonData);
    let widBinding = jsonObj['widgetBindings'];

    let nodes : String = "\"nodes\" : [";
    let links: String = "], \"links\" : [";

    let indexWB = 0;

    for (let wb of widBinding){

      nodes +="{ \"id\" : \"" + indexWB + "i0\", \"name\" : \"Interaction\", \"type\" : \"interaction\" },";
      nodes +="{ \"id\" : \"" + indexWB + "c0\", \"name\" : \"UICommand\", \"type\" : \"cmd\"},";

      
      let widgets = wb['widgets'];
      let nbWidget = 0;
      for(let widget of widgets){
        nodes += "{ \"id\" : \"" + indexWB + "w" + nbWidget + "\", \"name\" : \"Widget\", \"type\" : \"widgets\"}";

        links +="{ \"source\" : \"" + indexWB + "i0\", \"target\" : \"" + indexWB + "w" + nbWidget + "\" },";
        links += "{ \"source\" : \"" + indexWB + "w" + nbWidget + "\", \"target\" : \"" + indexWB + "c0\" }";

        nbWidget++;
        if(nbWidget != widgets.length){
          nodes += ",";
          links += ",";
        }
      }
      
      indexWB = indexWB + 1;
      if(indexWB != widBinding.length){
        nodes += ",";
        links += ",";
      }
    }

    this.transformedData = "{" + nodes + links + "]}";

    //once the transformation is done, we move to the visualisation page
    this.router.navigate(['/visualisation']);
  }

  getTransformedData() : string {
    return this.transformedData;
  }

  getInfo(node : any){

    let jsonObject = JSON.parse(this.jsonData);
    let id : String = node.id;
    let type: String = node.type;

    let wbNumber = id.slice(0, id.indexOf(type.charAt(0)));
    let instanceNumber = id.slice(id.indexOf(type.charAt(0)) + 1);  
    let info :any;
    if(type === "widgets"){
      info = JSON.stringify(jsonObject['widgetBindings'][wbNumber][node.type][instanceNumber]);
    }
    else{
      info = JSON.stringify(jsonObject['widgetBindings'][wbNumber][node.type]);
    }
    return info;
  }

  getClass(node:any){
    let info = JSON.parse(this.getInfo(node));
    let nodeClass: any;
    if(node.type === "widgets"){
      nodeClass = JSON.stringify(info['usages'][0]['classRef']['className']);
    }
    else if (node.type === "interaction"){
      nodeClass = JSON.stringify(info['handlers'][0]['location']['classRef']['className']);
    }
    else {
      nodeClass = JSON.stringify(info['location']['classRef']['className']);
    }
    return nodeClass;
  }

}
