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
  typeSelectedObject :any;
  private color = d3.scaleOrdinal(d3.schemeCategory10);
  constructor(private dataParserService : DataParserService) { }

  ngOnInit() {
    this.data = JSON.parse(this.dataParserService.getTransformedData());
  }

  ngAfterViewInit(): void {
    this.buildGraph();
  }

  buildGraph(){
    var xMax = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    var yMax = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    var width = xMax, height = yMax -20/100.0*yMax;
    var valueline = d3.line()
      .x(function(d) { return d[0]; })
      .y(function(d) { return d[1]; })
      .curve(d3.curveCatmullRomClosed);

    var polygon, centroid;
    var scaleFactor = 2;

    var svg = d3.select('svg')
      .attr("width", width)
      .attr("height", height);

    var g = svg.append('g')
      .attr('class', "everything");

    //Building the groups:
    var groups = g.append('g').attr('class', 'groups');

    //Building the links
    var link = g.selectAll(".link")
      .data(this.data.links)
      .enter().append("line")
      .attr("class", "link")
      .style("stroke", "#555")
      .style("stroke-width", 2);
    
    //building the nodes
    var node=g.selectAll(".node")
      .data(this.data.nodes).enter()
      .append("g")
      .attr("class", "node")
      .on("click", (d:any) => {
        this.detailNode(d);
      });

    node.append("circle")
      .attr("id", (d:any) => {return d.id})  // id to be able to make difference between circle
      .attr("r", 10)
      .style("fill", (d:any) =>{ return this.color(d.group); })
      
    node.append("text")
      .text((d : any) => { return d.name })
      .style("font", "10px sans-serif");
    
    // count members of each group. Groups with less
    // than 3 member will not be considered (creating
    // a convex hull need 3 points at least)
    var groupIds = d3.set(this.data.nodes.map((n:any) => { return n.group; }))
    .values()
    .map( (groupId : any) => {
      return { 
        groupId : groupId,
        count : this.data.nodes.filter((n:any) => { return n.group == groupId; }).length
      };
    })
    .filter( (group) => { return group.count > 2;})
    .map( (group) => { return group.groupId; });

    var paths = groups.selectAll('.path_placeholder')
      .data(groupIds, (d : any) => { return d; },)
      .enter()
      .append('g')
      .attr("class", "path_placeholder")
      .append("path")
      .attr("id", (d : any) => { return d; })
      .attr('stroke', (d:any) =>{ return this.color(d); })
      .attr("stroke-width", "0.5px")
      .attr('fill', (d:any) =>{ return this.color(d); })
      .attr("fill-opacity", 0.1)
      .attr('opacity', 0)
      .on("click", (d:any) => {
        this.detailCluster(d);
      });

    paths
      .transition()
      .duration(2000)
      .attr('opacity', 1); 
    
    // Force algorithm is applied to data.nodes
    var simulation = d3.forceSimulation(this.data.nodes)
      .force("link", d3.forceLink() .id((d: any) => { return d.id; }).links(this.data.links))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width/3, height/2))
      .nodes(this.data.nodes)
      .on("tick", () =>{
        link
          .attr("x1", (d: any) => { return d.source.x; })
          .attr("y1", (d: any) => { return d.source.y; })
          .attr("x2", (d: any) => { return d.target.x; })
          .attr("y2", (d: any) => { return d.target.y; });

          node.attr("transform", (d:any) => { return "translate(" + d.x + "," + d.y + ")"; });
          updateGroups();
      })
      .force('link')

    var polygonGenerator = function(groupId) {
      var node_coords : [number,number][]= node
        .filter((d:any) => { return d.group == groupId; })
        .data()
        .map((d:any) => { return [d.x, d.y]; });
        
      return d3.polygonHull(node_coords);
    };

    function updateGroups() {
      groupIds.forEach(function(groupId) {
        var path = paths.filter(function(d) { return d == groupId;})
          .attr('transform', 'scale(1) translate(0,0)')
          .attr('d', function(d) {
            polygon = polygonGenerator(d);          
            centroid = d3.polygonCentroid(polygon);
            return valueline(
              polygon.map(function(point) {
                return [  point[0] - centroid[0], point[1] - centroid[1] ];
              })
            );
          });
    
        d3.select(path.node().parentNode).attr('transform', 'translate('  + centroid[0] + ',' + (centroid[1]) + ') scale(' + scaleFactor + ')');
      });
    }

    //add zoom capabilities 
    var zoom_handler = d3.zoom()
    .on("zoom", () => {
      g.attr("transform", d3.event.transform)
    });

    zoom_handler(d3.selectAll('svg')); 

  }

  onClose(unselect: boolean) {
    if(unselect == true){
      d3.selectAll("circle").attr('opacity', 1);  // change opacity of all nodes to unselected
      d3.selectAll("path").attr("stroke-width", "0.5px");  // change stroke-width of all nodes to unselected
      this.selectedObject=null;
      this.typeSelectedObject = null;
    }
  }

  detailCluster(cluster: any){
    if(this.selectedObject == cluster){
      this.selectedObject = null;
      d3.selectAll("path[id=\"" + cluster + "\"]").attr("stroke-width", "0.5px");  // change SW of selected element to unselected
      this.typeSelectedObject = null;
    }
    else{
      d3.selectAll("path").attr("stroke-width", "0.5px");  // change SW of all clusters to unselected
      d3.selectAll("circle").attr('opacity', 1);  // change opacity of all nodes to unselected
      d3.selectAll("path[id=\"" + cluster + "\"]").attr("stroke-width", "1.5px");  // change SW of selected element to selected
      this.selectedObject = cluster;
      this.typeSelectedObject = "cluster";
    }
  }

  detailNode(node : any){
    if(this.selectedObject == node){
      this.selectedObject = null;
      d3.selectAll("circle[id=\"" + node.id + "\"]").attr('opacity', 1);  // change opacity of selected element to unselected
      this.typeSelectedObject = null;
    }
    else{
      d3.selectAll("circle").attr('opacity', 1);  // change opacity of all nodes to unselected
      d3.selectAll("path").attr("stroke-width", "0.5px");  // change SW of all clusters to unselected
      d3.selectAll("circle[id=\"" + node.id + "\"]").attr('opacity', 0.5);  // change opacity of selected element to selected
      this.selectedObject = node;
      this.typeSelectedObject = "node";
    }
  }

}
