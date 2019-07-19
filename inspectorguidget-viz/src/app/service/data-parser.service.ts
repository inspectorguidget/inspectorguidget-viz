import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class DataParserService {

  constructor(private router: Router) { }

  private dataFile:File;
  private jsonData: any;
  private transformedData : string;
  private existingClass : String[] = [];

  // select file the user dropped
  setFile(file: File){
    this.dataFile = file;
  }

  // read the file and extract it's content as a string (async!)
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

  // build the file according to the format necessary to build graph
  transform(){
    this.getAllClasses();

    let jsonObj = JSON.parse(this.jsonData);
    let widBinding = jsonObj['widgetBindings'];

    let nodes : String = "\"nodes\" : [";
    let links: String = "], \"links\" : [";

    let indexWB = 0;

    for (let wb of widBinding){

      nodes +="{ \"id\" : \"" + indexWB + "i0\", \"name\" : \"Interaction\", \"type\" : \"interaction\", \"group\" : "+ this.getGroupId(wb['interaction']['handlers'][0]['location']['classRef']['className']) + " },";
      nodes +="{ \"id\" : \"" + indexWB + "c0\", \"name\" : \"UICommand\", \"type\" : \"cmd\", \"group\" : " + this.getGroupId(wb['cmd']['location']['classRef']['className']) + "},";

      
      let widgets = wb['widgets'];
      let nbWidget = 0;
      for(let widget of widgets){
        nodes += "{ \"id\" : \"" + indexWB + "w" + nbWidget + "\", \"name\" : \"Widget\", \"type\" : \"widgets\", \"group\" : " + this.getGroupId(widget['usages'][0]['classRef']['className']) + "}";

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
    console.log(this.transformedData);
    this.router.navigate(['/visualisation']);
  }

  // 
  getTransformedData() : string {
    return this.transformedData;
  }

  // find and return the info displayed in detail-element
  getNodeInfo(node : any){

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

    //TODO: return info we're going to display
    return info;
  }

  //enables us to build the clusters according to the classes
  getAllClasses(){
    let jsonObj = JSON.parse(this.jsonData);

    
    let widgetBindings = jsonObj['widgetBindings'];

    for(let wb of widgetBindings){

      //getting class of all widgets
      let widgets = wb['widgets'];
      for(let widget of widgets){
        let myClass = widget['usages'][0]['classRef']['className'];
        if(this.getGroupId(myClass) == -1){
          this.existingClass.push(myClass);
        }
      }

      //getting class of all interaction
      let interactionClass = wb['interaction']['handlers'][0]['location']['classRef']['className'];
      if(this.getGroupId(interactionClass) == -1){
        this.existingClass.push(interactionClass);
      }

      //getting class of all UICmd
      let cmdClass = wb['cmd']['location']['classRef']['className'];
      if(this.getGroupId(cmdClass) == -1){
        this.existingClass.push(cmdClass);
      }
    }

  }

  //return number group, parameter : name of class, return -1 if not in, also use to know if a className is in array
  getGroupId(className : any){
    let i : number;
    for(i=0;i<this.existingClass.length;i++){
      if(className == this.existingClass[i]){
        break;
      }
    }

    if(i==this.existingClass.length){
      return -1;
    }
    else{
      //console.log(i);
      return i;
    }
  }

}
