import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import {DataParserService} from '../service/data-parser.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-graph',
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit {
  @ViewChild('graph', {static: false})
  private graphRef: ElementRef;

  data : any;
  selectedObject : any = null;
  constructor(private dataParserService : DataParserService) { }

  ngOnInit() {
    this.data = JSON.parse(this.dataParserService.getTransformedData());
  }

  ngAfterViewInit(): void {
    this.buildGraph();
  }

  buildGraph(){
    
    var width = 1000, height = 500;

    var svg = d3.select(this.graphRef.nativeElement).append("svg")
      .attr("width", width)
      .attr("height", height);

    //Building the groups:
    var groups = svg.append('g').attr('class', 'groups');

    //Building the links
    var link = svg.selectAll(".link")
      .data(this.data.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke", "#555")
      .style("stroke-width", 4);
    
    //building the nodes
    var node=svg.selectAll(".node")
      .data(this.data.nodes).enter()
      .append("g")
      .attr("class", "node")
      .attr("id", (d:any) => {return this.getNodeClass(d)});

    
    node.append("circle")
      .attr("id", (d:any) => {return d.id})  // id to be able to make difference between circle
      .attr("r", 20)
      .style("fill", "#8b9599")
      .on("click", (d:any) => {
        this.detailNode(d);
      });

    node.append("text")
      .text((d : any) => { return d.name })
      .style("font", "10px sans-serif");

    // Force algorithm is applied to data.nodes
    var simulation = d3.forceSimulation(this.data.nodes)                 
        .force("link", d3.forceLink()                   // This force provides links between nodes
        .id((d: any) => { return d.id; })               // This provide  the id of a node
        .links(this.data.links)                         // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(-400)) //nodes repulse each others
    .force("center", d3.forceCenter(width/2, height/2)) //attract elements toward specified point
    .on("tick", () =>{
      link
        .attr("x1", (d: any) => { return d.source.x; })
        .attr("y1", (d: any) => { return d.source.y; })
        .attr("x2", (d: any) => { return d.target.x; })
        .attr("y2", (d: any) => { return d.target.y; });

      node.attr("transform", (d:any) => { return "translate(" + d.x + "," + d.y + ")"; });
    });

  // add zoom capabilities 
  var zoom_handler = d3.zoom()
    .on("zoom", () => {
      d3.select("svg").attr("transform", d3.event.transform)
    });
  zoom_handler(svg);  

  }

  detailNode(node : any){
    if(this.selectedObject == node){
      this.selectedObject = null;
      d3.selectAll("circle[id=\"" + node.id + "\"]").style("fill", "#8B9599");  // change color of selected element to unselected
    }
    else{
      d3.selectAll("circle").style("fill", "#8B9599");  // change color of all nodes to unselected
      d3.selectAll("circle[id=\"" + node.id + "\"]").style("fill", "#D5D6D6");  // change color of selected element to selected
      this.selectedObject = node;
    }
  }

  getNodeClass(node : any){
    let nodeClass = this.dataParserService.getClass(node);
    return nodeClass;
  }

  onClose(unselect: boolean) {
    if(unselect == true){
      d3.selectAll("circle").style("fill", "#8B9599");  // change color of all nodes to unselected
      this.selectedObject=null;
    }
  }

  displayArray(array : any[]){
    for(let i=0; i<array.length;i++){
      console.log(array[i]);
    }
  }

}
