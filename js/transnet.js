/** Class implementing the transportation network */
class TransNet {

    // Creates a Transportation Network object
    constructor(data,pow_data,bebs,time,table,updateTime){
        //Assigning data variable
        console.log("Trans data:",data);
        this.data = data;
        this.pow_data = pow_data;
        this.activeTime = time;
        this.bebs = bebs;
        this.table = table;
        this.updateTime = updateTime;

        //getting bouding box for svg
        let boundingRect =  d3.select(".view1").node().getBoundingClientRect()
        this.WIDTH = 3200; //boundingRect.width;
        this.HEIGHT = boundingRect.height;

        //Margins - the bostock way
        this.margin = {top: 20, right: 20, bottom: 20, left: 20};
        // this.width = this.WIDTH - this.margin.left - this.margin.right;
        // this.height = this.HEIGHT - this.margin.top-this.margin.bottom; 

        //Margins - the bostock way - line chart
        this.lineHeight = 270;
        this.lineWidth = 500;
        this.marginL = {top: 20, right: 60, bottom: 60, left: 60};
        this.widthL = this.lineWidth - this.marginL.left - this.marginL.right;
        this.heightL = this.lineHeight - this.marginL.top-this.marginL.bottom; 

        this.clicked = null; //my click selection - used for updating tooltip later
    }

    createNet(){

        this.width = this.WIDTH - this.margin.left - this.margin.right;
        this.height = this.HEIGHT - this.margin.top-this.margin.bottom; 

        //TODO potentially highlight routes along the transportation system
        //console.log("In trans net");
        //Select view1 and append an svg to it
        let that = this;

        //Create bus count scale
        let max_bus_count = d3.max(this.data.nodes.map((d) => {
            return d3.max(d.BusData.map((d)=>{
                return d.total
            }))
        }));
        let min_bus_count = d3.min(this.data.nodes.map((d) => {
           return d3.min(d.BusData.map((d)=>{
               return d.total
           }))
        }));
        //console.log(max_bus_count,min_bus_count);

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

        //Finding max/min of active power flow
        let max_apf = d3.max(this.pow_data.links.map((d) => {
            //console.log(d)
            return d3.max(d.aPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_apf = d3.min(this.pow_data.links.map((d) => {
            //console.log(d)
            return d3.min(d.aPF.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));

        //Finding max/min of voltage
        let max_volt = d3.max(this.pow_data.nodes.map((d) => {
            //console.log(d)
            return d3.max(d.volt.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        let min_volt = d3.min(this.pow_data.nodes.map((d) => {
            //console.log(d)
            return d3.min(d.volt.map(f => {
                //console.log(f[1])
                return parseFloat(f.value)
            }))
        }));
        // console.log(max_volt,min_volt);
        

        /** Set Scales  */
        //Make circle size scale for bus count
        this.buscountScale = d3.scaleSqrt().domain([min_bus_count,max_bus_count]).range([5,35]);

        //Color scale for station power
        this.powLoadScale = d3.scaleSequential(d3.interpolateGreens).domain([min_chsp,max_chsp]);

        // console.log(min_aload,max_aload)
        // Scales for line chart
        this.powLoadLineScale = d3.scaleLinear().domain([min_chsp,max_chsp]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.timeScale = d3.scaleLinear().domain([1,288]).range([this.marginL.left,this.marginL.left+this.widthL]);
        this.aLoadLineScale = d3.scaleLinear().domain([min_aload,max_aload]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.voltLineScale = d3.scaleLinear().domain([min_volt,max_volt]).range([this.heightL+this.marginL.top,this.marginL.top]);
        this.busLineScale = d3.scaleLinear().domain([min_bus_count,max_bus_count]).range([this.heightL+this.marginL.top,this.marginL.top]);

        //Setting custom max because the first node skews it - have this for color setting
        this.aLoadScale = d3.scaleSequential(d3.interpolatePurples).domain([min_aload,300])
        //Make an ordinal color scale for stations
        let pow_stations = ["n2","n13","n9","n33","n25","n31","n8"];
        this.stationColor = d3.scaleOrdinal(d3.schemeTableau10).domain(pow_stations);
        //Power links
        this.apfScale = d3.scaleSequential(d3.interpolateBlues).domain([min_apf,max_apf]);

        //Select view1 and append an svg to it
        let powSVG = d3.select(".view1").append("svg")
            .attr("class","netsvg")
            .attr("height",this.height+this.margin.top+this.margin.bottom)
            .attr("width",this.width+this.margin.left+this.margin.right);

        // create zoomable group
        let net_Group = powSVG.append('g')
            .attr("class","net-group")




        // TODO, my idea here is to make a little legend with all 3 of the color scales up
        //Create svg for color scale legend
        let scaleLegendGroup =  net_Group.append("g")
            .attr("transform","translate(100,700)")
            // .attr("class","net-group")
            .attr("id","scale_leg");

        let scaleLegend = scaleLegendGroup
            .append("svg");

        let defs = scaleLegend.append('defs');
        //Append a linearGradient element to the defs and give it a unique id
        let linearGradient_AL = defs.append("linearGradient")
            .attr("id", "linear-gradient-AL");
        let linearGradient_CP = defs.append("linearGradient")
            .attr("id", "linear-gradient-CP");
        let linearGradient_apF = defs.append("linearGradient")
            .attr("id", "linear-gradient-apF");
        
        this.scaleLegender(linearGradient_AL,this.aLoadScale)
        this.scaleLegender(linearGradient_CP,this.powLoadScale)
        this.scaleLegender(linearGradient_apF,this.apfScale)

        //Draw the rectangle and fill with gradient (Active Power (powLoad))
        let powLoadG = scaleLegend.append("g")
            .attr("transform","translate(460,15)");
        powLoadG.append("rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient-CP)")
        powLoadG.append("text")
            .attr("y",35)
            .text("active power (kW)");
        powLoadG.append("text")
            .attr("x",150)
            .attr("y",15)
            .attr("fill","white")
            .style("font-weight","light")
            .text(`${max_chsp.toFixed(1)}`);
        powLoadG.append("text")
            .attr("x",5)
            .attr("y",15)
            .attr("fill","white")
            .style("font-weight","light")
            .text(`${min_chsp.toFixed(1)}`);



        //Draw the rectangle and fill with gradient (Active load)
        let aLoadG = scaleLegend.append("g")
            .attr("transform","translate(200,40)");
        aLoadG.append("rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient-AL)");
        aLoadG.append("text")
            .attr("y",35)
            .text("active load (kW)");
        aLoadG.append("text")
            .attr("x",5)
            .attr("y",15)
            .attr("fill","grey")
            .style("font-weight","light")
            .text(`${min_aload.toFixed(1)}`);
        aLoadG.append("text")
            .attr("x",150)
            .attr("y",15)
            .attr("fill","white")
            .style("font-weight","light")
            .text(`${max_aload.toFixed(1)}`);

        //Draw the rectangle and fill with gradient (active power flow)
        let aPFG = scaleLegend.append("g")
            .attr("transform","translate(200,0)");
        aPFG.append("rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient-apF)");
        aPFG.append("text")
            .attr("y",35)
            .text("active power flow (kW)");
        aPFG.append("text")
            .attr("x",5)
            .attr("y",15)
            .attr("fill","grey")
            .style("font-weight","light")
            .text(`${min_apf.toFixed(1)}`);
        aPFG.append("text")
            .attr("x",150)
            .attr("y",15)
            .attr("fill","white")
            .style("font-weight","light")
            .text(`${max_apf.toFixed(1)}`);


        //Bus net
        let netGroup = net_Group.append("g")
            // .attr("class","net-group")
            .attr("transform","translate("+(650)+","+this.margin.top+")");


        //I'll create lines first so they're beneath everything
        this.lineLayer = netGroup.append("g")
            .attr("class","netlines");

        // First we create the links in their own group that comes before the node 
        //  group (so the circles will always be on top of the lines)
        this.linkLayer = netGroup.append("g")
            .attr("class", "links");

        //Create labels
        this.labelLayer = netGroup.append("g")
        .attr("class","labelsT");

        // Now we create the node group, and the nodes inside it
        this.nodeLayer = netGroup.append("g")
            .attr("class", "nodes");


        // Make labels
        let labelGroup = net_Group.append("g")
            .attr("transform","translate("+(0)+","+this.margin.top+")")

        labelGroup.append("text")
            .attr("transform","translate("+(100)+","+-this.margin.top+")")
            .attr("font-size","35px")
            .attr("font-weight","light")
            .attr("fill","rgba(0,0,0,0.5")
            .text("IEEE 33 bus system")

        labelGroup.append("text")
            .attr("transform","translate("+(500)+","+-this.margin.top+")")
            .attr("font-size","35px")
            .attr("font-weight","light")
            .attr("fill","rgba(0,0,0,0.5")
            .text("Park City transit system")

         //Add text above nets
        // d3.select(".viewsHead").append("div")
        //     .style("left","1000px")
        //     .style("top","175px")
        //     .attr("class","net_headers")
        //     .text("Park City Transit System");

        // d3.select(".viewsHead").append("div")
        //     .style("left","600px")
        //     .style("top","175px")
        //     .attr("class","net_headers")
        //     .text("IEEE 33 bus system");
        

    }

    createSlider(){

        //Appending time bar
        let time_bar = d3.select(".viewsHead")
            .append('div')
            .attr('id', 'activeTime-bar')
            .style("display","flex")
            .style("align-items","center")
            .style("justify-content","center");

         //make Station tooltip div
         d3.select(".view1")
         .append("div")
         .attr("class", "s_tooltip")
         .attr("id","s_tooltip_click")
         .style("opacity", 0);

        //make Station tooltip div
        d3.select(".view1")
            .append("div")
            .attr("class", "s_tooltip")
            .attr("id","s_tooltip")
            .style("opacity", 0);

        //Draw time bar
        this.drawTimeBar();

    }

    updateNet(){
        let that = this;
        
        //Updates table with clicked seletion
        if(that.clicked != null){

            // TODO - need to figure out how to not update table here when I originally click on a bus 
            // this.Clicked(that.clicked,false);
            this.updateLine();

        }

        // Now let's create the lines
        let links = this.linkLayer.selectAll("line")
            .data(this.data.links)
            .join("line")
            .classed("linkT",true);


        let nodes = this.nodeLayer
            .selectAll("circle")
            .data(this.data.nodes)
            .join("circle")
            .attr("class",d => d.StationNode.id)
            .classed("node",true)
            .classed("transNode",true)
            .attr("r", d => this.buscountScale(d.BusData[this.activeTime].total))
            .attr("fill", d => this.powLoadScale(d.chSP[this.activeTime].value))
            //tooltip + linked styling when hovered over
            .on("mouseover", function (d) {
                // Highlights tooltip
                d3.select("#s_tooltip").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#s_tooltip").html(that.tooltipRenderS(d))
                    .style("left","1220px") //(d3.event.pageX+30)
                    .style("top", "235px"); //(d3.event.pageY-80)
                // Checks first to see if its been clicked 
                if (!d3.select(`#line-${d.StationNode.id}`).classed("clicked-line")){
                    d3.selectAll("."+d.StationNode.id)
                        .attr("fill", d => { return (d.id != undefined) ? that.stationColor(d.id) : that.stationColor(d.StationNode.id)})
                        .classed("CHSP",true);
                    //highlights line
                    d3.select(`#line-${d.StationNode.id}`).classed("active-line-hover",true);
                }
                    
            })
            .on("mouseout", function (d) {
                // De-highlights tooltip
                d3.select("#s_tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                if (!d3.select(`#line-${d.StationNode.id}`).classed("clicked-line")){
                    // console.log("here")
                    d3.selectAll("."+d.StationNode.id)
                        .attr("fill", d => { return (d.id != undefined) ? that.aLoadScale(d.aLoad[that.activeTime].value) : that.powLoadScale(d.chSP[that.activeTime].value)})
                        .classed("CHSP",false);
                    d3.selectAll(".station_node")
                        .attr("fill", d => that.stationColor(d.StationNode.id));

                    //de-highlights line
                    d3.select(`#line-${d.StationNode.id}`).classed("active-line-hover",false);
                }
                
                
            })
            .on("click", function(d){
                // sees if object has already been clicked
                if (d3.select(`#line-${d.StationNode.id}`).classed("clicked-line")){
                    // console.log("been clicked")
                    //Remove tooltip
                    d3.select("#s_tooltip_click")
                        .style("opacity", 0);

                    //Restore table data
                    that.table.BEB = that.bebs;
                    that.table.updateTable();
                    
                    // removes clicked class and active line class
                    d3.select(`#line-${d.StationNode.id}`).classed("clicked-line",false);
                    d3.select(`#line-${d.StationNode.id}`).classed("active-line",false);
                    //stops animation
                    stop.call(d3.select(`#line-${d.StationNode.id}`).node(),d)
                    //Clear path from line chart
                    d3.selectAll(".line-path").style("visibility","hidden");
                    d3.selectAll(".chart-text").style("visibility","hidden");
                }
                else{
                    // console.log("hasn't been clicked")
                    // Adds clicked class and active line class
                    d3.select(`#line-${d.StationNode.id}`).classed("clicked-line",true);
                    d3.select(`#line-${d.StationNode.id}`).classed("active-line",true);
                    //starts animation indefinitely
                    animate.call(d3.select(`#line-${d.StationNode.id}`).node(),d)

                    that.Clicked(d,false)
                }
            });
        

        let labels = this.labelLayer
            .selectAll("text")
            .data(this.data.nodes)
            .enter().append("text");

        nodes
            .attr("cx", function (d,i) {
                let X_Start = 0;
                switch(parseInt(d.StationID)){
                    case 1:
                        d.x = X_Start;
                        return d.x;
                    case 5:
                        d.x = X_Start - 50;
                        return d.x;
                    case 7:
                        d.x = X_Start + 160;
                        return d.x;
                    case 3:
                        d.x = X_Start + 120;
                        return d.x;
                    case 2:
                        d.x = X_Start + 180;
                        return d.x;
                    case 6:
                        d.x = X_Start + 210;
                        return d.x;
                    case 4:
                        d.x = X_Start + 280;
                        return d.x;
                }
                
            })
            .attr("cy", function (d,i) {
                let Y_Start = that.margin.top+22;
                switch(parseInt(d.StationID)){
                    case 1:
                        d.y = Y_Start;
                        return d.y;
                    case 5:
                        d.y = Y_Start + 200;
                        return d.y;
                    case 7:
                        d.y = Y_Start + 220;
                        return d.y;
                    case 3:
                        d.y = Y_Start + 240;
                        return d.y;
                    case 2:
                        d.y = Y_Start + 400;
                        return d.y;
                    case 6:
                        d.y = Y_Start + 500;
                        return d.y;
                    case 4:
                        d.y = Y_Start + 600;
                        return d.y;
                }
            });

        links
            .attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        labels
            .attr("x",d => d.x-60)
            .attr("y",d => d.y-10)
            .text( d=> d.StationName)
            .attr("fill","black");

        // Creating lines that connect the power and trans nodes together
        // Faint until they are highlighted, then they darken, or maybe pulse or something cool

        //Creating lines that connect power station node to transportation node
        let lineFunction = d3.line()
            .x(function(d){
                return d.x;
            })
            .y(function(d){
                return d.y;
            });


        this.lineOTTC = [{"x":20,"y":40},{"x":-200,"y":40},
        {"x":-200,"y":73},{"x":-320,"y":73}];

        this.lineKPR = [{"x":-50,"y":245},{"x":-175,"y":245},
        {"x":-175,"y":5},{"x":-470,"y":5}, {"x":-470,"y":245}];

        this.lineGS = [{"x":150,"y":263},{"x":-135,"y":263},
        {"x":-135,"y":282},{"x":-320,"y":282}];

        this.lineCTH = [{"x":130,"y":282},{"x":0,"y":282},
        {"x":0,"y":330},{"x":-295,"y":330},{"x":-295,"y":317},{"x":-320,"y":317}];

        this.lineKJTC = [{"x":160,"y":445},{"x":100,"y":445},{"x":100,"y":435},
        {"x":-300,"y":435},{"x":-300,"y":458},{"x":-320,"y":458}];

        this.lineEH = [{"x":205,"y":540},{"x":100,"y":540},
        {"x":100,"y":487},{"x":-160,"y":487}];

        this.lineJRPR = [{"x":275,"y":645},{"x":-50,"y":645},
        {"x":-50,"y":557},{"x":-160,"y":557}];

        this.lineArray = [this.lineOTTC, this.lineKJTC, this.lineCTH, this.lineJRPR, this.lineKPR, this.lineEH, this.lineGS]

        // Adding line data to this.data
        this.data.nodes.forEach( (d,i) => {
            // console.log(d.StationName,this.lineArray[i],d.StationID)
            d.line = this.lineArray[i];
        })
        // console.log("data with lines",this.data.nodes)

        // let line_data = null;

        // line_data = this.lineJRPR;

        //Path to trans
        let path = that.lineLayer.selectAll("path")
            .data(this.data.nodes)
            .enter().append("path")
            .attr("class","netline")
            .attr("id",(d,i) => `line-${d.StationNode.id}`)
            .attr("d",d => lineFunction(d.line))
            .on("mouseover",function(d){
                // Brings up tooltip
                d3.select("#s_tooltip").transition()
                    .duration(200)
                    .style("opacity", 0.9);
                d3.select("#s_tooltip").html(that.tooltipRenderS(d))
                    .style("left","1220px") //(d3.event.pageX+30)
                    .style("top", "235px"); 

                // Checks first to see if its been clicked 
                if (!d3.select(this).classed("clicked-line")){
                // Sets active line class and calls animate - alt could do css hover
                d3.select(this).classed("active-line",true);

                // Highlighting of nodes 
                d3.selectAll("."+d.StationNode.id)
                    .attr("fill", d => { return (d.id != undefined) ? that.stationColor(d.id) : that.stationColor(d.StationNode.id)})
                    .classed("CHSP",true);
                }
            })
            .on("mouseout",function(d){
                //De-highlighting of nodes and tooltip
                d3.select("#s_tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                    
                if (!d3.select(this).classed("clicked-line")){
                // eliminate active line class and stops animation
                d3.select(this).classed("active-line",false);
                d3.select(this).classed("active-line-hover",false);

                
                d3.selectAll("."+d.StationNode.id)
                    .attr("fill", d => { return (d.id != undefined) ? that.aLoadScale(d.aLoad[that.activeTime].value) : that.powLoadScale(d.chSP[that.activeTime].value)})
                    .classed("CHSP",false);
                d3.selectAll(".station_node")
                    .attr("fill", d => that.stationColor(d.StationNode.id));
                }
            })
            .on("click",function(d){
                // sees if object has already been clicked
                if (d3.select(this).classed("clicked-line")){
                    // console.log("been clicked")
                    //Remove tooltip
                    d3.select("#s_tooltip_click")
                        .style("opacity", 0);

                    //Restore table data
                    that.table.BEB = that.bebs;
                    that.table.updateTable();

                    // removes clicked class
                    d3.select(this).classed("clicked-line",false);
                    //stops animation
                    stop.call(this,d)
                    //Clear path from line chart
                    d3.selectAll(".line-path").style("visibility","hidden");
                    d3.selectAll(".chart-text").style("visibility","hidden");
                }
                else{
                    // console.log("hasn't been clicked")
                    // Adds clicked class
                    d3.select(this).classed("clicked-line",true);
                    //starts animation indefinitely
                    animate.call(this,d)
                    that.Clicked(d,false);
                }
                

            });

        // animate();
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
            // console.log("IN STOP",this)
            d3.select(this)
                .interrupt();
        }


        // This clears a selection by listening for a click
        document.addEventListener("click", function(e) {
            if (e.target.classList.contains("netsvg")){
            //console.log(e.target);
            //Remove tooltip
            d3.select("#s_tooltip_click")
                    .style("opacity", 0);

            //Restore data
            that.table.BEB = that.bebs;
            that.table.updateTable();
            
            //Remove net lines
            // d3.selectAll(".netlineclick").remove();

            // stops animation
            d3.selectAll(".clicked-line").interrupt()

            // removes classes
            d3.selectAll(".clicked-line")
                .classed("clicked-line",false)
                .classed("active-line",false)
                .classed("active-line-hover",false);

            //Sets clicked to null and other variables to 0
            that.clicked = null;
            // that.table.clickedBusses = [];
            // that.powNet.clickedLinks = [];


            //Clear path from line chart
            d3.selectAll(".line-path").style("visibility","hidden");
            d3.selectAll(".chart-text").style("visibility","hidden");
            }
            
            
        
        }, true);


        

    }

    //Clicked function
    Clicked(d,from_table) {
        //console.log("in clicked")
        //setting this so the tooltip updates on slider bar later - as well as table
        this.clicked = d;
        console.log(this.clicked)

        //Call update line
        this.updateLine();

        //console.log("this.clicked",that.clicked)
        //console.log(d.BusData[that.activeTime].busses)

        // Checks to see if we got here from the table, if not, we update the table with station busses
        if (from_table==false){
            let busses = d.BusData[this.activeTime].busses;
            busses = busses.map((c) => parseInt(c))
            //console.log(busses)
            let stationBusses = this.bebs.filter((f,i) => busses.includes(f.BusID));
            let allOtherBusses = this.bebs.filter((f,i) => !busses.includes(f.BusID));
            // console.log('IN CLICKED',stationBusses.concat(allOtherBusses))
            let newData = stationBusses.concat(allOtherBusses)

            // So here, instead of just having busses at a station populate table, will just resort the table,
            // so that the station busses are all located at the top of the table 

            // not sure best way, maybe loop through and move rows that at station to the top of the table one by one
            // console.log("in clicked",newData)

            //console.log(newData)
            this.table.BEB = newData;
            this.table.updateTable();
        }
        

        //Want to keep lines connecting other nodes and tooltip (copied from above - should make this a function)
        d3.select("#s_tooltip_click").transition()
            .duration(200)
            .style("opacity", 1);
        d3.select("#s_tooltip_click").html(this.tooltipRenderS(d))
            .style("left","1220px") //(d3.event.pageX+30)
            .style("top", "235px"); //(d3.event.pageY-80)
        
        //Want to removes netlines
        // d3.selectAll(".netlineclick").remove();
        // d3.selectAll(".netline").remove();

        // //Creating lines that connect node to power station
        // let lineFunction = d3.line()
        //     .x(function(d){
        //         return d.x;
        //     })
        //     .y(function(d){
        //         return d.y;
        //     });
        
        // let line_data = null;
        // let line_data2 = null;
        
        // switch(parseInt(d.StationID)){
        //     case 1:
        //        line_data = that.lineOTTC;
        //        line_data2 = that.lineOTTC2;
        //        break;
        //     case 2:
        //         line_data = that.lineKJTC;
        //         line_data2 = that.lineKJTC2;
        //         break;
        //     case 3:
        //         line_data = that.lineCTH;
        //         line_data2 = that.lineCTH2;
        //         break;
        //     case 4:
        //         line_data = that.lineJRPR;
        //         line_data2 = that.lineJRPR2;
        //         break;
        //     case 5:
        //         line_data = that.lineKPR;
        //         line_data2 = that.lineKPR2;
        //         break;
        //     case 6:
        //         line_data = that.lineEH;
        //         line_data2 = that.lineEH2;
        //         break;
        //     case 7:
        //         line_data = that.lineGS;
        //         line_data2 = that.lineGS2;
        //         break;
                
        // }

    //     //Path to trans
    //     let path = that.lineLayer.append("path")
    //         .attr("class","netlineclick")
    //         .attr("stroke","black")
    //         .attr("stroke-width",0.5)
    //         .attr("fill","none")
    //         .attr("d",lineFunction(line_data));

    //     let path2 = that.lineLayer.append("path")
    //         .attr("class","netlineclick")
    //         .attr("stroke","black")
    //         .attr("stroke-width",0.5)
    //         .attr("fill","none")
    //         .attr("d",lineFunction(line_data2));
    }

      /**
     * Draws the time bar and hooks up the events of time change
     */
    drawTimeBar() {
        let that = this;

        //Slider to change the activeTime of the data
        //May want to adjust these values later
        let timeScale = d3.scaleLinear().domain([1, 287]).range([30, 730]);

        let timeSlider = d3.select('#activeTime-bar')
            .append('div').classed('slider-wrap', true)
            .append('input').classed('slider', true)
            .attr('type', 'range')
            .attr('min', 1)
            .attr('max', 287)
            .attr('value', this.activeTime);

        let sliderLabel = d3.select('.slider-wrap')
            .append('div').classed('slider-label', true)
            .append('svg');

        let sliderText = sliderLabel.append('text').text(this.activeTime);

        sliderText.attr('x', timeScale(this.activeTime));
        sliderText.attr('y', 25);

        timeSlider.on('input', function() {
            

            // d3.select("#backtext")
            //     .text(this.value);
            sliderText.text(this.value);
            sliderText.attr('x', timeScale(this.value));
            that.updateTime(this.value);
            if(that.clicked != null){
                //Updatiting tooltip
                d3.select("#s_tooltip_click")
                    .html(that.tooltipRenderS(that.clicked));
            }
        });
    }

    removeNet(){
        /** Clears existing Net**/
        d3.select(".netsvg").remove()

    }

    /** Creates all power line charts */
    createLine(){
        //console.log("data in line:",this.data.nodes[0])

        // I want to have all lines show up, and then have the user able to select them in 
        // the same way they select the nodes and connections 
        // Strategy will be to render lines in light gray first, then have them colored on highlight 

        let that = this;

        // Line chart height and width
        let line_height = this.lineHeight; //300
        let line_width = this.lineWidth; //700

        //Create line chart svgs for all the metrics
        let ALSvg = d3.select(".node-charts").append("svg")
            .attr("class","ALSvg")
            .attr("height",line_height)
            .attr("width",line_width);

        let VoltSvg = d3.select(".node-charts").append("svg")
            .attr("class","VoltSvg")
            .attr("height",line_height)
            .attr("width",line_width);

        let APSvg = d3.select(".station-charts").append("svg")
            .attr("class","APSvg")
            .attr("height",line_height)
            .attr("width",line_width);

        let BusSvg = d3.select(".station-charts").append("svg")
            .attr("class","BusSvg")
            .attr("height",line_height)
            .attr("width",line_width);
        

        //Create an active power chart group
        let APStatSvg = APSvg.append("g");
            // .attr("transform",`translate(${this.marginL.left},${this.marginL.top})`);

        //Create an active load chart group
        let ALStatSvg = ALSvg.append("g");

        //Create an voltage chart group
        let VStatSvg = VoltSvg.append("g");

        //Create a bus count chart group
        let BusStatSvg = BusSvg.append("g");

        //Create label for group
        APStatSvg.append("text")
            .attr("class","chart-text")
            .attr("x",line_width-160)
            .attr("y",60);

        // ALStatSvg.append("text")
        //     .attr("class","chart-text")
        //     .attr("x",490)
        //     .attr("y",360);

        // VStatSvg.append("text")
        //     .attr("class","chart-text")
        //     .attr("x",490)
        //     .attr("y",360);

        // BusStatSvg.append("text")
        //     .attr("class","chart-text")
        //     .attr("x",490)
        //     .attr("y",360);

        //Create labels for axes
        // Active power
        APStatSvg.append("text")
            .attr("class","axis-text")
            .attr("x",70)
            .attr("y",15)
            .text("active power (kW)");
        
        // APStatSvg.append("text")
        //     .attr("class","axis-text")
        //     .attr("x",570)
        //     .attr("y",280)
        //     .text("intervals");

        // Active load
        ALStatSvg.append("text")
            .attr("class","axis-text")
            .attr("x",70)
            .attr("y",15)
            .text("active load (kW)");
        
        // ALStatSvg.append("text")
        //     .attr("class","axis-text")
        //     .attr("x",570)
        //     .attr("y",280)
        //     .text("intervals");

        // Voltage
        VStatSvg.append("text")
            .attr("class","axis-text")
            .attr("x",70)
            .attr("y",15)
            .text("voltage (kV)");
        
        // VStatSvg.append("text")
        //     .attr("class","axis-text")
        //     .attr("x",570)
        //     .attr("y",280)
        //     .text("intervals");

        // Bus count
        BusStatSvg.append("text")
            .attr("class","axis-text")
            .attr("x",70)
            .attr("y",15)
            .text("BEB count");
        
        BusStatSvg.append("text")
            .attr("class","axis-text")
            .attr("x",line_width-150)
            .attr("y",line_height-10)
            .text("intervals");

        
        // Scales for line chart
        let yScaleAP = this.powLoadLineScale;
        let yScaleAL = this.aLoadLineScale;
        let yScaleV = this.voltLineScale;
        let yScaleBus = this.busLineScale;

        let xScale = this.timeScale;


        //Xaxis group
        let xAxis = d3.axisBottom().ticks(6);
        xAxis.scale(xScale);

        //Y axis group
        let yAxisAP = d3.axisLeft().ticks(3);
        yAxisAP.scale(yScaleAP);
        let yAxisAL = d3.axisLeft().ticks(3);
        yAxisAL.scale(yScaleAL);
        let yAxisV = d3.axisLeft().ticks(3);
        yAxisV.scale(yScaleV);
        let yAxisBus = d3.axisLeft().ticks(3);
        yAxisBus.scale(yScaleBus);

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
        // APStatSvg.append("g")
        //     .classed("axis",true)
        //     .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
        //     .call(xAxis);

        // ALStatSvg.append("g")
        //     .classed("axis",true)
        //     .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
        //     .call(xAxis);

        // VStatSvg.append("g")
        //     .classed("axis",true)
        //     .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
        //     .call(xAxis);

        BusStatSvg.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${0},${this.heightL+this.marginL.top})`)
            .call(xAxis);
        

        //Y-axis
        APStatSvg.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisAP);

        ALStatSvg.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisAL);

        VStatSvg.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisV);
        
        BusStatSvg.append("g")
            .classed("axis",true)
            .attr("transform",`translate(${this.marginL.left},${0})`)
            .call(yAxisBus);

        
        //Add data to chart

        //Making line function
        // let line = d3.line()
        //     // .curve(d3.curveStep)
        //     .defined(d => !isNaN(d.value))
        //     .x((d,i) => this.timeScale(i))
        //     .y(d => this.powLoadLineScale(d.value));

        //Drawing path
        APStatSvg.append("path")
            .attr("class","line-AP line-path");

        ALStatSvg.append("path")
            .attr("class","line-AL line-path");

        VStatSvg.append("path")
            .attr("class","line-V line-path");

        BusStatSvg.append("path")
            .attr("class","line-Bus line-path");


        // Add all relevant data 
        //Making line function
        // let lineAP = d3.line()
        //     // .curve(d3.curveStep)
        //     .defined(d => !isNaN(d.value))
        //     .x((d,i) => this.timeScale(i))
        //     .y(d => this.powLoadLineScale(d.value));

            // .data(this.data.nodes)
            // .enter().append("path")
            // .attr("class","netline")
            // .attr("id",(d,i) => `line-${d.StationNode.id}`)
            // .attr("d",d => lineFunction(d.line))

        // console.log("here",this.data.nodes.map(f=>f.chSP))
        // APStatSvg.selectAll("path")
        //     .data(this.data.nodes.map(f => f.chSP))
        //     .enter().append("path")
        //     .attr("class","line-AP")
        //     .attr("id",(d,i) => `line-AP-${i}`)
        //     .style("visibility","visible")
        //     .attr("fill", "none")
        //     .attr("stroke", '#dedede')//d => that.stationColor(d.StationNode.id))
        //     .attr("stroke-width", 3)
        //     .attr("stroke-linejoin", "round")
        //     .attr("stroke-linecap", "round")
        //     .attr("d", lineAP);


    }

    updateLine(){
        let that = this;
        //console.log("that.clicked in update line",this.clicked)

        //Making line function
        let lineAP = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.powLoadLineScale(d.value));

        let lineAL = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.aLoadLineScale(d.value));

        let lineV = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d.value))
            .x((d,i) => this.timeScale(i))
            .y(d => this.voltLineScale(d.value));

        let lineBus = d3.line()
            // .curve(d3.curveStep)
            .defined(d => !isNaN(d))
            .x((d,i) => this.timeScale(i))
            .y(d => this.busLineScale(d));

        d3.select(".line-AP")
            .datum(this.data.nodes[that.clicked.index].chSP.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", `${that.stationColor(that.clicked.StationNode.id)}`)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineAP);

        d3.select(".line-AL")
            .datum(this.data.nodes[that.clicked.index].aLoad.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", `${that.stationColor(that.clicked.StationNode.id)}`)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineAL);

        d3.select(".line-V")
            .datum(this.data.nodes[that.clicked.index].volt.slice(0,this.activeTime))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", `${that.stationColor(that.clicked.StationNode.id)}`)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineV);

        d3.select(".line-Bus")
            .datum(this.data.nodes[that.clicked.index].BusData.slice(0,this.activeTime).map(f=>f.total))
            .style("visibility","visible")
            .attr("fill", "none")
            .attr("stroke", `${that.stationColor(that.clicked.StationNode.id)}`)//d => that.stationColor(d.StationNode.id))
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", lineBus);

        //Line chart label
        d3.select(".chart-text")
            .style("visibility","visible")
            .text(`${that.clicked.StationName}`);

        
    }




    /**
     * Returns html that can be used to render the tooltip for nodes
     * @param data
     * @returns {string}
     */
    tooltipRenderN(data) {
        let that = this;
        let text = null;
        text = "<h3>" + data.StationName + " ("+ data.StationID +")</h3>";
        //Adds in relevant data
        text = text + "<p> BEB Count: "+ data.BusData[that.activeTime].total+ " busses</p>";
        text = text + "<p> Active Power : "+  parseFloat(data.chSP[that.activeTime].value).toFixed(2)+" kW</p>";
        return text;
    }

    tooltipRenderS(data,time) {
        time = this.activeTime;
        let that = this;
        let text = null;
        // console.log(data)
        text = "<h3>" + data.StationName + " ("+ data.StationNode.id +")</h3>";
        //Adds in relevant data
        text = text + "<p> BEB Count: "+ data.BusData[time].total+ " busses</p>";
        text = text + "<p> Active Power : "+  parseFloat(data.chSP[time].value).toFixed(2)+" kW</p>";
        text = text + "<p> Active Load : "+  parseFloat(data.aLoad[time].value).toFixed(2)+" kW</p>";
        text = text + "<p> Voltage : "+  parseFloat(data.volt[time].value).toFixed(2)+" kV</p>";
        return text;
    }

    //** Got the idea from: https://observablehq.com/@tmcw/d3-scalesequential-continuous-color-legend-example */
    scaleLegender(linearGradient,colorScale){

        linearGradient.selectAll("stop")
            .data(colorScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorScale(t) })))
            .enter().append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color)
    }
}