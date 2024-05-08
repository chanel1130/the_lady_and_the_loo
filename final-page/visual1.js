import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = 1000;
let h = 1200;
let padding = 25;
let mid1 = padding + (((h / 3) - (padding * 2)) / 2);
let bot1 = (h / 3) - padding -30;
let mid2 = (h / 3) + padding + (((h / 3) - (padding * 2)) / 2)
let bot2 = ((h / 3) * 2) - padding;
let mid3 = h - padding - (((h / 3) - (padding * 2)) / 2)
let bot3 = h - padding -30;


let viz = d3.select("#viz1")
    .append("svg")
    .attr("class", "viz")
    // .style("background-color", "red")
    // .attr("width", w)
    // .attr("height", h)
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 "+w+" "+h)
    ;

let queue = ["males:no", "males:yes", "females:no", "females:yes"]
//survey: do you often queue in front of public toilets?
let gender = ["male", "female"]
let time = ["60s", "90s"]
//average peeing time of males and females
//needs another y axis

let period = ["females on period", "females not on period"]
//on average, what is the percentage of women on period?

let people = new Array(400).fill(0).map((d, i) => {
    d = {}

    if (i < 200) {
        // d.gender = "Male";
        d.gender = gender[0];
        d.time = time[0];      
    
        if(i<178){
            d.queue = queue[0];   
            // queue[0] = d;
        }else{
            d.queue = queue[1];
            // queue[1] = d;
        }
       
    } else {
        // d.gender = "Female";
        d.gender = gender[1];
        d.time = time[1];

        if(i<282){
            d.queue = queue[2];
           
        }else{
            d.queue = queue[3];
            // queue[3] = d;
        }
        d.peeingTime = 90;
        if(i<240){
            d.period = period[0];
            // period[0] = d;
            // console.log(period[0])
        }else{
            d.period = period[1];
            // period[1] = d;
            
        }
    }
    return d
})


let xScaleQueue = d3.scaleBand().range([padding, w - padding]);
let xScaleGender = d3.scaleBand().range([padding, w - padding]);
let xScalePeriod = d3.scaleBand().range([padding, w - padding]);
let yScaleGender = d3.scaleBand().range([1.9*h/3,h/3]);

//1st x axis
xScaleQueue.domain(queue);
// console.log(xScaleQueue(queue[2]))
let queueButton = viz.append("rect").attr("fill","lightgrey")
    .attr("class", "queueButton button")
    .attr("x", 0).attr("y", 0).attr("width", w).attr("height", h / 3).style("cursor", "pointer")
    ;
let xAxisGroupQueue = viz.append("g").attr("class", "xaxis queueaxis").attr("transform", "translate(0," + (bot1) + ")")
.style("font-size","15px");
let xAxisQueue = d3.axisBottom(xScaleQueue).tickSizeOuter(0);


// //2nd x axis
xScaleGender.domain(gender);
let genderButton = viz.append("rect").attr("fill","lightgrey")
    .attr("class", "genderButton button")
    .attr("x", 0).attr("y", h / 3).attr("width", w).attr("height", h / 3).style("cursor", "pointer")
    ;
let xAxisGroupGender = viz.append("g").attr("class", "xaxis genderaxis").style("font-size","15px");
let xAxisGender = d3.axisBottom(xScaleGender).tickSizeOuter(0);
xAxisGroupGender.attr("transform", "translate(0," + (bot2) + ")");

//2nd y axis
yScaleGender.domain(time);
let yAxisGroupGender = viz.append("g").attr("class", "yaxis genderaxis").style("font-size","15px");
let yAxisGender = d3.axisLeft(yScaleGender).tickSizeOuter(0);
yAxisGroupGender.attr("transform", "translate(40,0)");


// //3rd x axis
xScalePeriod.domain(period);
let periodButton = viz.append("rect").attr("fill","lightgrey")
    .attr("class", "periodButton button")
    .attr("x", 0).attr("y", (h / 3) * 2).attr("width", w).attr("height", h / 3).style("cursor", "pointer")
    ;
let xAxisGroupPeriod = viz.append("g").attr("class", "xaxis periodaxis").style("font-size","15px");
let xAxisPeriod = d3.axisBottom(xScalePeriod).tickSizeOuter(0);
xAxisGroupPeriod.attr("transform", "translate(0," + (bot3) + ")");


let graphgroup = viz.append("g").attr("class", "graphgroup")

let radius = 2;
people = people.map(function(node, index) {
    node.radius = radius;
    node.x = xScaleQueue(node.queue)
    node.y = mid1
    return node;
});

let force = d3.forceSimulation(people)
  .force('forceX',d3.forceX(d => xScaleQueue(d.queue)+ xScaleQueue.bandwidth()/2))
  .force('forceY',d3.forceY(d => mid1))
  .force('collide',d3.forceCollide(d => radius*1.5))
  .tick(400)
  .on("end",function(){
      people.forEach(node =>{
          node.queuex = node.x;
          node.queuey = node.y;
          node.x = xScaleGender(node.gender) + xScaleGender.bandwidth()/2;
          node.y = yScaleGender(node.time) + yScaleGender.bandwidth()/2;
      })
      initQueueGraph();
      queueButton.on("click",function(){
          showQueueGraph();
      })
      xAxisGroupQueue.call(xAxisQueue);
      calcGenderPos()
  })
;

function calcGenderPos(){
    force = d3.forceSimulation(people)
    .force('foceX',d3.forceX(d => xScaleGender(d.gender) + xScaleGender.bandwidth()/2)) 
    .force('foceY',d3.forceY(d => yScaleGender(d.time) + yScaleGender.bandwidth()/2))
    .force('collide',d3.forceCollide(d => radius*1.5))
    .tick(400)
    .on("end",function(){
        people.forEach(node =>{
            node.genderx = node.x;
            node.gendery = node.y;
            node.x = xScalePeriod(node.period) + xScalePeriod.bandwidth()/2;
            node.y = mid3;
        })

        genderButton.on("click",function(){
            showGenderGraph();
        });

        xAxisGroupGender.call(xAxisGender);
        yAxisGroupGender.call(yAxisGender);
        calcPeriodPos();

    })

}

function calcPeriodPos(){
    force = d3.forceSimulation(people)
    .force('forceX', d3.forceX( d => xScalePeriod(d.period) + xScalePeriod.bandwidth()/2 ) )
    .force('forceY', d3.forceY( d => mid3 ))
    .force('collide', d3.forceCollide(d => radius*2))
    .tick(400)
    .on("tick", d=>{
      console.log(d)
    })
    .on("end", function(){
     
      people.forEach(node=>{
        
          node.periodx = node.x;
          node.periody = node.y;
        if (node.gender === "female") {
           console.log(node)
        }else{
         
        }
      });

  
      

      periodButton.on("click", function(){
        showPeriodGraph();
      });
      xAxisGroupPeriod.call(xAxisPeriod);
    })
  ;
}

function initQueueGraph(){
    let theSituation = graphgroup.selectAll(".datagroup").data(people, d=>queue);
    let enterSelection = theSituation.enter().append("g")
        .attr("class", "datagroup")
        .attr("transform", function(d){
          d.currentx = d.queuex;
          d.currenty = d.queuey;
          return "translate("+d.queuex+","+d.queuey+")"
        })
 
      enterSelection.append("circle")
        .attr("class","point")
        .attr("r", 2)
        .attr("fill", "black")
        // .attr("r", d => d.radius)
        // .attr("fill", d => d.color)
        ;
    }
    
function showQueueGraph(){
    graphgroup.selectAll(".datagroup")
    .transition()
    .duration(500)
    .attr("transform", function(d){
      d.currentx = d.queuex;
      d.currenty = d.queuey;
      return "translate("+d.queuex+","+d.queuey+")"
    })
  ;
}
function showGenderGraph() {
    graphgroup.selectAll(".datagroup")
      .transition()
      .duration(500)
      .attr("transform", function(d){
        d.currentx = d.genderx;
        d.currenty = d.gendery;
        return "translate("+d.genderx+","+d.gendery+")"
      })
    
    ;
  }

  function showPeriodGraph() {
    graphgroup.selectAll(".datagroup")
      .transition()
      .duration(500)
      .attr("transform", function(d){
        if (d.gender === "female") {
          d.currentx = d.periodx;
          d.currenty = d.periody;
          return "translate(" + d.periodx + "," + d.periody + ")";
        } else {
          return "translate(" + d.currentx + "," + d.currenty + ")";
        }
      })
    ;
  }

  // Add titles above each graph
viz.append("text")
.attr("x", w / 2)
.attr("y", padding / 2 + 15)
.attr("text-anchor", "middle")
.attr("font-size","24px")
.text("Do you often have to queue to use toilets in public space?")
.attr("text-decoration", "underline")
.attr("font-family","Times New Roman")
;
viz.append("text")
.attr("x", w / 2)
.attr("y", h / 3 + padding / 2 + 20)
.attr("text-anchor", "middle")
.attr("font-size","24px")
.text("Average peeing time of males and females")
.attr("text-decoration", "underline")
.attr("font-family","Times New Roman")
;
viz.append("text")
.attr("x", w / 2)
.attr("y", (h / 3) * 2 + padding / 2 + 40)
.attr("text-anchor", "middle")
.attr("font-size","24px")
.text("At any time among females of  menstruating age, at leaset 20% will be menstruating")
.attr("text-decoration", "underline")
.attr("font-family","Times New Roman")
;