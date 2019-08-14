/*
 * This file is part of InspectorGuidget.
 * InspectorGuidget is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * InspectorGuidget is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with InspectorGuidget.  If not, see <https://www.gnu.org/licenses/>.
 */

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
    this.router.navigate(['/visualisation']);
  }

  // 
  getTransformedData() : string {
    return this.transformedData;
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

  // find and return the info displayed in detail-element
  getNodeInfo(node : any){

    let jsonObject = JSON.parse(this.jsonData);
    let id : String = node.id;
    let type: String = node.type;

    let wbNumber = id.slice(0, id.indexOf(type.charAt(0)));
    let instanceNumber = id.slice(id.indexOf(type.charAt(0)) + 1);  
    let info : String = " name : " + node.name + "\n\n";
    let infoExtractor : any;
    if(type === "widgets"){
      infoExtractor = jsonObject['widgetBindings'][wbNumber][node.type][instanceNumber];
      info += "class : " + infoExtractor['usages'][0]['classRef']['className'] + "\npkg : " + infoExtractor['usages'][0]['classRef']['pkg']
        + "\n\nid : " + infoExtractor['id'] + "\n type : " + infoExtractor['type'];
    }
    else  if (type === "interaction"){
      infoExtractor = jsonObject['widgetBindings'][wbNumber][node.type];
      info += "class : " + infoExtractor['handlers'][0]['location']['classRef']['className'] + "\npkg : " 
      + infoExtractor['handlers'][0]['location']['classRef']['pkg'] + "\n\n type : " + infoExtractor['type'];
    }
    else{
      infoExtractor = jsonObject['widgetBindings'][wbNumber][node.type];
      info += "class : " + infoExtractor['location']['classRef']['className'] + "\npkg : " + infoExtractor['location']['classRef']['pkg']
        + " \n\nlocation : " + infoExtractor['location']['lineStart'] + "-" + infoExtractor['location']['lineEnd'];
    }

    //TODO: return info we're going to display
    return info;
  }

  // get info abour a cluster
  getClusterInfo (cluster : any){  // parameter cluster is number of group
    let className = this.existingClass[cluster];
    let info = "className : " + className + "\n";
    //get all elements in the group

    let nodes = JSON.parse(this.transformedData)['nodes'];
    let elements = "";
    for(let node of nodes){
      if(node.group == cluster){
        elements += node.type + " : " + node.name + ",\n"
      }
    }
    // get package
    let node = nodes[0];
    let pkg = "";
    let infoExtractor = JSON.parse(this.jsonData)['widgetBindings'][0][node.type];
    if(node.type === "widgets"){
      pkg = infoExtractor['usages'][0]['classRef']['pkg'];
    } else if (node.type === "interaction"){
      pkg = infoExtractor['handlers'][0]['location']['classRef']['pkg'];
    } else {
      pkg = infoExtractor['location']['classRef']['pkg'];
    }

    //update info
    info += "pkg : " + pkg + "\n\n";
    info += "Elements : \n" + elements;
    return info;
  }
  

}
