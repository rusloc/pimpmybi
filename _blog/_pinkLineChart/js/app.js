

async function draw() {
  // Data
  const _data = await d3.csv('assets/data.csv')

  const _dateParser = d3.timeParse('%Y/%m/%d')
  const _dateFormatter = d3.timeFormat('%d-%m-%y')

  const _xacc = d => _dateParser(d.date)
  const _yacc = d => parseFloat(d.close)

  const _tempWid = window.screen.width
  const _tempHei = window.screen.height

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet";
    }
    if (
      /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
      )
    ) {
      return "mobile";
    }
    return "desktop";
  };

  const _device = getDeviceType()

    let windowWidth = 0
  
        if (_device === "desktop") {
                windowWidth = _tempWid / 2
                            }
        else if (_device === "mobile") {
                windowWidth - 50
                            }
        else {
                windowWidth = _tempWid
        }

    let windowHeight = 0
  
        if (_device === "desktop") {
                windowHeight = _tempHei / 2
                            }
        else if (_device === "mobile") {
                windowHeight/2 - 50
                            }
        else {
                windowHeight = _tempHei
        }

    console.log(windowHeight)

  // Dimensions
  const dimensions = {
    width: windowWidth,
    height: windowHeight,
    marginX: function () {
        return d3.max([this.width * 0.12, 75])
    },
    marginY: function () {
        return d3.max([this.height * 0.14, 75])
    },
    xStart: function () {
        return this.marginX()
    },
    xEnd: function () {
        return this.width - this.marginX()
    },
    yStart: function () {
        return this.marginY()
    },
    yEnd: function () {
        return this.height - this.marginY()
    },
    xMid: function () {
        return this.width / 2
    },
    yMid: function () {
        return this.height / 2
    }
  };


        // x Scale  
    const _xScale = d3.scaleTime()
                  .domain(d3.extent(_data, _xacc))
                  .range([dimensions.xStart(), dimensions.xEnd()])

        // Y Scale
    const _yScale = d3.scaleLinear()
                    .domain(d3.extent(_data, _yacc))
                    .range([dimensions.yEnd(), dimensions.yStart()])

  // line generator
  const lineGen = d3.line()
                    .curve(d3.curveBundle.beta(1.1))
                    .x(d => _xScale(_xacc(d)))
                    .y(d => _yScale(_yacc(d)))


    // make SVG cont                  
  const _cont = d3.select('.chart')
                  .append('svg')
                  .classed('svg cont', true)
                  .attr('width', dimensions.width)
                  .attr('height', dimensions.height)

    const _lineGroup = _cont.append('g')
                            .classed('lineGroup', true)

    const _plot = _lineGroup.append('path')
                            .datum(_data)
                            .attr('d', lineGen)
                            .classed('line', true)            

    // x axes
    const xAxisGroup = _cont.append('g')
                            .style('transform', `translateY(${dimensions.yEnd() + 20}px)`)
                            .attr('stroke-width','1px')
                            .classed('xAxisGroup', true)

    const _xAxis = d3.axisBottom(_xScale)
    const _callX = xAxisGroup.call(_xAxis)
                              

    // y axes

    const yAxisGroup = _cont.append('g')
                            .style('transform', `translateX(${dimensions.xStart() - 20}px)`)
                            .attr('stroke-width','1px')
                            .classed('yAxisGroup', true)

    const _yAxis = d3.axisLeft(_yScale)
    const callY = yAxisGroup.call(_yAxis)

    const xLabel = _cont.append('text')
                        .text('DATE')
                        .classed('xlabel', true)
                        .style('transform', `translate(${dimensions.xMid()}px, ${dimensions.height -10}px)`)


    const yLabel = _cont.append('text')
                        .text('PRICE')
                        .classed('ylabel', true)
                        .attr('writing-mode','vertical-lr')
                        .style('transform', `translate(20px, ${dimensions.yMid()}px)`)

      // tooltip circle on line
    
    const lineSpot = _cont.append('circle')
                            .attr('r', 8 )
                            .classed('linespot', true)
                            .style('pointer-events', 'none')
                            .style('opacity',0)

    // tooltop box
    const tpBox = d3.select('#tooltip')


    // vertical line pointer
    const vline = _cont.append('line')
                        .classed('vline', true)

    const tpShape = _cont.append('rect')
                        .attr('width', dimensions.width)
                        .attr('height', dimensions.height)
                        .style('opacity',0)
                        .classed('tpCoveredShape', true)
                        .on('mousemove mouseover tap', function (e) {
                                            const mousePos = d3.pointer(e, this)
                                            const date = _xScale.invert(mousePos[0])

                                            // custom Bisector
                                            const bisector = d3.bisector(_xacc).left
                                            const index = bisector(_data, date)
                                            const stock = _data[index-1]

                                            // tooltip box 
                                            tpBox.style('display', 'block')
                                                .style('top', _yScale(_yacc(stock)) - 20 + 'px')
                                                .style('left', _xScale(_xacc(stock)) + 5 + 'px')

                                            vline.attr('x1', _xScale(_xacc(stock)))
                                                .attr('y1',dimensions.yStart())
                                                .attr('x2', _xScale(_xacc(stock)))
                                                .attr('y2',dimensions.yEnd())

                                            tpBox.select('.price')
                                                    .text('PRICE: '+ _yacc(stock))
                                            
                                            tpBox.select('.date')
                                                    .text(_dateFormatter(_xacc(stock)))
                                        
                        })
                        .on('mouseleave', function (e) {
                                            tpBox.style('display', 'none')

                                            vline.attr('x1', 0)
                                            .attr('y1', 0)
                                            .attr('x2', 0)
                                            .attr('y2', 0)
                        })
  }

draw()
