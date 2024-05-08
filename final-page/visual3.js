import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let w = window.innerWidth;
let h = window.innerHeight;
// let containerWidth = document.getElementById("container6").offsetWidth;
// let containerHeight = document.getElementById("container6").offsetHeight;
let xPadding = 70;
let yPadding = 50;
// let w = containerWidth - xPadding * 2; // Adjust for padding
// let h = containerHeight - yPadding * 2; // Adjust for padding



let mapTooltip = d3.select("body").append("div")
  .attr("class", "tooltip-donut")
  .style("opacity", 0);

let viz = d3.select("#viz3")
  .append("svg")
  .attr("class", "viz")
  // .attr("width", w )
  // .attr("height", h)
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 "+w+" "+h)
  
  ;

let mapGroup = viz.append("g");

// ZOOM Behaviour
const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on("zoom", zoomed)
;
// viz.call(zoom); // activates manual zoom functionality
let zoomscale = 0;
let zoomtranslate = [0, 0];
function zoomed(event) {
  const { transform } = event;
  zoomscale = event.transform.k;
  zoomtranslate = [event.transform.x, event.transform.y];
  // console.log(event)
  mapGroup.attr("transform", transform);
  mapGroup.attr("stroke-width", 1 / transform.k);
}


// map data functions
function getMapColor(d) {
  if (d.properties.name === "Canada") {
    return "#0D47A1";
  } else if (d.properties.name === "United States of America") {
    return "#1976D2";
  } else if (d.properties.name === "Norway" || d.properties.name === "Finland" || d.properties.name === "Sweden" || d.properties.name === "Iceland" || d.properties.name === "Thailand") {
    return "#1565C0"
  } else if (d.properties.name === "United Kingdom") {
    return "#1E88E5"
  } else if (d.properties.name === "Germany") {
    return "#42A5F5"
  } else if (d.properties.name === "France") {
    return "#64B5F6"
  } else if (d.properties.name === "Mainland China") {
    return "#64B5F6"
  } else if (d.properties.name === "India") {
    return "#90CAF9"
  } else if (d.properties.name === "Nepal") {
    return "#BBDEFB"
  } else if (d.properties.name === "Australia") {
    return "#1565C0"
  } else {
    return "darkgrey"
  }
}

// force graph functions
// function showForceGraphExplanation(){
//   // Create three text elements
//   var text1 = document.createElement("div");
//   text1.textContent = "Blue: Gender-separate Toilets";

//   var text2 = document.createElement("div");
//   text2.textContent = "White: Coexistence of Both";

//   var text3 = document.createElement("div");
//   text3.textContent = "Red: Gender-neutral Toilets";

//   // Add classes to style the text elements
//   text1.classList.add("line");
//   text2.classList.add("line");
//   text3.classList.add("line");

//   // Append the text elements to the body
//   document.body.appendChild(text1);
//   document.body.appendChild(text2);
//   document.body.appendChild(text3);

//   // Adjust positioning
//   text1.style.top = "350px";
//   text2.style.top = "390px";
//   text3.style.top = "430px";
// }
function filterOutOtherTypes(d) {
  // console.log(d)
  if (d.Male === "True" && d.Female === "True" && d.Unisex === "True" || d.AllGender === "True") {
    return true
  } else if (d.Male === "True" && d.Female === "True" && d.Unisex === "False" && d.AllGender === "False") {
    return true
  } else if (d.Male === "False" && d.Female === "False" && d.Unisex === "True" || d.AllGender === "True") {
    return true
  } else {
    return false
  }
}
function getType(d) {
  return d[0].split(" ")[2];
  //here we split the string (d[0])with .splict(" ") and get the 2nd index
}
function getToiletColor(d) {
  // let sampleToilet = d[1][0];
  let toiletType = getType(d)

  if (toiletType == "both") {
    return "white"
  } else if (toiletType == "separate") {
    return "blue"
  } else if (toiletType == "neutral") {
    return "maroon"
  }

}
function getToiletType(d) {
  // console.log(d)
  if (d.Male === "True" && d.Female === "True" && d.Unisex === "True" || d.AllGender === "True") {
    return "both"; //white
  } else if (d.Male === "True" && d.Female === "True" && d.Unisex === "False" && d.AllGender === "False") {
    return "separate"; // blue
  } else if (d.Male === "False" && d.Female === "False" && d.Unisex === "True" || d.AllGender === "True") {
    return "neutral"; //red
  }
}

function getForceXGoal(d) {
  let onDisplayMapSectionX = -zoomtranslate[0] / zoomscale;
  let onDisplayMapSectionY = -zoomtranslate[1] / zoomscale;
  let onDisplayMapSectionW = w / zoomscale;
  let onDisplayMapSectionH = h / zoomscale;

  return onDisplayMapSectionX + onDisplayMapSectionW*0.15;
}
function getForceYGoal(d) {
  // all the code here is about determing
  // the right locations within whatever section of the map
  // is present in the viewport (which always differs based on browser size)
  let onDisplayMapSectionX = -zoomtranslate[0] / zoomscale;
  let onDisplayMapSectionY = -zoomtranslate[1] / zoomscale;
  let onDisplayMapSectionW = w / zoomscale;
  let onDisplayMapSectionH = h / zoomscale;

  if (getType(d) == "both") {
    return onDisplayMapSectionY + (onDisplayMapSectionH*0.25) 
  } else if (getType(d) == "separate") {
    return onDisplayMapSectionY + (onDisplayMapSectionH*0.5) 
  } else if (getType(d) == "neutral") {
    return onDisplayMapSectionY + (onDisplayMapSectionH*0.75) 
  }



}



// function gotData(geoData,toiletData) {
function gotData(incomingData) {
  console.log(incomingData)
  // geo
  let geoData = incomingData[0];
  let AUS_lowres = geoData.features.find(d => d.properties.admin == "Australia");
  let ausGeo = incomingData[2];
  // toilets
  let toiletData = incomingData[1];
  let ausToiletData = incomingData[3];



  
  // these functions use toiletData
  // that's why I left them here:
  function handleMouseOverMap(event, d) {
    if (d3.select(this).node().getAttribute("opacity") == 0) {
      return
    }
    if (d3.select(this).attr("fill") == "darkgrey") {
      return // if the country is lightgrey, this function is done
    }
  
    d3.select(this)
      .attr("opacity", 0.8)
      .attr("stroke", "black")// Change stroke color on hover
      .attr("stroke-width", 2.5)
  

    let toiletInfo = toiletData.find(data => data.country === d.properties.name);
  
    if (toiletInfo) {
      mapTooltip.transition()
        .duration(50)
        .style("opacity", 1);
      
        // Use toiletInfo to populate tooltip content as needed
      mapTooltip.html(`Country: ${d.properties.name}<br>Prevalence: ${toiletInfo.prevalence}<br>Year Started: ${toiletInfo.year}`);
    }
  

  
    // solution from: https://www.fabiofranchino.com/log/bring-to-front-and-restore-an-svg-element-with-d3/
    const list = [...this.parentNode.children]
    const index = list.indexOf(this)
    d.oindex = index
    this.parentNode.appendChild(this)
  
    mapTooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY + 10) + "px");
  }
  function handleMouseOutMap(event, d) {
    if (d3.select(this).node().getAttribute("opacity") == 0) {
      return
    }
  
    d3.select(this)
      .attr("stroke", "lightgrey")// Restore original stroke color on mouse out
      .attr("stroke-width", 1)
      .attr("opacity", 1)
  
    // solution from: https://www.fabiofranchino.com/log/bring-to-front-and-restore-an-svg-element-with-d3/
    const index = d.oindex
    this.parentNode.insertBefore(this, this.parentNode.children[index])
  
    mapTooltip.style("opacity", 0);
  }
  
  // 
  // DRAW MAP
  // 
  let projection = d3.geoMercator()
    .fitExtent([[50, 50], [w - 50, h - 50]], geoData)
  ;
  console.log(projection.scale())
  let path = d3.geoPath(projection);

  // HIGH RES Australia
  let ausMap = mapGroup.selectAll(".states").data(ausGeo.features).enter()
    .append("path")
    .attr("class", "states")
    .attr("d", path)
    .attr("fill", "none")
    .attr("stroke", "grey")
    .attr("opacity", 0) // hide it at first
  ;

  // LOW RES world
  let countries = mapGroup.selectAll(".provinces").data(geoData.features).enter()
    .append("path")
    .attr("class", "provinces")
    .attr("d", path)
    .attr("fill", getMapColor)
    .attr("stroke", "lightgrey")
    .attr("stroke-width", 1)
    .attr("opacity", 1)
    .on("mouseover", handleMouseOverMap)
    .on("mouseout", handleMouseOutMap)
  ;

  
  function zoomOut(){

    countries.transition();
    viz.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(0,0)
        .scale(1)
    );
    mapTooltip.transition();
  }
  function zoomToAUS() {
    mapTooltip.remove()

    // move to low res ausrralia outline:
    const [[x0, y0], [x1, y1]] = path.bounds(AUS_lowres);
    viz.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(w / 2, h / 2)
        .scale(Math.min(5, 0.9 / Math.max((x1 - x0) / w, (y1 - y0) / h)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
    );

    ausMap.transition().duration(750).attr("opacity", 1)
    countries.filter(d => d.properties.admin == "Australia").transition().duration(750).attr("opacity", 0).on("end", function(){
      console.log("zoomed to australia")
    });
  }


  // document.body.addEventListener("keypress", function (e) {
  //   if(e.key == "1"){
  //     zoomToAUS();
  //   }

  // })



  enterView({
    selector: '.container6-step1',
    enter: function(el) {
      zoomToAUS();
    },
    exit: function(el) {
      zoomOut();

    },
    offset: 0.1,
  })

  enterView({
    selector: '.container6-step2',
    enter: function(el) {
      showForceGraph();
    },
    exit: function(el) {
      zoomToAUS();

    },
    offset: 0.1,
  })


  function showForceGraph(){
    //showForceGraphExplanation();


    // FORMAT DATA:
    ausToiletData = ausToiletData.filter(filterOutOtherTypes)
    let groupedData = d3.groups(ausToiletData, (d) => {
      return (Math.round(d.Longitude)) + " " + (Math.round(d.Latitude)) + " " + getToiletType(d)
      //IMPORTANT: Math.round把数值四舍五入到整数～returns the value of a number rounded to the nearest integer
    })
    groupedData = groupedData.map(function (group) {
      group.x = Math.random() * w
      group.y = Math.random() * h
      group.onMap = false;
      return group
    });

    let grouped = mapGroup.selectAll(".toilet")
      .data(groupedData)
      .enter()
      .append("g")
      .attr("class", "toilet")
      .attr("transform", function (d) {

        return "translate(" + d.x + "," + d.y + ")";     // CHANGED THIS!

      }); // Initially position above the map
    
    function getRadius(d) {
      return (Math.sqrt(d[1].length) * 0.9) * projection.scale()/700;
    }

    grouped.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", getRadius)
      .attr("fill", getToiletColor)
      .attr("opacity", 0.8)
      .attr("stroke-width", 0.7)
    ;


    const simulation = d3.forceSimulation(groupedData)
      .force("x", d3.forceX(getForceXGoal).strength(0.09))
      .force("y", d3.forceY(getForceYGoal).strength(0.09))
      .force("collision", d3.forceCollide(getRadius).strength(1.5))
      .on("tick", ticked)
    ;

    function ticked() {
      grouped.attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      });
    }
    function getForceXMap(d) {

      let latitude = parseFloat(Math.round(d[1][0].Latitude));
      let longitude = parseFloat(Math.round(d[1][0].Longitude));

      if (!isNaN(latitude) && !isNaN(longitude)) {
        let projectedCoordinates = projection([longitude, latitude]);
        return projectedCoordinates[0];
      } else {
        return 0
      }


    }
    function getForceYMap(d) {
      let latitude = parseFloat(Math.round(d[1][0].Latitude));
      let longitude = parseFloat(Math.round(d[1][0].Longitude));

      if (!isNaN(latitude) && !isNaN(longitude)) {
        let projectedCoordinates = projection([longitude, latitude]);
        return projectedCoordinates[1];
      } else {
        return 0
      }
    }

    grouped.selectAll("circle").on("click", function (event, d) {

      console.log(getType(d))
      groupedData.forEach(dd => {
        if(getType(dd) == getType(d)){
          dd.onMap = !dd.onMap;
        }
      });


      simulation
        .force("x", d3.forceX(function(d){
          if(d.onMap == true){
            return getForceXMap(d)
          }else{
            return getForceXGoal(d) 
          }
        }).strength(0.09))
        .force("y", d3.forceY(function(d){
          if(d.onMap == true){
            return getForceYMap(d)
          }else{
            return getForceYGoal(d) 
          }
        }).strength(0.09))
        .force("collision", d3.forceCollide(function (d) {
          console.log(d)
          return getRadius(d) * 0.7
        }).strength(0.7))


      grouped.selectAll("circle")
        .transition()
        .attr("r", function (d) {
          return getRadius(d) * 0.7
        })
      ;

      simulation.alpha(1).restart(); 


    });
  }

  

  
  
  // document.body.addEventListener("keypress", function (e) {
  //   // if(e.key == "1"){
  //   //   zoomToAUS();
  //   // }else 
  //   if(e.key == "2"){
  //     showForceGraph();
  //     // console.log(zoomTransform)


  //     // var scale = zoomscale;
  //     // var translate = zoomtranslate;
  //     // console.log(zoomscale, zoomtranslate)
  //     // var newViewBox = [
  //     //   -translate[0] / scale,
  //     //   -translate[1] / scale,
  //     //   w / scale,
  //     //   h / scale
  //     // ];
  //     // mapGroup.append("circle").attr("cx", newViewBox[0]).attr("cy", newViewBox[1]).attr("r", 100).attr("fill", 0)
  //     // console.log(newViewBox)
  //   }
    
  // })


}





Promise.all([
  d3.json("datasets/world_lowres.json"),
  d3.csv("datasets/countries.csv"),
  d3.json("datasets/aus_lga.geojson"),
  d3.csv("datasets/Australia_toiletmapexport.csv")
]).then(gotData)




