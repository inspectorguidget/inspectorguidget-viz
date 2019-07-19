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
  constructor(private dataParserService : DataParserService) { }

  ngOnInit() {
    this.data = JSON.parse(this.dataParserService.getTransformedData());
  }

  ngAfterViewInit(): void {
    this.buildGraph();
  }

  buildGraph(){
    var width = 1000, height = 500;

    var valueline = d3.line()
      .x(function(d) { return d[0]; })
      .y(function(d) { return d[1]; })
      .curve(d3.curveCatmullRomClosed);

    var curveTypes = ['curveBasisClosed', 'curveCardinalClosed', 'curveCatmullRomClosed', 'curveLinearClosed'];
    var polygon, centroid;
    var scaleFactor = 2;

    var svg = d3.select('svg')
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
      .style("stroke-width", 2);
    
    //building the nodes
    var node=svg.selectAll(".node")
      .data(this.data.nodes).enter()
      .append("g")
      .attr("class", "node")
      .on("click", (d:any) => {
        this.detailNode(d);
      });

    node.append("circle")
      .attr("id", (d:any) => {return d.id})  // id to be able to make difference between circle
      .attr("r", 10)
      .style("fill", "#8b9599")
      
    node.append("text")
      .text((d : any) => { return d.name })
      .style("font", "10px sans-serif");
    
    // Something to do with the groups
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
      .attr('stroke', "#8B9599")
      .attr('fill', "#ECEDED")
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
      .force("center", d3.forceCenter(width/2, height/2))
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
      
              // to scale the shape properly around its points:
              // move the 'g' element to the centroid point, translate
              // all the path around the center of the 'g' and then
              // we can scale the 'g' element properly
              return valueline(
                polygon.map(function(point) {
                  return [  point[0] - centroid[0], point[1] - centroid[1] ];
                })
              );
            });
      
          d3.select(path.node().parentNode).attr('transform', 'translate('  + centroid[0] + ',' + (centroid[1]) + ') scale(' + scaleFactor + ')');
        });
      }
  
  }

  onClose(unselect: boolean) {
    if(unselect == true){
      d3.selectAll("circle").style("fill", "#8B9599");  // change color of all nodes to unselected
      d3.selectAll("path").style("stroke", "#8B9599");  // change color of all nodes to unselected
      this.selectedObject=null;
      this.typeSelectedObject = null;
    }
  }

  detailCluster(cluster: any){
    if(this.selectedObject == cluster){
      this.selectedObject = null;
      d3.selectAll("path[id=\"" + cluster + "\"]").style("stroke", "#8B9599");  // change color of selected element to unselected
      this.typeSelectedObject = null;
    }
    else{
      d3.selectAll("path").style("stroke", "#8B9599");  // change color of all clusters to unselected
      d3.selectAll("circle").style("fill", "#8B9599");  // change color of all nodes to unselected
      d3.selectAll("path[id=\"" + cluster + "\"]").style("stroke", "#D5D6D6");  // change color of selected element to selected
      this.selectedObject = cluster;
      this.typeSelectedObject = "cluster";
    }
  }

  detailNode(node : any){
    if(this.selectedObject == node){
      this.selectedObject = null;
      d3.selectAll("circle[id=\"" + node.id + "\"]").style("fill", "#8B9599");  // change color of selected element to unselected
      this.typeSelectedObject = null;
    }
    else{
      d3.selectAll("circle").style("fill", "#8B9599");  // change color of all nodes to unselected
      d3.selectAll("path").style("stroke", "#8B9599");  // change color of all clusters to unselected
      d3.selectAll("circle[id=\"" + node.id + "\"]").style("fill", "#D5D6D6");  // change color of selected element to selected
      this.selectedObject = node;
      this.typeSelectedObject = "node";
    }
  }

}
