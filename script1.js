
function ternaryPlot(selector, userOpt ) {

	var plot = {
		dataset:[]
	};

	var opt = {
		width: $('#plot').width(),
		height:$(window).width() * .4,
		tickLabelMargin:10,
		axisLabelMargin:40,
		side:$(window).width() * .25,
		margin: {top:70,left:170,bottom:20,right:20},
		axis_labels:['Image File Graphic','Space Orbit Launch','God Christian People'],
		axis_ticks:d3.range(0, 101, 20),
		minor_axis_ticks:d3.range(0, 101, 5) }

	for(var o in userOpt){
		opt[o] = userOpt[o];
	}

	var svg = d3.select(selector).insert("svg",":nth-child(2)")
						.attr("width", opt.width)
                        .attr("height", opt.height);

	var axes = svg.append('g').attr('class','axes');

    var w = opt.side;
    var h = Math.sqrt( opt.side*opt.side - (opt.side/2)*(opt.side/2));

	var corners = [
		[opt.margin.left, h + opt.margin.top], // a
		[ w + opt.margin.left, h + opt.margin.top], //b 
		[(w/2) + opt.margin.left, opt.margin.top] ] //c

	//axis names
	axes.selectAll('.axis-title')
		.data(opt.axis_labels)
		.enter()
			.append('g')
				.attr('class', 'axis-title')
				.attr('transform',function(d,i){
					return 'translate('+corners[i][0]+','+corners[i][1]+')';
				})
				.append('text')
				.text(function(d){ return d; })
				.attr('text-anchor', function(d,i){
					if(i===0) return 'end';
					if(i===2) return 'middle';
					return 'start';
					
				})
				.attr('transform', function(d,i){
					var theta = 0;
					if(i===0) theta = 120;
					if(i===1) theta = 60;
					if(i===2) theta = -90;

					var x = opt.axisLabelMargin * Math.cos(theta * 0.0174532925),
						y = opt.axisLabelMargin * Math.sin(theta * 0.0174532925);
					return 'translate('+x+','+y+')'
				});


	//ticks
	//(TODO: this seems a bit verbose/ repetitive!);
	var n = opt.axis_ticks.length;
	if(opt.minor_axis_ticks){
		opt.minor_axis_ticks.forEach(function(v) {	
			var coord1 = coord( [v, 0, 100-v] );
			var coord2 = coord( [v, 100-v, 0] );
			var coord3 = coord( [0, 100-v, v] );
			var coord4 = coord( [100-v, 0, v] );

			axes.append("line")
				.attrs( lineAttributes(coord1, coord2) )
				.classed('a-axis minor-tick', true);	

			axes.append("line")
				.attrs( lineAttributes(coord2, coord3) )
				.classed('b-axis minor-tick', true);	

			axes.append("line")
				.attrs( lineAttributes(coord3, coord4) )
				.classed('c-axis minor-tick', true);		
		});
	}

	opt.axis_ticks.forEach(function(v) {	
		var coord1 = coord( [v, 0, 100-v] );
		var coord2 = coord( [v, 100-v, 0] );
		var coord3 = coord( [0, 100-v, v] );
		var coord4 = coord( [100-v, 0, v] );

		axes.append("line")
			.attrs( lineAttributes(coord1, coord2) )
			.classed('a-axis tick', true);	

		axes.append("line")
			.attrs( lineAttributes(coord2, coord3) )
			.classed('b-axis tick', true);	

		axes.append("line")
			.attrs( lineAttributes(coord3, coord4) )
			.classed('c-axis tick', true);	


		//tick labels
		axes.append('g')
			.attr('transform',function(d){
				return 'translate(' + coord1[0] + ',' + coord1[1] + ')'
			})
			.append("text")
				.attr('transform','rotate(60)')
				.attr('text-anchor','end')
				.attr('x',-opt.tickLabelMargin)
				.text( function (d) { return v; } )
				.classed('a-axis tick-text', true );

		axes.append('g')
			.attr('transform',function(d){
				return 'translate(' + coord2[0] + ',' + coord2[1] + ')'
			})
			.append("text")
				.attr('transform','rotate(-60)')
				.attr('text-anchor','end')
				.attr('x',-opt.tickLabelMargin)
				.text( function (d) { return (100- v); } )
				.classed('b-axis tick-text', true);

		axes.append('g')
			.attr('transform',function(d){
				return 'translate(' + coord3[0] + ',' + coord3[1] + ')'
			})
			.append("text")
				.text( function (d) { return v; } )
				.attr('x',opt.tickLabelMargin)
				.classed('c-axis tick-text', true);
		$('#generate').css({
			top: $('#plot svg').offset().top + $('#plot svg').height() + 'px',
			left: '100px'
		});

	})

	function lineAttributes(p1, p2){
		return { x1:p1[0], y1:p1[1],
				 x2:p2[0], y2:p2[1] };
	}

	function coord(arr){
		var a = arr[0], b=arr[1], c=arr[2]; 
		var sum, pos = [0,0];
	    sum = a + b + c;
	    if(sum !== 0) {
		    a /= sum;
		    b /= sum;
		    c /= sum;
			pos[0] =  corners[0][0]  * a + corners[1][0]  * b + corners[2][0]  * c;
			pos[1] =  corners[0][1]  * a + corners[1][1]  * b + corners[2][1]  * c;
		}
	    return pos;
	}

	function scale(p, factor) {
	    return [p[0] * factor, p[1] * factor];
	}

	plot.data = function(data, accessor, bindBy){ //bind by is the dataset property used as an id for the join
		plot.dataset = data;

		var circles = svg.selectAll("circle")
			.data( data.map( function(d){ 
					xy = coord(accessor(d))
					return [xy[0], xy[1], d.raw_text,d[bindBy],d.clean_text,d.target,d.topic1,d.topic2,d.topic3, d.topic_names]; 
				}), function(d,i){
					if(bindBy){
						return plot.dataset[i][bindBy];
					}
					return i;
			} );

		circles.enter().append("circle").attr('id',function(d){ return d[3]; }).transition().attr("cx", function (d) { 
			return d[0]; 
		})
			.attr("cy", function (d) { 
				return d[1]; 
			})
			.attr("r", 10);

		return this;
	}

	plot.getPosition = coord;
	return plot;
}

//ACTIVATE!

function get_files() {
	num_circles = 10,
	num_json_docs = 1775,
	randoms = Array(num_circles);

	$(window).data({
		'file_objects':[],
		'index': 0
	});

	for(i=0;i<num_circles;i++) {
		randoms[i] = Math.floor(Math.random() * num_json_docs);
		file_name = '3_topics/doc_' + pad(randoms[i],4) + '.json';
		$.getJSON(file_name, function(data) {
			topics = data._topic;
			topics = [topics[0], topics[1], topics[2]];
			ratio = 100 / (topics[0] + topics[1] + topics[2]);
			for(j=0;j<topics.length;j++) 
				topics[j] = topics[j] * ratio;
			j = $(window).data('index');

			out = {
				topic1: topics[0],
				topic2: topics[1],
				topic3: topics[2],
				label: "point" + j,
				raw_text: data._raw_text,
				clean_text:data._clean_text,
				target: data._target,
				topic_names: data._topic_names
			}
			j++;
			$(window).data('index',j);
			arr = $(window).data('file_objects');
			arr.push(out);
			$(window).data('file_objects',arr);
			if(j == 10)
				launch_triangle();
		});
	}
}
$(function() {
	get_files();
	$('body').on('click',checkClick);
	$('#generate').on('click',function() {
		$('#plot svg').fadeOut(500).remove();
		$(window).data({
			'file_objects': new Array(10),
			'j': 0
		});
		get_files();
	});
});

function launch_triangle() {
	var tp = ternaryPlot( '#plot', {} )
		.data( $(window).data('file_objects')
			, function(d){ return [d.topic1, d.topic2, d.topic3]}, 'label');
		d3.select('#nextbutton').on('click', function(e){
			next(); d3.event.preventDefault(); });

		d3.selectAll('circle').on('click',addBlurb);
}

function addBlurb(e) {
	if($('.hover_box').length > 0)  
		remove_hover();

	id = '#' + e[3];
	el = $(id);
	
	t = el.offset().top - 50,
	left = el.offset().left,
	height = 50,
	width = 100,
	topic = e[5];

	html = '<div class=\'hover_box\'>' + topic + '</div>'
	$('body').append(html);
	$('.hover_box').css({
		'top': t + 'px',
		'left': left + 'px',
		//'height': height + 'px',
		//'width': width  + 'px',
		'display': 'block'
	});

	generate_bar(e);
}



function checkClick(e) {
	if($(e.target).is('circle') || $(e.target).is('.hover_box') || $(e.target).parents().is('#fax'))
		return;
	else 
		remove_hover();
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function remove_hover() {
	$('.hover_box').remove();
	$('#fax svg').empty();
	$('#raw_text, #target').empty();	
}


function generate_bar(e) {
	$('#fax svg').css('display','none').empty();
	var svg = d3.select("#fax svg"),
	  margin = {top: 40, right: 0, bottom: 30, left: 25},
	  width = $('#fax').width() - margin.left - margin.right,
	  height = +svg.attr("height") - margin.top - margin.bottom;

	var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
	  y = d3.scaleLinear().rangeRound([height, 0]);

	var g = svg.append("g")
	  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	data = [
		{
			topic: "Image File Graphic",
			frequency: e[6]
		},
		{
			topic: "Space Orbit Launch",
			frequency: e[7]
		},
		{
			topic: "God Christian People",
			frequency: e[8]
		}
	];

	x.domain(data.map(function(d) { return d.topic; }));
	y.domain([0, 100]);

	g.append("g")
	    .attr("class", "axis axis--x")
	    .attr("transform", "translate(0," + height + ")")
	    .call(d3.axisBottom(x));
	g.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .text("Topic Distributions");

	g.append("g")
	    .attr("class", "axis axis--y")
	    .call(d3.axisLeft(y).ticks(5))
	  .append("text")
	    .attr("transform", "rotate(-90)")
	    .attr("y", 6)
	    .attr("dy", "0.71em")
	    .attr("text-anchor", "end")
	    .text("Frequency");

	g.selectAll(".bar")
	  .data(data)
	  .enter().append("rect")
	    .attr("class", "bar")
	    .attr("x", function(d) { return x(d.topic); })
	    .attr("y", function(d) { return y(d.frequency); })
	    .attr("width", x.bandwidth())
	    .attr("height", function(d) { return height - y(d.frequency); });
	
	raw_text = '<b>Raw Text</b>: <br/>' + e[2];
	target = '<b>Target Topic</b>: <br/>' + e[5];
	
	$('#raw_text').html(raw_text);
	$('#target').html(target);
	$('#fax svg').fadeIn(500);
	
}