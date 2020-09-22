/** Class implementing the power grid network */
class PowNet {

    // Creates a Power Network object
    constructor(data,time,transNetwork,bebs,table){
        //Assigning data variable
        console.log("pownet data:",data);
        this.data = data;
        this.activeTime = time;
        this.bebs = bebs;
        this.table = table;

        // Reference to transNetwork object
        this.transNet = transNetwork;
        // console.log(this.transNet.Clicked(this.transNet.data.nodes[1]))
        // console.log("trans data in pow",this.transNet.updateNet.Clicked.call(this.transNet.data.nodes[0]))
        this.transNodes = this.transNet.data.nodes

        // Let's create an object just of the charging stations
        this.chargingStations = this.data.nodes.filter(f => f.chSP!=null);

        // array to store clicked link objects
        this.clickedLinks = [];
        this.clickedNodes = [];

        //getting bouding box for svg
        let boundingRect =  d3.select(".view1").node().getBoundingClientRect()
        this.WIDTH = boundingRect.width;
        this.HEIGHT = boundingRect.height;

        //Margins - the bostock way
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        // this.width = 1200 - this.margin.left - this.margin.right;
        // this.height = 900 - this.margin.top-this.margin.bottom;

        //Margins - the bostock way - line chart
        // Gets new sizes and sets new canvas dimensions
        let chart1 = d3.select('.chart-1').node().getBoundingClientRect()
        // let chart2 = d3.select('.chart-2').node().getBoundingClientRect()

        //Margins - the bostock way - line chart
        this.lineHeight = chart1.height -10;
        this.lineWidth = chart1.width - 5;
        this.marginL = {top: 30, right: 10, bottom: 30, left: 60};
        this.widthL = this.lineWidth - this.marginL.left - this.marginL.right;
        this.heightL = this.lineHeight - this.marginL.top-this.marginL.bottom;

    }

    /** Builds network based on data passed into object */
    createNet(){
        console.log("Power Network Object: ",this.data)

        // Setting height of svg dynamically
        this.width = this.WIDTH - this.margin.left - this.margin.right;
        this.height = this.HEIGHT - this.margin.top-this.margin.bottom; 
        
        
        //May need to use this later
        let that = this;

        /** Creating Scales */

        //Finding max/min of aLoad
        let max_aload = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.max(d.aLoad.map(f => {
                // console.log(f.value)
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_aload)
        let min_aload = d3.min(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.min(d.aLoad.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(min_aload)

        //Finding max/min of voltage
        let max_volt = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.max(d.volt.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_volt = d3.min(this.data.nodes.map((d) => {
            //console.log(d)
            return d3.min(d.volt.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_volt,min_volt);

        //Finding max/min of CHSP
        let max_chsp = d3.max(this.data.nodes.map((d) => {
            //console.log(d)
            if(d.chSP!=null){
            return d3.max(d.chSP.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))}
        }));
        let min_chsp = d3.min(this.data.nodes.map((d) => {
            // console.log(d)
            if(d.chSP!=null){
            return d3.min(d.chSP.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))}
        }));
        // console.log(max_chsp,min_chsp);

        //Finding max/min of active power flow
        let max_apf = d3.max(this.data.links.map((d) => {
            //console.log(d)
            return d3.max(d.aPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_apf = d3.min(this.data.links.map((d) => {
            //console.log(d)
            return d3.min(d.aPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_apf,min_apf);


        //Finding max/min of current
        let max_current = d3.max(this.data.links.map((d) => {
            //console.log(d)
            return d3.max(d.current.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_current = d3.min(this.data.links.map((d) => {
            //console.log(d)
            return d3.min(d.current.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_current,min_current)

        //Creating scales
        //TODO set ranges

        //this.aLoadScale = d3.scaleSqrt().range([8,20]).domain([min_aload,max_aload]);
        //The first node has an insanely high max, so for the interest of the scale I'm gonna manually set it

        this.aLoadScale = d3.scaleSequential(d3.interpolatePurples).domain([min_aload,300])
        // console.log(min_aload,min_chsp,max_chsp)
        this.voltScale = d3.scaleSqrt().range([4,15]).domain([min_volt,max_volt]);
        this.powLoadScale = d3.scaleSequential(d3.interpolateGreens).domain([min_chsp,max_chsp]);

        // scale for link line charts
        this.timeScale = d3.scaleLinear().domain([1,288]).range([this.marginL.left,this.marginL.left+this.widthL]);
        this.currentLineScale = d3.scaleLinear().domain([min_current,max_current]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.APFLineScale = d3.scaleLinear().domain([min_apf,max_apf]).range([this.heightL+this.marginL.top,this.marginL.top]);

        // scale for node line charts
        // this.aLoadLineScale = d3.scaleLinear().domain([min_aload,max_aload]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.aLoadLineScale = d3.scaleLinear().domain([0,420]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.voltLineScale = d3.scaleLinear().domain([min_volt,max_volt]).range([this.heightL+this.marginL.top,this.marginL.top]);

        this.currentScale = d3.scaleLinear().range([5,25]).domain([min_current,max_current]);
        let active_power_flow_color = d3.interpolate("#C0DBF6", "#0E447B")
        this.apfscale = d3.scaleSequential(active_power_flow_color).domain([min_apf,max_apf]);
        //Make an ordinal color scale for stations
        let pow_stations = ["n2","n13","n9","n33","n25","n31","n8"];
        this.stationColor = d3.scaleOrdinal(d3.schemeTableau10).domain(pow_stations);


        //Creating svg selection
        let powSVG = d3.select(".view1").select("svg");

        let net_Group = powSVG.select(".net-group")
        let netGroup = net_Group.append("g")
            // .attr("class","net-group")
            .attr("transform","translate("+this.margin.left+","+this.margin.top+")");

        //Create icons first so they are at the back
        this.iconLayer = netGroup.append("g")
            .attr("class","icons");

        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        this.linkLayer = netGroup.append("g")
            .attr("class", "links");

        // Now we create the node group, and the nodes inside it
        this.nodeLayer = netGroup.append("g")
            .attr("class", "nodes");
        
        //Create labels
        this.labelLayer = netGroup.append("g")
            .attr("class","labels");

        
    }


    updateNet(){

        // checks to see if nodes or links have been clicked
        if(this.clickedLinks.length != 0){
            this.updateLine();
        }
        if(this.clickedNodes.length != 0){
            this.updateLineNode();
        }


        let that = this;
        // Now let's create the lines
        let links = this.linkLayer.selectAll("line")
            .data(this.data.links)
            .join("line")
            .classed("link",true)
            .attr("stroke-width",d=>this.currentScale(d.current[this.activeTime].value))
            .attr("stroke",d=>{
                if ((d.current[this.activeTime].value/d.mLC) > 0.9){
                    return "red"
                } 
                else{
                    return this.apfscale(d.aPF[this.activeTime].value)
                }
            })
            //tooltip!
            .on("mouseover", function (d) {
                // Highlights tooltip
                d3.selectAll(".info-panel").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#data-id").html(that.tooltipRenderID_L(d))
                d3.select("#data-info").html(that.tooltipRenderINFO_L(d))
            })
            .on("mouseout", function (d) {
                d3.selectAll(".info-panel").transition()
                    .duration(500)
                    .style("opacity", 0)
            })
            .on("click", function (d) {
                that.clickedLinks.push(d);
                that.updateLine();

            });;

        // Set the width and height of the power grid rectangles
        let rect_height = 13;
        let rect_width = 80;

        let nodes = this.nodeLayer
            .selectAll("rect")
            .data(this.data.nodes)
            .join("rect")
            .attr("class", d=> (d.chSP!=null) ? "charge "+d.id : "norm")
            .classed("node",true)
            .attr("width",`${rect_width}px`)
            .attr("height",`${rect_height}px`)
            .attr("rx",'5px')
            .attr("ry",'5px')
            // .attr("r", d => this.voltScale(d.volt[this.activeTime].value))
            .attr("fill",d => this.aLoadScale(d.aLoad[this.activeTime].value))
            //tooltip!
            .on("mouseover", function (d) {
                // console.log(d)
                // Highlights tooltip
                d3.selectAll(".info-panel").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#data-id").html(that.tooltipRenderID_N(d))
                d3.select("#data-info").html(that.tooltipRenderINFO_N(d))
                if(d3.select(this).classed("charge")){
                    // Checks first to see if its been clicked 
                    if (!d3.select(`#line-${d.id}`).classed("clicked-line")){
                        d3.selectAll("."+d.id)
                            .attr("fill", d => { return (d.id != undefined) ? that.stationColor(d.id) : that.stationColor(d.StationNode.id)})
                            .classed("CHSP",true);
                        //highlights line
                        d3.select(`#line-${d.id}`).classed("active-line-hover",true);
                    }
                }
                
            })
            .on("mouseout", function (d) {
                // De-highlights tooltip
                d3.selectAll(".info-panel").transition()
                    .duration(500)
                    .style("opacity", 0);

                if(d3.select(this).classed("charge")){
                    if (!d3.select(`#line-${d.id}`).classed("clicked-line")){
                        d3.selectAll("."+d.id)
                            .attr("fill", d => { return (d.id != undefined) ? that.aLoadScale(d.aLoad[that.activeTime].value) : that.powLoadScale(d.chSP[that.activeTime].value)})
                            .classed("CHSP",false);
                        d3.selectAll(".station_node")
                            .attr("fill", d => that.stationColor(d.StationNode.id));

                        //de-highlights line
                        d3.select(`#line-${d.id}`).classed("active-line-hover",false);
                    }
                }
            })
            .on("click", function (d){

                if(d3.select(this).classed("charge")){
                    // remove other clicked nodes
                    that.clickedNodes = [];

                    // sees if object has already been clicked
                    if (d3.select(`#line-${d.id}`).classed("clicked-line")){
                        // console.log("been clicked")
                        //Remove tooltip
                        d3.select("#s_tooltip_click")
                            .style("opacity", 0);

                        //Restore table data
                        that.table.BEB = that.bebs;
                        that.table.updateTable();

                        // removes clicked class and active line class
                        d3.select(`#line-${d.id}`).classed("clicked-line",false);
                        d3.select(`#line-${d.id}`).classed("active-line",false);
                        //stops animation
                        stop.call(d3.select(`#line-${d.id}`).node(),d)
                        //Clear path from line chart
                        d3.selectAll(".line-path").style("visibility","hidden");
                        d3.selectAll(".chart-text").style("visibility","hidden");
                    }
                    else{
                        // console.log("hasn't been clicked")
                        // Adds clicked class and active line class
                        d3.select(`#line-${d.id}`).classed("clicked-line",true);
                        d3.select(`#line-${d.id}`).classed("active-line",true);
                        //starts animation indefinitely
                        animate.call(d3.select(`#line-${d.id}`).node(),d)
                        // Looping through data to select correct one
                        let myNode = that.transNodes.filter(f => f.StationNode.id == d.id)[0]
                        that.transNet.Clicked(myNode,false)
                    }
                }
                // If a regular node is clicked
                else{
                    that.clickedNodes.push(d);
                    that.updateLineNode();

                }

            });

        
        let labels = this.labelLayer
            .selectAll("text")
            .data(this.data.nodes)
            .enter().append("text");

        let icons = this.iconLayer
            .selectAll("image")
            .data(this.chargingStations)
            .enter().append("image");
        

        nodes
            .attr("x", function (d,i) {
                let X_Start = 200;
                // Main branch from n1 to 18
                if(d.index < 18){
                    d.x = X_Start;
                    return d.x;
                }
                //Branch off of 3 containing n23->25
                if((d.index > 21) & (d.index < 25)){
                    d.x = X_Start - 150;
                    return d.x;
                }
                //Branch off of 2 containing 19 -> 22
                if((d.index > 17) & (d.index < 22)){
                    d.x = X_Start + 130;
                    return d.x;
                }
                // Bracnh off of 6(may change to 13) containing 26->33
                if( d.index > 24 ){
                    d.x = X_Start + 160;
                    return d.x;
                }
                else{
                    return d.x;
                }
                
            })
            .attr("y", function (d,i) {
                // Main branch from n1 to 18
                let Y_Start = 30;
                let Y_Spacing = 35;
                if(d.index < 18){
                    d.y = Y_Start + i*Y_Spacing;
                    return d.y;
                }
                //Branch off of 3 containing n23->25
                if ((d.index > 21) & (d.index < 25)){
                    d.y = Y_Start + 65 + (i-20)*Y_Spacing;
                    return d.y;
                }
                //Branch off of 2 containing 19 -> 22
                if((d.index > 17) & (d.index < 22)){
                    d.y = Y_Start + 150 + (i-20)*Y_Spacing;
                    return d.y;
                }
                // Branch off of 6 (may change to 13) containing 26->33
                if(d.index > 24){
                    d.y = Y_Start + 100 + (i-20)*Y_Spacing;
                    return d.y;
                }
                else{
                    return d.y;
                }
            });

        links
            .attr("x1", function (d) {
                return d.source.x + rect_width/2;
            })
            .attr("y1", function (d) {
                return d.source.y + rect_height/2;
            })
            .attr("x2", function (d) {
                return d.target.x + rect_width/2;
            })
            .attr("y2", function (d) {
                return d.target.y + rect_height/2;
            });

        icons
            .attr("x",function (d,i){
                // Branch off of 6 (may change to 13) containing 26->33
                // if(d.index > 24){
                //     return d.x - 30;
                // }
                // else{
                //     return d.x + 80;
                // }
                return d.x + 80;
            })
            // .attr("x",d => d.x+75)
            .attr("y",d => d.y-8)
            .attr("xlink:href","icons/outlet.svg")
            .attr("transform", function (d,i){
                // Need to rotate around center of object which is coordinate + height/2 (or width/2 for x)
                // if(d.index > 24){
                //     return `rotate(-45 ${d.x-30+15} ${d.y-8+15})`;
                // }
                // else{
                //     return `rotate(135 ${d.x+80+15} ${d.y-8+15})`;
                // }
                return `rotate(0 ${d.x+80+15} ${d.y-8+15})`
            })
            .attr("height","30px")
            .attr("width","30px")

        labels
            .attr("x",function (d,i){
                // //Branch off of 2 containing 19 -> 22
                // if((d.index > 17) & (d.index < 22)){
                //     d.x = d.x + (rect_width) +10;
                //     return d.x ;
                // }
                // // Branch off of 6 (may change to 13) containing 26->33
                // if(d.index > 24){
                //     d.x = d.x + (rect_width) +10;
                //     return d.x ;
                // }
                // else{
                //     return d.x - 25;
                // }
                return d.x - 25;
            })
            .attr("y",d => d.y+12)
            .text( d=> d.index+1)
            .attr("fill","black");


        function animate() {
            d3.select(this)
                .transition()
                .duration(500)
                .ease(d3.easeLinear)
                .styleTween("stroke-dashoffset", function() {
                    return d3.interpolate(0, 14);
                    })
                .on("end", animate);
        }

        function stop() {
            d3.select(this)
                .interrupt();
        }


        // This clears a selection by listening for a click
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("netsvg")){
            
            //Sets clicked to null and other variables to 0
            that.clickedLinks = [];
            that.clickedNodes = [];
            }
        
        }, true);

        
    }

    handleZoom(){

        // HANDLING ZOOMING BASED ON SVG SIZE

        // Gets new sizes and sets new canvas dimensions
        let view1 = d3.select('.view1').node()

        // // retrieves new size
        let boundingRect = view1.getBoundingClientRect();
        // console.log("BOUNDING RECT",boundingRect)

        // // stores new size width
        let newWidth = boundingRect.width;
        // // stores new size height
        let newHeight = boundingRect.height;

        // Get bounds of net group
        let gBox = d3.select('.net-group').node().getBBox();
        // console.log("gbox",gBox)
        let x0 = gBox.x;
        let x1 = gBox.x + gBox.width;
        let y0 = gBox.y;
        let y1 = gBox.y + gBox.height;

        // calculate new scale
        let k = Math.min(8, 0.9 / Math.max((gBox.width) / (newWidth), (gBox.height) / newHeight))
        // console.log("scale",k)
        // Adding zoom

        const zoom = d3.zoom()
            .on("zoom", zoomed);
        
        d3.select(".netsvg").call(d3.zoom()
            // .extent([[0, 0], [this.width, this.height]])
            // .scaleExtent([1, 8])
            // .transform()
            .on("zoom", zoomed));

        d3.select(".netsvg").call(
            zoom.transform,
            d3.zoomIdentity
                .translate(newWidth / 2, newHeight / 2)
                .scale(k)
                .translate(-(x0 + x1) / 2, -(y0 + y1) / 2)
        );


        function zoomed() {
            let transform = d3.event.transform;
            d3.select('.net-group').attr("transform",transform.toString())
            
                        
        }
    }

    removeNet(){
        /** Clears existing Net**/
        d3.select(".netsvg").remove()

    }


    updateChartSize(){

        // Gets new sizes and sets new canvas dimensions
        let chart1 = d3.select('.chart-1').node().getBoundingClientRect()
        // let chart2 = d3.select('.chart-2').node().getBoundingClientRect()

        //Margins - the bostock way - line chart
        this.lineHeight = chart1.height - 10;
        this.lineWidth = chart1.width - 5;
        this.widthL = this.lineWidth - this.marginL.left - this.marginL.right;
        this.heightL = this.lineHeight - this.marginL.top-this.marginL.bottom;

        // scale for link line charts
        this.timeScale = this.timeScale.range([this.marginL.left,this.marginL.left+this.widthL]);
        this.currentLineScale = this.currentLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);
        this.APFLineScale = this.APFLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);

        // scale for node line charts
        // this.aLoadLineScale = d3.scaleLinear().domain([min_aload,max_aload]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.aLoadLineScale = this.aLoadLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);
        this.voltLineScale = this.voltLineScale.range([this.heightL+this.marginL.top,this.marginL.top]);


    }

    // Create line charts for power system view
    createPowerCharts(){
         //console.log("data in line:",this.data.nodes[0])

         let that = this;

         this.updateChartSize()
         // Line chart height and width
         let line_height = this.lineHeight; //300
         let line_width = this.lineWidth; //700
 
         //Create line chart svg for active power
         let currentSvg = d3.select(".chart-3").append("svg")
             .attr("class","currentSvg")
             .attr("height",line_height)
             .attr("width",line_width);
 
         let APFSvg = d3.select(".chart-4").append("svg")
             .attr("class","APFSvg")
             .attr("height",line_height)
             .attr("width",line_width);
         
 
         //Create an energy chart group
         let currentG = currentSvg.append("g");
             // .attr("transform",`translate(${this.marginL.left},${this.marginL.top})`);
 
         //Create a power chart group
         let APFG = APFSvg.append("g");
 
         //Create label for group
        //  currentG.append("text")
        //      .attr("class","chart-text")
        //      .attr("x",line_width-160)
        //      .attr("y",60);
 
         //Create labels for axes
         // energy
         currentG.append("text")
             .attr("class","axis-title")
             .attr("x",line_width - line_width*0.5 - 90)
             .attr("y",20)
             .text("current (A)");
         
         currentG.append("text")
             .attr("class","axis-text")
             .attr("x",10)
             .attr("y",line_height-5)
             .text("time");
 
         // power
         APFG.append("text")
             .attr("class","axis-title")
             .attr("x",line_width - line_width*0.5 - 120)
             .attr("y",23)
             .text("active power flow (kW)");
         
         APFG.append("text")
             .attr("class","axis-text")
             .attr("x",10)
             .attr("y",line_height-5)
             .text("time");
 
         
         // Scales for line chart
         let yScaleCurrent = this.currentLineScale;
         let yScaleAPF = this.APFLineScale;
 
         let xScale = this.timeScale;
 
 
         //Xaxis group
         let xAxis = d3.axisBottom().ticks(6);
         xAxis.scale(xScale);
 
         //Y axis group
         let yAxisCurrent = d3.axisLeft().ticks(3);
         yAxisCurrent.scale(yScaleCurrent);
         let yAxisAPF = d3.axisLeft().ticks(3);
         yAxisAPF.scale(yScaleAPF);
 
         //Gridlines
         // gridlines in y axis function 
         // function make_y_gridlines() {		
         //     return d3.axisLeft(yScale)
         //         .ticks(5)
         // }
 
         // // add the Y gridlines
         // powStatSvg.append("g")			
         //     .attr("class", "grid")
         //     .attr("transform",`translate(${this.marginL.left},0)`)
         //     .call(make_y_gridlines()
         //         .tickSize(-(this.widthL))
         //         .tickFormat("")
         //     );
 
         //X-axis
         currentG.append("g")
             .classed("axis",true)
             .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
             .call(xAxis);
 
         APFG.append("g")
             .classed("axis",true)
             .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
             .call(xAxis);
         
 
         //Y-axis
         currentG.append("g")
             .classed("axis",true)
             .attr("transform",`translate(${this.marginL.left},${0})`)
             .call(yAxisCurrent);
 
         APFG.append("g")
             .classed("axis",true)
             .attr("transform",`translate(${this.marginL.left},${0})`)
             .call(yAxisAPF);
 
         
         //Add data to chart
 
         //Making line function
         // let line = d3.line()
         //     // .curve(d3.curveStep)
         //     .defined(d => !isNaN(d.value))
         //     .x((d,i) => this.timeScale(i))
         //     .y(d => this.powLoadLineScale(d.value));
 
         //Drawing path
         currentG.append("path")
             .attr("class","line-Current-faint line-path");
 
         currentG.append("path")
             .attr("class","line-Current line-path");
 
         APFG.append("path")
             .attr("class","line-APF-faint line-path");
 
         APFG.append("path")
             .attr("class","line-APF line-path");



    }

    /** Creates all bus line charts */
    createLine(){
        //console.log("data in line:",this.data.nodes[0])

        let that = this;

        // Line chart height and width
        let line_height = this.lineHeight; //300
        let line_width = this.lineWidth; //700

        //Create line chart svg for active power
        let currentSvg = d3.select(".link-charts").append("svg")
            .attr("class","currentSvg")
            .attr("height",line_height)
            .attr("width",line_width);

        let APFSvg = d3.select(".link-charts").append("svg")
            .attr("class","APFSvg")
            .attr("height",line_height)
            .attr("width",line_width);
        

        //Create an energy chart group
        let currentG = currentSvg.append("g");
            // .attr("transform",`translate(${this.marginL.left},${this.marginL.top})`);

        //Create a power chart group
        let APFG = APFSvg.append("g");

        //Create label for group
        currentG.append("text")
            .attr("class","chart-text")
            .attr("x",line_width-160)
            .attr("y",60);

        //Create labels for axes
        // energy
        currentG.append("text")
            .attr("class","axis-text")
            .attr("x",70)
            .attr("y",15)
            .text("current (A)");
        
        currentG.append("text")
            .attr("class","axis-text")
            .attr("x",line_width-150)
            .attr("y",line_height-10)
            .text("intervals");

        // power
        APFG.append("text")
            .attr("class","axis-text")
            .attr("x",70)
            .attr("y",15)
            .text("active power flow (kW)");
        
        APFG.append("text")
            .attr("class","axis-text")
            .attr("x",line_width-150)
            .attr("y",line_height-10)
            .text("intervals");

        
        // Scales for line chart
        let yScaleCurrent = this.currentLineScale;
        let yScaleAPF = this.APFLineScale;

        let xScale = this.timeScale;


        //Xaxis group
        let xAxis = d3.axisBottom().ticks(6);
        xAxis.scale(xScale);

        //Y axis group
        let yAxisCurrent = d3.axisLeft().ticks(3);
        yAxisCurrent.scale(yScaleCurrent);
        let yAxisAPF = d3.axisLeft().ticks(3);
        yAxisAPF.scale(yScaleAPF);

        //Gridlines
        // gridlines in y axis function 
        // function make_y_gridlines() {		
        //     return d3.axisLeft(yScale)
        //         .ticks(5)
        // }

        // // add the Y gridlines
        // powStatSvg.append("g")			
        //     .attr("class", "grid")
        //     .attr("transform",`translate(${this.marginL.left},0)`)
        //     .call(make_y_gridlines()
        //         .tickSize(-(this.widthL))
        //         .tickFormat("")
        //     );

        //X-axis
        currentG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);

        APFG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);
        

        //Y-axis
        currentG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisCurrent);

        APFG.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisAPF);

        
        //Add data to chart

        //Making line function
        // let line = d3.line()
        //     // .curve(d3.curveStep)
        //     .defined(d => !isNaN(d.value))
        //     .x((d,i) => this.timeScale(i))
        //     .y(d => this.powLoadLineScale(d.value));

        //Drawing path
        currentG.append("path")
            .attr("class","line-Current-faint line-path");

        currentG.append("path")
            .attr("class","line-Current line-path");

        APFG.append("path")
            .attr("class","line-APF-faint line-path");

        APFG.append("path")
            .attr("class","line-APF line-path");

    }


    // Updates the line chart with clicked data 
    updateLine(){

        let that = this;
        let link_data = that.clickedLinks.slice(-1)[0]

        //Making line functions
        let lineCurrent = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.currentLineScale(d.value));
        
        let lineAPF = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.APFLineScale(d.value));

        

        d3.select(".line-Current")
            .datum(link_data.current.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", "#e66b00")//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineCurrent);

        d3.select(".line-Current-faint")
            .datum(link_data.current)
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", "#e8d2b6")//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineCurrent);

        d3.select(".line-APF")
            .datum(link_data.aPF.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", "#3a7bbf")//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineAPF);

        d3.select(".line-APF-faint")
            .datum(link_data.aPF)
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", "#adb3c9")//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 3)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineAPF);


    }


    updateLineNode(){
        let that = this;
        let node_data = that.clickedNodes.slice(-1)[0]

        //Making line functions
        let lineAL = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.aLoadLineScale(d.value));
        
        let lineVolt = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.voltLineScale(d.value));

        

        d3.select(".line-AL")
            .datum(node_data.aLoad.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", "#8426cc")//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineAL);

        // d3.select(".line-Current-faint")
        //     .datum(link_data.current)
        //     .style("visibility","visible")
        //     .attr("fill", "none")
        //     .attr("stroke", "#e8d2b6")//d => that.stationColor(d.StationNode.id))
        //     .attr("stroke-width", 3)
        //     .attr("stroke-linejoin", "round")
        //     .attr("stroke-linecap", "round")
        //     .attr("d", lineCurrent);

        d3.select(".line-V")
            .datum(node_data.volt.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", "#1a7301")//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineVolt);

        // d3.select(".line-APF-faint")
        //     .datum(link_data.aPF)
        //     .style("visibility","visible")
        //     .attr("fill", "none")
        //     .attr("stroke", "#adb3c9")//d => that.stationColor(d.StationNode.id))
        //     .attr("stroke-width", 3)
        //     .attr("stroke-linejoin", "round")
        //     .attr("stroke-linecap", "round")
        //     .attr("d", lineAPF);


    }





    /**
     * Returns html that can be used to render the tooltip for nodes
     * @param data
     * @returns {string}
     */
    tooltipRenderID_N(data) {
        let that = this;
        let text = null;
        (data.chSP != null) ? text = "<h3> <span>&#9889;</span>" + data.id + "</h3>": 
        text = "<h3>" + data.id + "</h3>";
        return text;
    }

    tooltipRenderINFO_N(data) {
        let that = this;
        let text = '';
        //Adds in relevant data
        text = text + "<p> <b> Active Load:</b> "+ parseFloat(data.aLoad[that.activeTime].value).toFixed(2)+" kW</p>";
        if (data.chSP != null){
            text = text + "<p> <b> Voltage:</b> "+ parseFloat(data.volt[that.activeTime].value).toFixed(2)+" kV &emsp; <b> Active Power: </b> "+ parseFloat(data.chSP[that.activeTime].value).toFixed(2)+" kW</p>";
        } 
        else{
            text = text + "<p> <b> Voltage:</b> "+ parseFloat(data.volt[that.activeTime].value).toFixed(2)+" kV</p>";
        }
        return text;
    }

    /**
     * Returns html that can be used to render the tooltip for links
     * @param data
     * @returns {string}
     */
    tooltipRenderID_L(data) {
        let that = this;
        let text = "<h3>" + data.source.id + ' <span>&#8594;</span> ' + data.target.id +"</h3>";
        return text;
    }

    tooltipRenderINFO_L(data) {
        let that = this;
        let text = ''
        text = text + "<p> <b> Acitve Power Flow: </b> "+ parseFloat(data.aPF[that.activeTime].value).toFixed(2)+" kW</p>";
        text = text + "<p> <b> Current: </b> "+ parseFloat(data.current[that.activeTime].value).toFixed(2)+" A &emsp; <b> Max Current: </b>"+ data.mLC.toFixed(2)+" A </p>";
        
        return text;
    }


}